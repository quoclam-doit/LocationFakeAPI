import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import xml2js from 'xml2js';

const app = express();
app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => res.json({ ok: true }));

// Proxy provinces API
app.get('/api/provinces', async (req, res) => {
  const depth = req.query.depth || 1;
  const r = await fetch(`https://provinces.open-api.vn/api/v1/?depth=${depth}`);
  const data = await r.json();
  res.json(data);
});

app.get('/api/provinces/:code', async (req, res) => {
  const depth = req.query.depth || 2;
  const r = await fetch(`https://provinces.open-api.vn/api/v1/p/${req.params.code}?depth=${depth}`);
  const data = await r.json();
  res.json(data);
});

app.get('/api/districts/:code', async (req, res) => {
  const depth = req.query.depth || 2;
  const r = await fetch(`https://provinces.open-api.vn/api/v1/d/${req.params.code}?depth=${depth}`);
  const data = await r.json();
  res.json(data);
});

// --- DistanceMatrix.ai test endpoint ---
app.get('/api/test-geocode', async (req, res) => {
  try {
    const address = (req.query.address || 'Hà Nội, Việt Nam').trim();
    if (!process.env.DISTANCEMATRIX_API_KEY) {
      return res.status(500).json({ message: 'Missing DISTANCEMATRIX_API_KEY in .env' });
    }

    const url = `https://api.distancematrix.ai/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${process.env.DISTANCEMATRIX_API_KEY}`;
    const r = await fetch(url);
    const data = await r.json();

    console.log('Geocode response:', JSON.stringify(data, null, 2));

    if (data.status !== 'OK') {
      return res.status(500).json({ message: 'API status not OK', raw: data });
    }

    if (data.results && data.results.length > 0) {
      const loc = data.results[0].geometry.location;
      return res.json({
        query: address,
        lat: loc.lat,
        lng: loc.lng,
        formatted: data.results[0].formatted_address
      });
    }

    return res.json({ query: address, raw: data });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Lỗi test geocoding' });
  }
});

// --- Endpoint chính cho FE ---
app.get('/api/geocode', async (req, res) => {
  try {
    const address = (req.query.address || '').trim();
    console.log(`🌍 GEOCODING REQUEST FOR ADDRESS: "${address}"`);
    if (!address) return res.status(400).json({ message: 'address is required' });
    if (!process.env.DISTANCEMATRIX_API_KEY) {
      return res.status(500).json({ message: 'Missing DISTANCEMATRIX_API_KEY in .env' });
    }
    const url = `https://api.distancematrix.ai/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${process.env.DISTANCEMATRIX_API_KEY}`;
    const r = await fetch(url);
    const data = await r.json();
    console.log('🌍 GEOCODING RESPONSE:', JSON.stringify(data, null, 2));
    const results = data.results || data.result;
    if (data.status !== 'OK' || !results?.length) {
      return res.status(404).json({ message: 'Coordinates not found', raw: data });
    }
    const loc = results[0].geometry.location;
    return res.json({ lat: loc.lat, lng: loc.lng });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Geocoding error' });
  }
});

// --- CÁC BỘ NHỚ ĐỆM (CACHE) ---
const streetCache = new Map();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 phút cho cache đường phố

// TỐI ƯU 1: Cache riêng cho tên đơn vị hành chính (dữ liệu tĩnh, có thể cache lâu)
const adminNameCache = new Map();
const ADMIN_CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 1 ngày

// Map để lưu trữ các timeout của debouncer
const debounceTimeouts = new Map();

// --- Helper function to get administrative unit name from its code (ĐÃ TỐI ƯU) ---
async function getAdminName(code, type) {
  if (!code) return null;

  // TỐI ƯU 2: Kiểm tra cache trước khi gọi API
  const cacheKey = `${type}-${code}`;
  const cachedItem = adminNameCache.get(cacheKey);
  if (cachedItem && Date.now() - cachedItem.timestamp < ADMIN_CACHE_TTL_MS) {
    console.log(`🎯 ADMIN CACHE HIT for ${cacheKey}`);
    return cachedItem.name;
  }

  try {
    let url;
    if (type === 'province') {
      url = `https://provinces.open-api.vn/api/v1/p/${code}?depth=1`;
    } else if (type === 'district') {
      url = `https://provinces.open-api.vn/api/v1/d/${code}?depth=1`;
    } else if (type === 'ward') {
      url = `https://provinces.open-api.vn/api/v1/w/${code}?depth=1`;
    } else {
      return null;
    }
    const response = await fetch(url);
    if (!response.ok) {
      console.error(`❌ Failed to fetch ${type} name for code ${code}: ${response.statusText}`);
      return null;
    }
    const data = await response.json();
    const name = data.name || null;

    // Lưu vào cache sau khi lấy được
    if (name) {
      adminNameCache.set(cacheKey, { name, timestamp: Date.now() });
      console.log(`💾 Saved admin name to cache for ${cacheKey}`);
    }

    return name;
  } catch (error) {
    console.error(`❌ Error fetching ${type} name for code ${code}:`, error.message);
    return null;
  }
}

// --- Autocomplete streets using Nominatim + Overpass API (ĐÃ TỐI ƯU HIỆU SUẤT) ---
app.get('/api/autocomplete-streets', async (req, res) => {
  try {
    const { q, ward, district, province } = req.query;
    console.log('📍 Autocomplete request received:', { q, ward, district, province });

    if (!q || q.length < 2) {
      console.log('❌ Query too short');
      return res.json([]);
    }

    // TỐI ƯU 3: LÀM SẠCH VÀ KIỂM TRA CACHE NGAY LẬP TỨC
    const sanitizedQ = q.replace(/[^a-zA-Z0-9À-ỹ\s]/g, '').trim();
    if (!sanitizedQ) {
      console.log('❌ Sanitized query is empty');
      return res.json([]);
    }

    const cacheKey = `${sanitizedQ}-${district}-${province}`;
    const cachedItem = streetCache.get(cacheKey);
    if (cachedItem && Date.now() - cachedItem.timestamp < CACHE_TTL_MS) {
      console.log('🎯 STREET CACHE HIT! Returning cached result for:', cacheKey);
      return res.json(cachedItem.data); // TRẢ VỀ NGAY LẬP TỨC
    }

    console.log('🔍 CACHE MISS. Proceeding with debouncing...');

    // --- BƯỚC 1: DEBOUNCING (Chỉ chạy khi không có trong cache) ---
    const debounceKey = `${district}-${province}`;
    if (debounceTimeouts.has(debounceKey)) {
      clearTimeout(debounceTimeouts.get(debounceKey));
      console.log('⏭️ Cleared previous timeout for key:', debounceKey);
    }

    const newTimeout = setTimeout(async () => {
      console.log(`\n--- 🚀 DEBOUNCED REQUEST EXECUTED for q="${sanitizedQ}" ---`);
      debounceTimeouts.delete(debounceKey);

      // --- BƯỚC 2: LẤY TÊN ĐỊA ĐIỂM (Sẽ nhanh hơn nhờ cache) ---
      console.log('🔄 Translating admin codes to names...');
      const [provinceName, districtName, wardName] = await Promise.all([
        getAdminName(province, 'province'),
        getAdminName(district, 'district'),
        getAdminName(ward, 'ward')
      ]);
      console.log('✅ Translated names:', { provinceName, districtName, wardName });

      const addressParts = [wardName, districtName, provinceName, 'Việt Nam'].filter(Boolean);
      if (!provinceName) {
        console.log('❌ Could not determine province name, cannot proceed.');
        return res.json([]);
      }
      const address = addressParts.join(', ');
      console.log('🔍 Searching Nominatim for:', address);

      const nominatimUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1&addressdetails=1`;
      const nominatimResponse = await fetch(nominatimUrl, { headers: { 'User-Agent': 'Address-Selector-App/1.0' } });
      if (!nominatimResponse.ok) return res.json([]);

      const nominatimData = await nominatimResponse.json();
      if (!nominatimData.length || !nominatimData[0].boundingbox) return res.json([]);

      const [lat1, lat2, lon1, lon2] = nominatimData[0].boundingbox;
      let south = parseFloat(lat1), north = parseFloat(lat2), west = parseFloat(lon1), east = parseFloat(lon2);
      const maxSize = 0.5;
      if (north - south > maxSize) { const center = (north + south) / 2; south = center - maxSize / 2; north = center + maxSize / 2; }
      if (east - west > maxSize) { const center = (east + west) / 2; west = center - maxSize / 2; east = center + maxSize / 2; }
      const bboxStr = `${south},${west},${north},${east}`;
      console.log('📦 Final bbox:', bboxStr);

      // --- BƯỚC 3: GỌI OVERPASS API VÀ RETRY ---
      const overpassQuery = `[out:json][timeout:15];
      way["highway"]["name"~"${sanitizedQ}", i](${bboxStr});
      out tags;`;
      console.log('🌐 Overpass Query:', overpassQuery);

      let overpassData = null;
      let lastError = null;
      const maxRetries = 3;
      let baseDelay = 1000;

      for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
          console.log(`🚀 Attempt ${attempt + 1}/${maxRetries} to fetch Overpass API...`);
          const overpassResponse = await fetch('https://overpass-api.de/api/interpreter', {
            method: 'POST', body: overpassQuery, headers: { 'Content-Type': 'text/plain', 'User-Agent': 'Address-Selector-App/1.0' }
          });
          const responseText = await overpassResponse.text();
          if (!responseText.startsWith('{')) {
            throw new Error(`Received non-JSON response: ${responseText.substring(0, 100)}`);
          }
          overpassData = JSON.parse(responseText);
          console.log('✅ Overpass success on attempt', attempt + 1);
          break;
        } catch (error) {
          lastError = error;
          console.error(`❌ Attempt ${attempt + 1} failed:`, error.message);
          if (attempt < maxRetries - 1) {
            const delay = baseDelay * Math.pow(2, attempt);
            console.log(`⏳ Waiting ${delay / 1000} seconds before retrying...`);
            await new Promise(resolve => setTimeout(resolve, delay));
          }
        }
      }

      if (!overpassData) {
        console.error('💥 All Overpass attempts failed. Returning empty result.');
        return res.json([]);
      }

      // --- BƯỚC 4: XỬ LÝ KẾT QUẢ VÀ LƯU VÀO CACHE ---
      const streets = new Set();
      if (overpassData.elements) {
        console.log(`✅ Overpass returned ${overpassData.elements.length} matching ways.`);
        overpassData.elements.forEach(el => {
          if (el.tags && el.tags.name) {
            streets.add(el.tags.name);
          }
        });
      }

      const result = Array.from(streets).slice(0, 10);
      console.log('📤 Returning', result.length, 'suggestions:', result);

      streetCache.set(cacheKey, { data: result, timestamp: Date.now() });
      console.log('💾 Saved result to cache for key:', cacheKey);

      res.json(result);

    }, 400); // Debounce delay

    debounceTimeouts.set(debounceKey, newTimeout);
    console.log(`⏳ Debounced request for q="${sanitizedQ}" scheduled. Waiting...`);

  } catch (error) {
    console.error('💥 Autocomplete error:', error);
    res.json([]);
  }
});

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Server started on http://localhost:${port}`));