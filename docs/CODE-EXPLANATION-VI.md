# 📚 Giải Thích Code Chi Tiết

> Tài liệu này giải thích chi tiết cách hoạt động của từng phần code trong dự án, được viết bằng tiếng Việt để dễ hiểu cho học sinh.

## 📖 Mục Lục

1. [Backend Services](#backend-services)
2. [Backend Controllers](#backend-controllers)
3. [Frontend API Service](#frontend-api-service)
4. [Frontend Components](#frontend-components)
5. [Utilities](#utilities)

---

## 🔧 Backend Services

### 1. provinceService.js - Dịch vụ lấy dữ liệu địa chỉ

**Mục đích:** Xử lý việc lấy dữ liệu tỉnh, quận/huyện, phường/xã từ API công khai.

#### 📍 Hàm `getAllProvinces(depth)`

```javascript
async getAllProvinces(depth = 1) {
    try {
        // 📡 Bước 1: Gọi API để lấy danh sách tỉnh
        const response = await fetch(`${BASE_URL}/?depth=${depth}`);

        // ✅ Bước 2: Kiểm tra xem request có thành công không
        // response.ok = true nếu status code là 200-299
        if (!response.ok) throw new Error('Failed to fetch provinces');

        // 📦 Bước 3: Chuyển đổi response thành JSON và trả về
        return await response.json();
    } catch (error) {
        // ❌ Bước 4: Nếu có lỗi, log ra console và ném lỗi
        logger.error('Error fetching provinces', error);
        throw error;
    }
}
```

**Giải thích:**

- `async/await`: Cách viết code bất đồng bộ (chờ API trả về)
- `fetch()`: Hàm gọi HTTP request đến API
- `response.ok`: Kiểm tra status code có thành công không (200-299)
- `throw error`: Ném lỗi lên tầng trên (controller) để xử lý

**Ví dụ sử dụng:**

```javascript
const provinces = await provinceService.getAllProvinces(2);
// Trả về: [{ code: "01", name: "Hà Nội", districts: [...] }, ...]
```

#### 🏙️ Hàm `getProvinceByCode(code, depth)`

```javascript
async getProvinceByCode(code, depth = 2) {
    try {
        // 📡 Gọi API với mã tỉnh cụ thể (ví dụ: "01" = Hà Nội)
        const response = await fetch(`${BASE_URL}/p/${code}?depth=${depth}`);

        // ✅ Kiểm tra response
        if (!response.ok) throw new Error(`Failed to fetch province ${code}`);

        // 📦 Trả về dữ liệu tỉnh kèm danh sách quận/huyện
        return await response.json();
    } catch (error) {
        logger.error(`Error fetching province ${code}`, error);
        throw error;
    }
}
```

**Giải thích:**

- URL parameter: `/p/${code}` - Lấy tỉnh theo mã
- Query parameter: `?depth=${depth}` - Chọn độ sâu dữ liệu
  - `depth=1`: Chỉ lấy thông tin tỉnh
  - `depth=2`: Lấy tỉnh + danh sách quận/huyện

#### 💾 Hàm `getAdminName(code, type)` - Có Cache

```javascript
async getAdminName(code, type) {
    // ⚠️ Bước 1: Kiểm tra đầu vào
    if (!code) return null;

    // 💾 Bước 2: Kiểm tra cache trước (tối ưu performance)
    const cacheKey = `${type}-${code}`;  // Ví dụ: "province-01"
    const cachedName = adminNameCache.get(cacheKey);
    if (cachedName) {
        console.log('Lấy từ cache:', cachedName);
        return cachedName;
    }

    try {
        // 🔗 Bước 3: Xây dựng URL dựa vào type
        let url;
        switch (type) {
            case 'province':
                url = `${BASE_URL}/p/${code}?depth=1`;
                break;
            case 'district':
                url = `${BASE_URL}/d/${code}?depth=1`;
                break;
            case 'ward':
                url = `${BASE_URL}/w/${code}?depth=1`;
                break;
            default:
                return null; // Type không hợp lệ
        }

        // 📡 Bước 4: Gọi API
        const response = await fetch(url);
        if (!response.ok) return null;

        // 📦 Bước 5: Parse dữ liệu
        const data = await response.json();
        const name = data.name || null;

        // 💾 Bước 6: Lưu vào cache để lần sau dùng (không phải gọi API nữa)
        if (name) {
            adminNameCache.set(cacheKey, name);
            console.log('Đã lưu vào cache:', name);
        }

        return name;
    } catch (error) {
        console.error('Lỗi khi lấy tên:', error);
        return null;
    }
}
```

**Giải thích Cache:**

- **Cache** là bộ nhớ tạm để lưu dữ liệu đã lấy
- Lần đầu: Gọi API → Lưu vào cache
- Lần sau: Lấy từ cache → Nhanh hơn, không phải gọi API

**Ví dụ:**

```javascript
// Lần 1: Gọi API (chậm hơn)
const name1 = await provinceService.getAdminName("01", "province");
// → "Hà Nội" (từ API)

// Lần 2: Lấy từ cache (nhanh hơn)
const name2 = await provinceService.getAdminName("01", "province");
// → "Hà Nội" (từ cache, không gọi API)
```

---

### 2. geocodeService.js - Dịch vụ chuyển địa chỉ thành tọa độ

**Mục đích:** Chuyển đổi địa chỉ văn bản thành tọa độ (latitude, longitude) để hiển thị trên bản đồ.

#### 📍 Hàm `geocodeAddress(address)`

```javascript
async geocodeAddress(address) {
    // ⚠️ Bước 1: Kiểm tra đầu vào
    if (!address) {
        throw new Error('Address is required');
    }

    // 🔑 Bước 2: Kiểm tra API key
    if (!config.distanceMatrixApiKey) {
        throw new Error('DISTANCEMATRIX_API_KEY is not configured');
    }

    try {
        logger.info(`🌍 Đang chuyển địa chỉ thành tọa độ: "${address}"`);

        // 🔗 Bước 3: Xây dựng URL với địa chỉ đã encode
        // encodeURIComponent() = chuyển ký tự đặc biệt thành dạng URL-safe
        // Ví dụ: "Hà Nội" → "H%C3%A0%20N%E1%BB%99i"
        const url = `${GEOCODE_BASE_URL}?address=${encodeURIComponent(address)}&key=${config.distanceMatrixApiKey}`;

        // 📡 Bước 4: Gọi API Geocoding
        const response = await fetch(url);
        const data = await response.json();

        // 📦 Bước 5: Lấy results từ response
        // API có thể trả về 'results' hoặc 'result'
        const results = data.results || data.result;

        // ✅ Bước 6: Kiểm tra status và results
        if (data.status !== 'OK' || !results?.length) {
            logger.warning('Không tìm thấy tọa độ cho địa chỉ', address);
            throw new Error('Coordinates not found');
        }

        // 📍 Bước 7: Lấy tọa độ từ result đầu tiên
        const location = results[0].geometry.location;
        const coordinates = {
            lat: location.lat,  // Vĩ độ (latitude)
            lng: location.lng,  // Kinh độ (longitude)
        };

        logger.success('Chuyển đổi thành công:', coordinates);
        return coordinates;

    } catch (error) {
        logger.error('Lỗi khi geocoding:', error);
        throw error;
    }
}
```

**Giải thích Geocoding:**

- **Input:** "Hoàn Kiếm, Hà Nội" (địa chỉ văn bản)
- **Output:** `{ lat: 21.0285, lng: 105.8542 }` (tọa độ)
- **Dùng để:** Hiển thị điểm trên bản đồ

**Cấu trúc Response từ API:**

```javascript
{
  "status": "OK",
  "results": [
    {
      "formatted_address": "Hoàn Kiếm, Hà Nội, Việt Nam",
      "geometry": {
        "location": {
          "lat": 21.0285,
          "lng": 105.8542
        }
      }
    }
  ]
}
```

---

### 3. autocompleteService.js - Dịch vụ gợi ý địa chỉ

**Mục đích:** Cung cấp gợi ý tên đường khi người dùng đang gõ.

#### 🔍 Hàm `searchStreets(query, wardCode, districtCode, provinceCode)`

```javascript
async searchStreets(query, wardCode, districtCode, provinceCode) {
    // ⚠️ Bước 1: Yêu cầu ít nhất 2 ký tự
    if (!query || query.length < 2) {
        return []; // Trả về mảng rỗng, không phải lỗi
    }

    // 🔑 Bước 2: Kiểm tra API key
    if (!config.vietmapApiKey) {
        throw new Error('Vietmap API key is missing');
    }

    try {
        logger.info('📍 Yêu cầu autocomplete:', { query, district: districtCode });

        // 🏗️ Bước 3: Lấy tên tỉnh và quận để filter
        // Promise.all() = chạy 2 request song song (nhanh hơn chạy tuần tự)
        const [provinceName, districtName] = await Promise.all([
            provinceService.getAdminName(provinceCode, 'province'),
            provinceService.getAdminName(districtCode, 'district'),
        ]);

        // 🌏 Bước 4: Xây dựng filter theo địa lý
        // Format: "country:VN|administrative_area:Hoàn Kiếm"
        let components = 'country:VN'; // Luôn filter theo Việt Nam

        if (districtName) {
            // Ưu tiên quận (chi tiết hơn)
            components += `|administrative_area:${districtName}`;
        } else if (provinceName) {
            // Dự phòng dùng tỉnh nếu không có quận
            components += `|locality:${provinceName}`;
        }

        // 🔗 Bước 5: Xây dựng URL
        const url = `${VIETMAP_AUTOCOMPLETE_URL}?apikey=${config.vietmapApiKey}&text=${encodeURIComponent(query)}&components=${encodeURIComponent(components)}`;

        // 📡 Bước 6: Gọi API
        const response = await fetch(url);

        // ⚠️ Bước 7: Xử lý lỗi HTTP
        if (!response.ok) {
            logger.error('Vietmap API trả về lỗi');
            return [];
        }

        // 📄 Bước 8: Lấy response text
        const responseText = await response.text();

        if (!responseText) {
            logger.warning('Vietmap API trả về rỗng');
            return [];
        }

        // 📦 Bước 9: Parse JSON
        let data;
        try {
            data = JSON.parse(responseText);
        } catch (error) {
            logger.error('Không parse được JSON:', error);
            return [];
        }

        // 🔍 Bước 10: Lấy suggestions từ response
        // ⚠️ QUAN TRỌNG: Vietmap trả về array trực tiếp, KHÔNG wrap trong object
        if (Array.isArray(data) && data.length > 0) {
            // Map mỗi item thành tên đường
            // Thử lấy theo thứ tự: display > address > name
            const suggestions = data.map(item =>
                item.display || item.address || item.name
            );

            logger.success('📤 Trả về gợi ý:', suggestions);
            return suggestions;
        }

        // ℹ️ Không có kết quả
        logger.info('Không tìm thấy kết quả');
        return [];

    } catch (error) {
        logger.error('💥 Lỗi autocomplete:', error);
        throw error;
    }
}
```

**Cấu trúc Response từ Vietmap:**

```javascript
// ✅ ĐÚNG: API trả về array trực tiếp
[
  {
    display: "Phố Hàng Bạc",
    address: "Phố Hàng Bạc, Hoàn Kiếm, Hà Nội",
    ref_id: "...",
  },
  {
    display: "Phố Hàng Bông",
    address: "Phố Hàng Bông, Hoàn Kiếm, Hà Nội",
    ref_id: "...",
  },
];

// ❌ SAI: Không phải như này
// { predictions: [...] }
```

**Giải thích Flow:**

```
User gõ: "Hàng"
  ↓
searchStreets("Hàng", null, "001", "01")
  ↓
Lấy tên: provinceCode="01" → "Hà Nội", districtCode="001" → "Hoàn Kiếm"
  ↓
Filter: "country:VN|administrative_area:Hoàn Kiếm"
  ↓
Gọi Vietmap API với filter
  ↓
Nhận về: ["Phố Hàng Bạc", "Phố Hàng Bông", "Phố Hàng Buồm", ...]
  ↓
Hiển thị dropdown gợi ý cho user
```

---

## 🎮 Backend Controllers

### 1. addressController.js - Xử lý HTTP requests cho địa chỉ

**Mục đích:** Nhận requests từ frontend, gọi service, trả về response.

#### Vai trò của Controller trong MVC

```
Client (Browser)
    ↓ HTTP Request
Router (routes/addressRoutes.js)
    ↓ req, res, next
Controller (addressController.js)
    ↓ Gọi hàm service
Service (provinceService.js)
    ↓ Gọi API bên ngoài
External API
    ↓ Trả dữ liệu
Service → Controller → Router → Client
```

#### 🏙️ Hàm `getProvinces(req, res, next)`

```javascript
async getProvinces(req, res, next) {
    try {
        // 📥 Bước 1: Lấy query parameter từ URL
        // Ví dụ: /api/provinces?depth=2
        // req.query = { depth: "2" }
        const depth = parseInt(req.query.depth) || 1;
        // parseInt() = chuyển string thành số
        // || 1 = nếu không có thì dùng 1 (default value)

        // 🔄 Bước 2: Gọi service layer để lấy dữ liệu
        const provinces = await provinceService.getAllProvinces(depth);

        // 📤 Bước 3: Trả về JSON cho client
        res.json(provinces);
        // res.json() tự động:
        // - Set header: Content-Type: application/json
        // - Convert object thành JSON string
        // - Gửi response về client

    } catch (error) {
        // ⚠️ Bước 4: Nếu có lỗi, chuyển cho error handler
        next(error);
        // next(error) = chuyển lỗi cho middleware errorHandler
    }
}
```

**Giải thích Request/Response:**

**Request từ client:**

```javascript
// Frontend code
const response = await fetch("/api/provinces?depth=2");
const provinces = await response.json();
```

**Xử lý ở server:**

```javascript
// Controller nhận được:
req.query.depth = "2";

// Gọi service
const provinces = await provinceService.getAllProvinces(2);

// Trả về
res.json(provinces);
```

**Response về client:**

```javascript
// Status: 200 OK
// Content-Type: application/json
[
  {
    "code": "01",
    "name": "Hà Nội",
    "districts": [...]
  },
  ...
]
```

#### 🏙️ Hàm `getProvinceByCode(req, res, next)`

```javascript
async getProvinceByCode(req, res, next) {
    try {
        // 📥 Bước 1: Lấy URL parameter
        // Ví dụ: /api/provinces/01
        // req.params = { code: "01" }
        const { code } = req.params;
        // Destructuring: Lấy trường 'code' từ object req.params

        // 📥 Bước 2: Lấy query parameter
        // Ví dụ: /api/provinces/01?depth=2
        const depth = parseInt(req.query.depth) || 2;

        // 🔄 Bước 3: Gọi service
        const province = await provinceService.getProvinceByCode(code, depth);

        // 📤 Bước 4: Trả về JSON
        res.json(province);

    } catch (error) {
        next(error);
    }
}
```

**Phân biệt req.params vs req.query:**

```javascript
// URL: /api/provinces/01?depth=2

// req.params - Lấy từ path
// Định nghĩa trong route: router.get('/provinces/:code', ...)
const code = req.params.code; // "01"

// req.query - Lấy từ query string (sau dấu ?)
const depth = req.query.depth; // "2"
```

---

### 2. geocodeController.js - Xử lý requests cho geocoding

#### 📍 Hàm `geocode(req, res, next)`

```javascript
async geocode(req, res, next) {
    try {
        // 📥 Bước 1: Lấy và validate address parameter
        // Ví dụ: /api/geocode?address=Hoàn Kiếm, Hà Nội
        const address = req.query.address?.trim();
        // ?.trim() = Optional chaining + xóa khoảng trắng 2 đầu

        // ⚠️ Bước 2: Validate - Bắt buộc phải có address
        if (!address) {
            // Trả về lỗi 400 Bad Request
            return res.status(400).json({
                message: 'Address parameter is required'
            });
        }

        // 🔄 Bước 3: Gọi service để geocode
        const coordinates = await geocodeService.geocodeAddress(address);

        // 📤 Bước 4: Trả về tọa độ
        res.json(coordinates);
        // Response: { lat: 21.0285, lng: 105.8542 }

    } catch (error) {
        // 🎯 Bước 5: Xử lý lỗi cụ thể
        if (error.message === 'Coordinates not found') {
            // Trả về lỗi 404 Not Found
            return res.status(404).json({
                message: 'Coordinates not found for the given address'
            });
        }

        // ⚠️ Lỗi khác → chuyển cho error handler
        next(error);
    }
}
```

**HTTP Status Codes:**

- `200 OK`: Thành công
- `400 Bad Request`: Client gửi sai (thiếu tham số, sai format)
- `404 Not Found`: Không tìm thấy dữ liệu
- `500 Internal Server Error`: Lỗi server

**Ví dụ các trường hợp:**

```javascript
// ✅ Trường hợp 1: Thành công
// Request: GET /api/geocode?address=Hà Nội
// Response: 200 OK
{ "lat": 21.0285, "lng": 105.8542 }

// ❌ Trường hợp 2: Thiếu parameter
// Request: GET /api/geocode
// Response: 400 Bad Request
{ "message": "Address parameter is required" }

// ❌ Trường hợp 3: Không tìm thấy
// Request: GET /api/geocode?address=xyz123abc
// Response: 404 Not Found
{ "message": "Coordinates not found for the given address" }

// ❌ Trường hợp 4: Lỗi server
// Response: 500 Internal Server Error
{ "message": "Internal server error" }
```

#### 🔍 Hàm `autocompleteStreets(req, res, next)`

```javascript
async autocompleteStreets(req, res, next) {
    try {
        // 📥 Bước 1: Lấy các query parameters
        // Ví dụ: /api/autocomplete-streets?q=Hàng&district=001&province=01
        const { q: query, ward, district, province } = req.query;
        // Destructuring với rename: q → query

        // ⚠️ Bước 2: Validate - Yêu cầu ít nhất 2 ký tự
        if (!query || query.length < 2) {
            // Trả về mảng rỗng (không phải lỗi)
            return res.json([]);
        }

        // 🔄 Bước 3: Gọi service với filters
        const suggestions = await autocompleteService.searchStreets(
            query,
            ward,
            district,
            province
        );

        // 📤 Bước 4: Trả về mảng gợi ý
        res.json(suggestions);
        // Response: ["Phố Hàng Bạc", "Phố Hàng Bông", ...]

    } catch (error) {
        next(error);
    }
}
```

**Giải thích tại sao trả về [] thay vì lỗi:**

```javascript
// ❌ Nếu trả về lỗi 400
if (!query || query.length < 2) {
  return res.status(400).json({ message: "Query too short" });
}
// → Frontend phải xử lý lỗi, phức tạp hơn

// ✅ Trả về mảng rỗng
if (!query || query.length < 2) {
  return res.json([]);
}
// → Frontend nhận [], không hiện gợi ý, đơn giản hơn
```

---

## 🌐 Frontend API Service

### api.js - Lớp giao tiếp với Backend

**Mục đích:** Tạo một lớp trung gian giữa React components và Backend API.

#### Lợi ích của API Service Layer:

```javascript
// ❌ KHÔNG NÊN: Gọi fetch trực tiếp trong component
function MyComponent() {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/api/provinces")
      .then((res) => res.json())
      .then((data) => setData(data))
      .catch((err) => console.error(err));
  }, []);
}

// ✅ NÊN: Dùng API service
import { addressApi } from "./services/api";

function MyComponent() {
  const [data, setData] = useState([]);

  useEffect(() => {
    addressApi
      .getProvinces()
      .then((data) => setData(data))
      .catch((err) => console.error(err));
  }, []);
}
```

**Lợi ích:**

1. Code ngắn gọn hơn
2. Dễ thay đổi URL
3. Dễ thêm authentication
4. Dễ mock để test

#### 🛠️ Class ApiService

```javascript
class ApiService {
  constructor(baseURL = "") {
    this.baseURL = baseURL; // Lưu base URL
  }

  async request(endpoint, options = {}) {
    // 🔗 Bước 1: Xây dựng URL đầy đủ
    const url = `${this.baseURL}${endpoint}`;
    // Ví dụ: "http://localhost:5000" + "/api/provinces"

    try {
      // 📡 Bước 2: Gọi API
      const response = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          ...options.headers, // Merge với headers tùy chỉnh
        },
        ...options, // Spread các options khác (method, body, etc.)
      });

      // ⚠️ Bước 3: Kiểm tra lỗi HTTP
      if (!response.ok) {
        // Thử parse error message từ server
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || `HTTP Error: ${response.status}`);
      }

      // 📦 Bước 4: Parse và trả về JSON
      return await response.json();
    } catch (error) {
      // ❌ Log lỗi và ném lại
      console.error(`API Error on ${endpoint}:`, error);
      throw error;
    }
  }

  get(endpoint, params = {}) {
    // 🔗 Xây dựng query string
    // Ví dụ: { depth: 2, limit: 10 } → "depth=2&limit=10"
    const queryString = new URLSearchParams(params).toString();

    // Thêm query string vào URL nếu có
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;

    // Gọi request với method GET
    return this.request(url, { method: "GET" });
  }

  post(endpoint, data) {
    // Gọi request với method POST và JSON body
    return this.request(endpoint, {
      method: "POST",
      body: JSON.stringify(data), // Convert object thành JSON string
    });
  }
}
```

**Giải thích URLSearchParams:**

```javascript
// Tạo query string từ object
const params = { depth: 2, limit: 10, name: "Hà Nội" };
const queryString = new URLSearchParams(params).toString();
// → "depth=2&limit=10&name=H%C3%A0+N%E1%BB%99i"

// Tự động:
// - Encode ký tự đặc biệt (Hà Nội → H%C3%A0+N%E1%BB%99i)
// - Join bằng &
// - Format key=value
```

#### 🏛️ addressApi Object

```javascript
export const addressApi = {
  // Lấy tất cả tỉnh
  getProvinces: (depth = 1) => api.get("/api/provinces", { depth }),
  // Tương đương:
  // function getProvinces(depth = 1) {
  //     return api.get('/api/provinces', { depth: depth });
  // }

  // Lấy tỉnh theo mã
  getProvinceByCode: (code, depth = 2) =>
    api.get(`/api/provinces/${code}`, { depth }),

  // Lấy quận theo mã
  getDistrictByCode: (code, depth = 2) =>
    api.get(`/api/districts/${code}`, { depth }),
};
```

**Cách sử dụng trong React:**

```javascript
// 1. Import
import { addressApi } from "./services/api";

// 2. Gọi trong component
async function loadProvinces() {
  try {
    const provinces = await addressApi.getProvinces(2);
    console.log(provinces);
  } catch (error) {
    console.error("Lỗi:", error);
  }
}

// 3. Hoặc dùng trong useEffect
useEffect(() => {
  addressApi
    .getProvinces(1)
    .then((data) => setProvinces(data))
    .catch((err) => console.error(err));
}, []);
```

#### 🌍 geocodeApi Object

```javascript
export const geocodeApi = {
  // Chuyển địa chỉ thành tọa độ
  geocode: (address) => api.get("/api/geocode", { address }),
  // Gọi: geocodeApi.geocode("Hà Nội")
  // → GET /api/geocode?address=H%C3%A0+N%E1%BB%99i

  // Test geocoding
  testGeocode: (address) => api.get("/api/test-geocode", { address }),

  // Autocomplete đường phố
  autocompleteStreets: (params) => api.get("/api/autocomplete-streets", params),
  // Gọi: geocodeApi.autocompleteStreets({ q: "Hàng", district: "001" })
  // → GET /api/autocomplete-streets?q=Hàng&district=001
};
```

---

## 🎯 Tổng Kết Flow Hoàn Chỉnh

### Ví dụ: Lấy danh sách tỉnh

```
1. USER: Click button "Lấy tỉnh"
   ↓
2. REACT COMPONENT: Gọi addressApi.getProvinces(2)
   ↓
3. API SERVICE: api.get('/api/provinces', { depth: 2 })
   ↓
4. BROWSER: GET http://localhost:5000/api/provinces?depth=2
   ↓
5. EXPRESS ROUTER: Nhận request, route đến controller
   ↓
6. CONTROLLER: addressController.getProvinces(req, res, next)
   - Lấy depth từ req.query
   - Gọi provinceService.getAllProvinces(depth)
   ↓
7. SERVICE: provinceService.getAllProvinces(depth)
   - Gọi fetch() đến API bên ngoài
   ↓
8. EXTERNAL API: provinces.open-api.vn
   - Trả về JSON data
   ↓
9. SERVICE: Parse JSON, return về controller
   ↓
10. CONTROLLER: res.json(provinces)
   ↓
11. EXPRESS: Gửi HTTP response về browser
   ↓
12. API SERVICE: Parse response.json()
   ↓
13. REACT COMPONENT: Nhận data, setState(provinces)
   ↓
14. USER: Thấy danh sách tỉnh trên màn hình
```

### Ví dụ: Autocomplete đường phố

```
1. USER: Gõ "Hàng" vào ô Street
   ↓
2. REACT: onChange event → debounce (chờ 300ms)
   ↓
3. REACT: Gọi geocodeApi.autocompleteStreets({
       q: "Hàng",
       district: "001",
       province: "01"
   })
   ↓
4. API SERVICE: GET /api/autocomplete-streets?q=Hàng&district=001&province=01
   ↓
5. CONTROLLER: geocodeController.autocompleteStreets
   - Validate query (ít nhất 2 ký tự)
   - Gọi autocompleteService.searchStreets()
   ↓
6. SERVICE: autocompleteService.searchStreets
   - Lấy tên quận: "Hoàn Kiếm"
   - Lấy tên tỉnh: "Hà Nội"
   - Build filter: "country:VN|administrative_area:Hoàn Kiếm"
   - Gọi Vietmap API
   ↓
7. VIETMAP API: Trả về array suggestions
   [
     { display: "Phố Hàng Bạc", ... },
     { display: "Phố Hàng Bông", ... },
     ...
   ]
   ↓
8. SERVICE: Map ra array tên đường
   ["Phố Hàng Bạc", "Phố Hàng Bông", ...]
   ↓
9. CONTROLLER: res.json(suggestions)
   ↓
10. REACT: Nhận array, setState(suggestions)
   ↓
11. REACT: Render dropdown với suggestions
   ↓
12. USER: Thấy danh sách gợi ý, chọn một cái
```

---

## 📝 Thuật Ngữ Quan Trọng

| Thuật ngữ           | Tiếng Việt                   | Giải thích                                           |
| ------------------- | ---------------------------- | ---------------------------------------------------- |
| **API**             | Giao diện lập trình ứng dụng | Cách các chương trình giao tiếp với nhau             |
| **Endpoint**        | Điểm cuối                    | URL để gọi một chức năng cụ thể (VD: /api/provinces) |
| **Request**         | Yêu cầu                      | Client gửi yêu cầu lên server                        |
| **Response**        | Phản hồi                     | Server trả về dữ liệu cho client                     |
| **Query parameter** | Tham số truy vấn             | Tham số trong URL sau dấu ? (VD: ?depth=2)           |
| **URL parameter**   | Tham số URL                  | Tham số trong path (VD: /provinces/:code)            |
| **HTTP Method**     | Phương thức HTTP             | GET, POST, PUT, DELETE                               |
| **Status code**     | Mã trạng thái                | 200=OK, 404=Not Found, 500=Error                     |
| **JSON**            | JavaScript Object Notation   | Format dữ liệu dạng text                             |
| **Parse**           | Phân tích                    | Chuyển JSON string thành object                      |
| **Async/Await**     | Bất đồng bộ                  | Chờ kết quả từ API trước khi tiếp tục                |
| **Promise**         | Lời hứa                      | Đối tượng đại diện cho kết quả tương lai             |
| **Cache**           | Bộ nhớ đệm                   | Lưu dữ liệu tạm để dùng lại                          |
| **Geocoding**       | Mã hóa địa lý                | Chuyển địa chỉ thành tọa độ                          |
| **Autocomplete**    | Tự động hoàn thành           | Gợi ý khi đang gõ                                    |
| **Debounce**        | Trì hoãn                     | Chờ user ngừng gõ rồi mới xử lý                      |

---

## 🚀 Tips Học Tập

### 1. Đọc code từ trên xuống

- Đọc từ comment header để hiểu mục đích
- Xem tên hàm để biết chức năng
- Đọc từng bước trong hàm

### 2. Thử nghiệm với console.log()

```javascript
async function test() {
  console.log("1. Bắt đầu");

  const provinces = await provinceService.getAllProvinces();
  console.log("2. Đã lấy được:", provinces);

  return provinces;
}
```

### 3. Dùng Chrome DevTools

- **Network tab**: Xem requests/responses
- **Console tab**: Xem logs và errors
- **Sources tab**: Debug với breakpoints

### 4. Học theo thứ tự

1. Hiểu cách gọi API (fetch, async/await)
2. Hiểu cấu trúc MVC (Model-View-Controller)
3. Hiểu flow từ frontend đến backend
4. Thực hành tạo endpoints mới

### 5. Tài liệu tham khảo

- MDN Web Docs (Mozilla): https://developer.mozilla.org
- Express.js: https://expressjs.com
- React: https://react.dev

---

## ❓ Câu Hỏi Thường Gặp

### Q1: Tại sao phải dùng async/await?

**A:** Vì gọi API mất thời gian (network delay). Async/await giúp code đợi kết quả trước khi tiếp tục.

```javascript
// ❌ KHÔNG DÙNG AWAIT: Sai!
function wrong() {
  const data = fetch("/api/provinces"); // data là Promise, không phải kết quả
  console.log(data); // Promise { <pending> }
}

// ✅ DÙNG AWAIT: Đúng!
async function correct() {
  const response = await fetch("/api/provinces"); // Đợi response
  const data = await response.json(); // Đợi parse JSON
  console.log(data); // [{ code: "01", name: "Hà Nội" }, ...]
}
```

### Q2: Khác biệt giữa Service và Controller?

**A:**

- **Service**: Xử lý logic nghiệp vụ (gọi API, tính toán, cache)
- **Controller**: Xử lý HTTP (nhận request, trả response)

```javascript
// CONTROLLER: Xử lý HTTP
async getProvinces(req, res) {
    const depth = req.query.depth; // Lấy từ request
    const provinces = await service.getAllProvinces(depth); // Gọi service
    res.json(provinces); // Trả về response
}

// SERVICE: Xử lý logic
async getAllProvinces(depth) {
    const response = await fetch(`${URL}?depth=${depth}`); // Gọi API
    return await response.json(); // Parse và return
}
```

### Q3: Tại sao cần Cache?

**A:** Để tránh gọi API nhiều lần cho cùng một dữ liệu.

```javascript
// KHÔNG CÓ CACHE: Gọi API mỗi lần
getAdminName("01"); // Gọi API → "Hà Nội"
getAdminName("01"); // Gọi API lại → "Hà Nội" (lãng phí!)
getAdminName("01"); // Gọi API lại → "Hà Nội" (chậm!)

// CÓ CACHE: Gọi API 1 lần, lưu lại
getAdminName("01"); // Gọi API → "Hà Nội" → Lưu cache
getAdminName("01"); // Lấy từ cache → "Hà Nội" (nhanh!)
getAdminName("01"); // Lấy từ cache → "Hà Nội" (tiết kiệm!)
```

### Q4: req.params vs req.query là gì?

**A:**

```javascript
// URL: /api/provinces/01?depth=2&limit=10

// req.params - Lấy từ path (/:code)
req.params.code; // "01"

// req.query - Lấy từ query string (?key=value)
req.query.depth; // "2"
req.query.limit; // "10"
```

### Q5: Tại sao dùng arrow function?

**A:** Arrow function ngắn gọn hơn, phù hợp cho callback và methods.

```javascript
// Function thông thường
const api = {
  getProvinces: function (depth) {
    return api.get("/api/provinces", { depth: depth });
  },
};

// Arrow function (ngắn gọn hơn)
const api = {
  getProvinces: (depth) => api.get("/api/provinces", { depth }),
};
```

---

## 🎓 Bài Tập Thực Hành

### Bài 1: Thêm endpoint lấy ward theo mã

**Yêu cầu:** Tạo endpoint GET /api/wards/:code

<details>
<summary>Gợi ý</summary>

1. Thêm vào `provinceService.js`:

```javascript
async getWardByCode(code) {
    const response = await fetch(`${BASE_URL}/w/${code}`);
    if (!response.ok) throw new Error(`Failed to fetch ward ${code}`);
    return await response.json();
}
```

2. Thêm vào `addressController.js`:

```javascript
async getWardByCode(req, res, next) {
    try {
        const { code } = req.params;
        const ward = await provinceService.getWardByCode(code);
        res.json(ward);
    } catch (error) {
        next(error);
    }
}
```

3. Thêm route vào `addressRoutes.js`:

```javascript
router.get("/wards/:code", addressController.getWardByCode);
```

</details>

### Bài 2: Thêm cache cho getAllProvinces

**Yêu cầu:** Lưu kết quả getAllProvinces vào cache

<details>
<summary>Gợi ý</summary>

```javascript
const provincesCache = new Cache(60 * 60 * 1000); // 1 giờ

async getAllProvinces(depth = 1) {
    const cacheKey = `provinces-${depth}`;

    // Kiểm tra cache
    const cached = provincesCache.get(cacheKey);
    if (cached) return cached;

    // Gọi API
    const response = await fetch(`${BASE_URL}/?depth=${depth}`);
    const data = await response.json();

    // Lưu cache
    provincesCache.set(cacheKey, data);

    return data;
}
```

</details>

### Bài 3: Thêm validation cho autocomplete

**Yêu cầu:** Không cho phép query có ký tự đặc biệt

<details>
<summary>Gợi ý</summary>

```javascript
async autocompleteStreets(req, res, next) {
    const { q: query } = req.query;

    // Validate độ dài
    if (!query || query.length < 2) {
        return res.json([]);
    }

    // Validate ký tự (chỉ cho phép chữ cái, số, khoảng trắng)
    const validPattern = /^[a-zA-ZÀ-ỹ0-9\s]+$/;
    if (!validPattern.test(query)) {
        return res.status(400).json({
            message: 'Query chứa ký tự không hợp lệ'
        });
    }

    // Tiếp tục xử lý...
}
```

</details>

---

**Tác giả:** Lý Quốc Lâm
**Ngày cập nhật:** 2025-10-08  
**Phiên bản:** 1.0
