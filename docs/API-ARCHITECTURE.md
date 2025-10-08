# 🌐 API Architecture: Client-Side vs Server-Side

## 📋 Tổng quan

Khi làm việc với API bên thứ 3, có 2 cách tiếp cận chính:

1. **Gọi trực tiếp từ Client** (Browser/Frontend)
2. **Gọi qua Server Proxy** (Backend làm trung gian)

---

## 🎯 So sánh 2 cách tiếp cận

### 1️⃣ GỌI TRỰC TIẾP TỪ CLIENT (Client-Side API Calls)

#### 📐 Kiến trúc

```
Client (Browser) → Third-party API → Client
```

#### 💻 Ví dụ code

```javascript
// React Component
const fetchProvinces = async () => {
  const response = await fetch("https://provinces.open-api.vn/api/v1/?depth=1");
  const data = await response.json();
  return data;
};
```

#### ✅ Ưu điểm

- ✨ **Đơn giản**: Không cần setup backend
- ⚡ **Nhanh**: Ít hơn 1 hop network
- 💰 **Tiết kiệm**: Không cần chi phí hosting server
- 🚀 **Phát triển nhanh**: Phù hợp cho prototype/MVP
- 📦 **Deploy dễ**: Static hosting (Vercel, Netlify, GitHub Pages)

#### ❌ Nhược điểm

- 🚨 **BẢO MẬT**: API key bị lộ trên client (DevTools)
- 🚫 **Không kiểm soát**: Không quản lý được rate limiting
- 💾 **Không cache**: Mỗi lần request đều gọi API
- ⚠️ **CORS**: Phụ thuộc vào API support CORS
- 🐛 **Error handling**: Khó quản lý centralized
- 📊 **Không audit**: Không log/monitor được
- 🔄 **Khó migrate**: Thay đổi API phải sửa nhiều nơi

#### 🎯 Khi nào nên dùng?

- ✅ API public không yêu cầu authentication
- ✅ Prototype/Demo nhanh
- ✅ Pet project/Learning project
- ✅ API đã support CORS tốt
- ✅ Không quan tâm security/analytics

---

### 2️⃣ GỌI QUA SERVER PROXY (Server-Side API Calls)

#### 📐 Kiến trúc

```
Client → Your Backend Server → Third-party API → Your Server → Client
```

#### 💻 Ví dụ code

**Backend (Express):**

```javascript
// server/src/routes/addressRoutes.js
app.get("/api/provinces", async (req, res) => {
  try {
    // Check cache first
    const cached = cache.get("provinces");
    if (cached) return res.json(cached);

    // Fetch from third-party API
    const response = await fetch(
      "https://provinces.open-api.vn/api/v1/?depth=1"
    );
    const data = await response.json();

    // Cache for 24 hours
    cache.set("provinces", data);

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch provinces" });
  }
});
```

**Frontend (React):**

```javascript
// client/src/services/api.js
const fetchProvinces = async () => {
  const response = await fetch("/api/provinces");
  return response.json();
};
```

#### ✅ Ưu điểm

- 🔐 **BẢO MẬT**: API key ẩn trong server (.env)
- 💾 **CACHE**: Giảm số lần gọi API, tăng tốc độ
- 🎛️ **KIỂM SOÁT**: Rate limiting, quota management
- 🔄 **TRANSFORM DATA**: Normalize/format data theo ý muốn
- 🛡️ **ERROR HANDLING**: Centralized, consistent
- 📊 **LOGGING/MONITORING**: Track usage, debug dễ
- 🔌 **DỄ MIGRATE**: Đổi API chỉ cần sửa server
- 🧪 **MOCK DATA**: Test dễ dàng với fake data
- 🌐 **NO CORS**: Server-to-server không bị CORS
- 💼 **BUSINESS LOGIC**: Thêm validation, authorization

#### ❌ Nhược điểm

- 🏗️ **Phức tạp hơn**: Cần setup backend infrastructure
- ⏱️ **Độ trễ**: Thêm 1 hop network (~50-200ms)
- 💰 **Chi phí**: Hosting server (AWS, Heroku, DigitalOcean)
- 🔧 **Bảo trì**: Cần maintain thêm server code
- 📈 **Scaling**: Cần xử lý load balancing khi scale

#### 🎯 Khi nào nên dùng?

- ✅ API yêu cầu authentication/API key
- ✅ Production application
- ✅ Cần cache để tối ưu performance
- ✅ Cần kiểm soát cost/rate limiting
- ✅ Cần transform/validate data
- ✅ Cần logging/monitoring
- ✅ App có backend sẵn

---

## 🔍 Phân tích cụ thể cho các API trong project

### 📍 **1. Provinces API** (`provinces.open-api.vn`)

#### Đặc điểm:

- ✅ Public API (không cần API key)
- ✅ Free, unlimited
- ✅ CORS-friendly
- ✅ Stable, reliable

#### Có thể gọi trực tiếp từ client?

**✅ CÓ** - Nhưng vẫn nên qua server

#### Lý do nên qua server:

```javascript
// ✅ Benefits của proxy:
1. Cache 24h → Giảm load cho API bên thứ 3
2. Transform data → Sort by name, normalize structure
3. Consistent error handling
4. Easy to mock data for testing
5. Dễ thay đổi sang API khác nếu cần
```

#### Ví dụ so sánh:

**Client-only:**

```javascript
// Mỗi user load page = 1 API call
// 1000 users = 1000 API calls
const provinces = await fetch(
  "https://provinces.open-api.vn/api/v1/?depth=1"
).then((r) => r.json());
```

**Server Proxy:**

```javascript
// Server cache 24h
// 1000 users trong 24h = chỉ 1 API call
const provinces = await fetch("/api/provinces").then((r) => r.json());
```

---

### 🗺️ **2. DistanceMatrix.ai API** (Geocoding)

#### Đặc điểm:

- 🚨 Yêu cầu API key
- 💰 Có rate limit (100 requests/day free)
- 💵 Có cost per request
- 🔒 Cần bảo mật

#### Có thể gọi trực tiếp từ client?

**❌ KHÔNG** - Bắt buộc phải qua server

#### Lý do:

```javascript
// ❌ NGUY HIỂM - API key lộ ra
const response = await fetch(
  `https://api.distancematrix.ai/maps/api/geocode/json?key=${API_KEY}&address=...`
);
// → Mở DevTools → Network tab → Thấy API key
// → Copy API key → Abuse → Hết quota/tiền

// ✅ AN TOÀN - Key ở server
const response = await fetch(`/api/geocode?address=...`);
```

#### Security Risk Demo:

```javascript
// Client-side code
const API_KEY = "abc123xyz"; // ← Ai cũng xem được

// Kẻ xấu có thể:
1. Copy API key từ DevTools
2. Dùng key của bạn cho project của họ
3. Spam requests → Hết quota/tiền
4. Bạn phải trả tiền cho usage của kẻ khác!
```

---

### 🇻🇳 **3. Vietmap API** (Autocomplete)

#### Đặc điểm:

- 🚨 Yêu cầu API key
- 💰 Có rate limit
- 🔒 Cần bảo mật

#### Có thể gọi trực tiếp từ client?

**❌ KHÔNG** - Bắt buộc phải qua server

#### Lý do tương tự DistanceMatrix.ai

---

## 📊 Bảng so sánh tổng hợp

| Tiêu chí              | Client-Side        | Server-Side Proxy  |
| --------------------- | ------------------ | ------------------ |
| **Security**          | ❌ API key lộ      | ✅ API key an toàn |
| **Caching**           | ❌ Không cache     | ✅ Cache được      |
| **Rate Limiting**     | ❌ Không kiểm soát | ✅ Kiểm soát tốt   |
| **Error Handling**    | ❌ Scattered       | ✅ Centralized     |
| **Logging**           | ❌ Không có        | ✅ Có đầy đủ       |
| **Transform Data**    | ❌ Khó             | ✅ Dễ dàng         |
| **CORS Issues**       | ⚠️ Có thể có       | ✅ Không có        |
| **Development Speed** | ✅ Nhanh           | ⚠️ Chậm hơn        |
| **Complexity**        | ✅ Đơn giản        | ⚠️ Phức tạp        |
| **Cost**              | ✅ Rẻ              | ⚠️ Chi phí hosting |
| **Scalability**       | ⚠️ Giới hạn        | ✅ Tốt             |
| **Maintenance**       | ✅ Ít              | ⚠️ Nhiều hơn       |

---

## 🎯 Quyết định cho từng loại API

### ✅ **Provinces API** - CÓ THỂ CHỌN

#### Option A: Client-Side (Đơn giản)

```javascript
// Pros: Đơn giản, nhanh
// Cons: Không cache, không kiểm soát

const provinces = await fetch(
  "https://provinces.open-api.vn/api/v1/?depth=1"
).then((r) => r.json());
```

#### Option B: Server Proxy (Recommended)

```javascript
// Pros: Cache, kiểm soát, professional
// Cons: Phức tạp hơn một chút

const provinces = await fetch("/api/provinces").then((r) => r.json());
```

**Khuyến nghị:** ✅ **Dùng Server Proxy** (Option B)

- Cache 24h tiết kiệm băng thông
- Dữ liệu tỉnh/thành ít thay đổi
- Consistent với các API khác

---

### 🔒 **DistanceMatrix.ai** - BẮT BUỘC SERVER

```javascript
// ❌ NEVER DO THIS
const coords = await fetch(`https://api.distancematrix.ai/...?key=${API_KEY}`);

// ✅ ALWAYS DO THIS
const coords = await fetch("/api/geocode?address=...");
```

**Lý do:** API key phải được bảo mật!

---

### 🔒 **Vietmap API** - BẮT BUỘC SERVER

```javascript
// ❌ NEVER DO THIS
const suggestions = await fetch(
  `https://maps.vietmap.vn/api/autocomplete/v3?apikey=${API_KEY}`
);

// ✅ ALWAYS DO THIS
const suggestions = await fetch("/api/autocomplete-streets?q=...");
```

**Lý do:** API key phải được bảo mật!

---

## 💡 Best Practices

### 1. **API Key Management**

```javascript
// ❌ BAD - Hardcode trong code
const API_KEY = "abc123xyz";

// ❌ BAD - Trong client ENV
// .env.local (React)
VITE_API_KEY = abc123xyz; // ← Vẫn lộ trên browser!

// ✅ GOOD - Server ENV
// server/.env
DISTANCEMATRIX_API_KEY = abc123xyz;
VIETMAP_API_KEY = xyz789abc;

// Access trong server code
const apiKey = process.env.DISTANCEMATRIX_API_KEY;
```

### 2. **Caching Strategy**

```javascript
// Server-side cache
const cache = new Map();
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

app.get("/api/provinces", async (req, res) => {
  const cached = cache.get("provinces");
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return res.json(cached.data);
  }

  const data = await fetchFromAPI();
  cache.set("provinces", { data, timestamp: Date.now() });
  res.json(data);
});
```

### 3. **Error Handling**

```javascript
// Centralized error handling
app.get("/api/geocode", async (req, res) => {
  try {
    const data = await geocodeService.geocode(req.query.address);
    res.json(data);
  } catch (error) {
    logger.error("Geocoding failed", error);
    res.status(500).json({
      success: false,
      message: "Unable to geocode address",
      // Don't expose internal errors to client
    });
  }
});
```

### 4. **Rate Limiting**

```javascript
import rateLimit from "express-rate-limit";

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});

app.use("/api/geocode", limiter);
```

---

## 🏗️ Architecture Recommendations

### 🎯 **Cho Production App (Recommended)**

```
┌─────────────┐
│   Client    │
│  (React)    │
└──────┬──────┘
       │ /api/provinces
       │ /api/geocode
       │ /api/autocomplete
       ↓
┌─────────────┐
│ Your Server │ ← API Keys here (secure)
│  (Express)  │ ← Cache here
│             │ ← Rate limiting
└──────┬──────┘
       │
       ├──→ provinces.open-api.vn (Public)
       ├──→ api.distancematrix.ai (Protected)
       └──→ maps.vietmap.vn (Protected)
```

**Benefits:**

- 🔐 Security
- 💾 Performance (cache)
- 📊 Monitoring
- 🎛️ Control

---

### 🚀 **Cho Prototype/MVP (Simple)**

```
┌─────────────┐
│   Client    │
│  (React)    │
└──────┬──────┘
       │
       ├──→ provinces.open-api.vn (Direct - OK)
       │
       └──→ Your Server
            └──→ api.distancematrix.ai (Must proxy)
            └──→ maps.vietmap.vn (Must proxy)
```

**Trade-off:** Đơn giản hơn nhưng kém bảo mật/performance hơn

---

## 📝 Tóm tắt Quyết định

| API                   | Gọi trực tiếp? | Khuyến nghị        | Lý do              |
| --------------------- | -------------- | ------------------ | ------------------ |
| **Provinces API**     | ✅ Có thể      | 🟡 Nên qua server  | Cache, consistency |
| **DistanceMatrix.ai** | ❌ Không       | 🔴 Bắt buộc server | API key security   |
| **Vietmap**           | ❌ Không       | 🔴 Bắt buộc server | API key security   |

---

## 🎓 Kết luận

### **TL;DR:**

1. **API không có key** (Provinces) → Có thể gọi trực tiếp, nhưng qua server tốt hơn
2. **API có key** (DistanceMatrix, Vietmap) → BẮT BUỘC phải qua server

### **Cách làm hiện tại của project:**

✅ **ĐÚNG & BEST PRACTICE** - Tất cả API đều qua server proxy

### **Lợi ích:**

- 🔐 Security
- 💾 Caching
- 📊 Monitoring
- 🎛️ Control
- 🔄 Maintainability
- 🚀 Scalability

**→ Không cần thay đổi gì! Architecture hiện tại là tối ưu! 🎯**

---

## 📚 Tài liệu tham khảo

- [OWASP API Security](https://owasp.org/www-project-api-security/)
- [REST API Best Practices](https://restfulapi.net/)
- [Express.js Proxy Pattern](https://expressjs.com/en/advanced/best-practice-performance.html)
- [API Gateway Pattern](https://microservices.io/patterns/apigateway.html)

---

**Created by:** Lý Quốc Lâm
**Date:** October 8, 2025  
**Project:** Location Selector Full-Stack App
