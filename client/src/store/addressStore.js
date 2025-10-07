// client/src/store/addressStore.js
import { create } from 'zustand';

// ——— Debounce nhỏ cho UX mượt ———
let debounceTimer;
const debounce = (fn, delay = 600) => (...args) => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => fn(...args), delay);
};

export const useAddressStore = create((set, get) => ({
  // DATA
  provinces: [],
  districts: [],
  wards: [],

  // SELECTION
  selectedProvince: null,
  selectedDistrict: null,
  selectedWard: null,
  street: '',

  // UI
  coordinates: null,
  loading: false,
  error: null,

  // Nếu KHÔNG dùng proxy Vite, có thể tạo client/.env: VITE_API_BASE=http://localhost:5000
  API: import.meta.env.VITE_API_BASE || '',

  // ===================== LOADERS (qua BACKEND PROXY) =====================

  // GET /api/provinces?depth=1
  loadProvinces: async () => {
    const API = get().API;
    set({ loading: true, error: null });
    try {
      const res = await fetch(`${API}/api/provinces?depth=1`);
      if (!res.ok) throw new Error('fetch provinces failed');
      const data = await res.json();
      set({ provinces: data.sort((a, b) => a.name.localeCompare(b.name)) });
    } catch (e) {
      set({ error: 'Không tải được danh sách tỉnh/thành' });
    } finally {
      set({ loading: false });
    }
  },

  // GET /api/provinces/:code?depth=2 => lấy quận/huyện
  selectProvince: async (provinceCode) => {
    const API = get().API;
    if (!provinceCode) {
      set({
        selectedProvince: null,
        districts: [],
        selectedDistrict: null,
        wards: [],
        selectedWard: null,
        street: '',
        coordinates: null,
      });
      return;
    }

    set({ loading: true, error: null });
    try {
      const res = await fetch(`${API}/api/provinces/${provinceCode}?depth=2`);
      if (!res.ok) throw new Error('fetch districts failed');
      const data = await res.json();
      set({
        selectedProvince: data,
        districts: (data.districts || []).sort((a, b) => a.name.localeCompare(b.name)),
        selectedDistrict: null,
        wards: [],
        selectedWard: null,
        street: '',
        coordinates: null,
      });
    } catch (e) {
      set({ error: 'Không tải được danh sách quận/huyện' });
    } finally {
      set({ loading: false });
    }
  },

  // GET /api/districts/:code?depth=2 => lấy phường/xã
  selectDistrict: async (districtCode) => {
    const API = get().API;
    if (!districtCode) {
      set({
        selectedDistrict: null,
        wards: [],
        selectedWard: null,
        street: '',
        coordinates: null,
      });
      return;
    }

    set({ loading: true, error: null });
    try {
      const res = await fetch(`${API}/api/districts/${districtCode}?depth=2`);
      if (!res.ok) throw new Error('fetch wards failed');
      const data = await res.json();
      set({
        selectedDistrict: data,
        wards: (data.wards || []).sort((a, b) => a.name.localeCompare(b.name)),
        selectedWard: null,
        street: '',
        coordinates: null,
      });
    } catch (e) {
      set({ error: 'Không tải được danh sách phường/xã' });
    } finally {
      set({ loading: false });
    }
  },

  selectWard: (wardCode) => {
    const ward = get().wards.find((w) => String(w.code) === String(wardCode));
    set({ selectedWard: ward || null, street: '', coordinates: null });
  },

  setStreet: (s) => set({ street: s }),

  // ===================== GEOCODING (DistanceMatrix.ai qua backend) =====================

  buildAddress: () => {
    const { selectedProvince, selectedDistrict, selectedWard, street } = get();
    const parts = [
      street?.trim(),                 // ví dụ: "337/2ThạchLam"
      selectedWard?.name,             // "Phường Phú Thạnh"
      selectedDistrict?.name,         // "Quận Tân Phú"
      selectedProvince?.name,         // "Thành phố Hồ Chí Minh"
      'Việt Nam',
    ].filter(Boolean);
    return parts.join(', ');
  },

  // Backend endpoint: GET /api/geocode?address=...
  geocodeRaw: async () => {
    const API = get().API;
    const address = get().buildAddress();

    if (!address) {
      set({ error: 'Vui lòng nhập địa chỉ/đường và chọn đủ khu vực' });
      return;
    }

    set({ loading: true, error: null });
    try {
      const res = await fetch(`${API}/api/geocode?address=${encodeURIComponent(address)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || 'geocode failed');
      // Server trả { lat, lng }
      set({ coordinates: data });
    } catch (e) {
      set({ error: 'Không tìm được toạ độ cho địa chỉ đã nhập', coordinates: null });
    } finally {
      set({ loading: false });
    }
  },

  geocode: debounce(() => get().geocodeRaw(), 700),

  // ===================== AUTOCOMPLETE STREETS =====================

  // Autocomplete streets using backend API
  autocompleteStreets: async (query, ward, district, province) => {
    const API = get().API;
    if (!query || query.length < 2) return [];
    
    try {
      const params = new URLSearchParams({
        q: query,
        ...(ward && { ward }),
        ...(district && { district }),
        ...(province && { province })
      });
      
      const res = await fetch(`${API}/api/autocomplete-streets?${params}`);
      if (!res.ok) throw new Error('Autocomplete failed');
      return await res.json();
    } catch (e) {
      console.error('Autocomplete error:', e);
      return [];
    }
  },
}));
