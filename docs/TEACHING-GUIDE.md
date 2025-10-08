# 🎓 Hướng dẫn sử dụng Project làm Demo giảng dạy API

## 🎯 Tại sao Project này phù hợp làm Demo?

### ✅ **1. Bao phủ đầy đủ kiến thức về API**

| Nội dung                  | Có trong project? | Vị trí                             |
| ------------------------- | ----------------- | ---------------------------------- |
| **REST API Basics**       | ✅                | GET endpoints                      |
| **API Authentication**    | ✅                | API Keys (DistanceMatrix, Vietmap) |
| **Client-side calls**     | ✅                | React components                   |
| **Server-side proxy**     | ✅                | Express backend                    |
| **Error Handling**        | ✅                | Middleware                         |
| **Caching**               | ✅                | Cache service                      |
| **Rate Limiting**         | ✅                | Custom implementation              |
| **CORS**                  | ✅                | Server config                      |
| **Environment Variables** | ✅                | .env files                         |
| **Async/Await**           | ✅                | Toàn bộ code                       |
| **Promise handling**      | ✅                | API services                       |

---

## 📚 Kế hoạch bài giảng (Lesson Plan)

### **Bài 1: API Basics & REST API** (60 phút)

#### 🎯 Mục tiêu

- Hiểu REST API là gì
- Biết các HTTP methods (GET, POST, PUT, DELETE)
- Biết cách đọc API documentation

#### 📝 Demo

```javascript
// 1. Show simple fetch
const response = await fetch("https://provinces.open-api.vn/api/v1/?depth=1");
const data = await response.json();
console.log(data);

// 2. Explain:
// - URL structure
// - Query parameters (?depth=1)
// - Response format (JSON)
```

#### 🔨 Hands-on

- Học viên test API bằng Postman/Thunder Client
- Xem response structure
- Thử thay đổi query parameters

---

### **Bài 2: Client-side API Calls** (90 phút)

#### 🎯 Mục tiêu

- Gọi API từ React
- Xử lý async/await
- Handle loading & error states

#### 📝 Demo

```javascript
// File: client/src/services/api.js
export const addressApi = {
  getProvinces: async (depth = 1) => {
    const response = await fetch(`/api/provinces?depth=${depth}`);
    return response.json();
  },
};

// File: client/src/components/ProvinceSelect.jsx
const [provinces, setProvinces] = useState([]);
const [loading, setLoading] = useState(false);

useEffect(() => {
  setLoading(true);
  addressApi
    .getProvinces()
    .then((data) => setProvinces(data))
    .catch((error) => console.error(error))
    .finally(() => setLoading(false));
}, []);
```

#### 🔨 Hands-on

- Tạo component gọi API
- Hiển thị loading spinner
- Handle error state

---

### **Bài 3: Server-side Proxy Pattern** (90 phút)

#### 🎯 Mục tiêu

- Hiểu tại sao cần server proxy
- Setup Express server
- Tạo API endpoints

#### 📝 Demo

```javascript
// File: server/src/routes/addressRoutes.js
router.get("/provinces", async (req, res) => {
  try {
    const depth = req.query.depth || 1;
    const response = await fetch(
      `https://provinces.open-api.vn/api/v1/?depth=${depth}`
    );
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch" });
  }
});
```

#### 🔨 Hands-on

- Tạo Express server đơn giản
- Tạo proxy endpoint
- Test với Postman

---

### **Bài 4: API Security & Best Practices** (90 phút)

#### 🎯 Mục tiêu

- Bảo mật API keys
- Environment variables
- Rate limiting
- Error handling

#### 📝 Demo

**1. API Key Security**

```javascript
// ❌ BAD - Lộ key
fetch(`https://api.service.com?key=abc123`);

// ✅ GOOD - Key ở server
// .env
VIETMAP_API_KEY = abc123;

// server.js
const apiKey = process.env.VIETMAP_API_KEY;
```

**2. Error Handling**

```javascript
// File: server/src/middlewares/errorHandler.js
export const errorHandler = (err, req, res, next) => {
  logger.error(err);
  res.status(500).json({
    success: false,
    message: "Internal server error",
  });
};
```

#### 🔨 Hands-on

- Setup .env file
- Implement error middleware
- Add input validation

---

### **Bài 5: Advanced Topics** (90 phút)

#### 🎯 Mục tiêu

- Caching strategies
- Rate limiting
- Monitoring & logging

#### 📝 Demo

**1. Caching**

```javascript
// File: server/src/utils/cache.js
class Cache {
  constructor(ttl) {
    this.cache = new Map();
    this.ttl = ttl;
  }

  set(key, value) {
    this.cache.set(key, {
      value,
      timestamp: Date.now(),
    });
  }

  get(key) {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() - item.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.value;
  }
}
```

**2. Logging**

```javascript
// File: server/src/utils/logger.js
export const logger = {
  info: (msg, data) => console.log(`ℹ️ [INFO] ${msg}`, data),
  error: (msg, error) => console.error(`❌ [ERROR] ${msg}`, error),
};
```

#### 🔨 Hands-on

- Implement cache
- Add logging
- Monitor API usage

---

## 🎬 Demo Flow (Từng bước)

### **Luồng 1: Client-side Only (Simple)**

```
1. Tạo React app đơn giản
2. Gọi provinces API trực tiếp
3. Hiển thị danh sách
4. ✅ Hoạt động!

5. Thử gọi DistanceMatrix API
6. ❌ Lỗi CORS
7. 💡 Giải thích: Tại sao cần server?
```

### **Luồng 2: Add Server Proxy**

```
1. Tạo Express server
2. Tạo endpoint /api/provinces
3. Proxy sang API bên thứ 3
4. Frontend đổi từ direct call → /api/provinces
5. ✅ Hoạt động!

6. Thêm DistanceMatrix endpoint
7. Giấu API key trong .env
8. ✅ An toàn!
```

### **Luồng 3: Add Features**

```
1. Thêm cache → Fast!
2. Thêm error handling → Robust!
3. Thêm logging → Monitor!
4. Thêm rate limiting → Control!
```

---

## 📊 Kịch bản giảng dạy cụ thể

### **Scenario 1: "Tại sao cần server?"**

#### Live Demo:

```javascript
// Bước 1: Show API key trong client
const API_KEY = "abc123"; // ← Mở DevTools → Network tab
fetch(`https://api.service.com?key=${API_KEY}`);
// → Học viên thấy key trong request

// Bước 2: Di chuyển sang server
// server.js
const API_KEY = process.env.API_KEY; // ← Không thấy trong DevTools
```

#### Câu hỏi tương tác:

- "Nếu API key lộ ra, điều gì sẽ xảy ra?"
- "Làm sao kẻ xấu có thể abuse API key của bạn?"

---

### **Scenario 2: "Cache để làm gì?"**

#### Live Demo:

```javascript
// Without cache
console.time("Request 1");
await fetch("/api/provinces");
console.timeEnd("Request 1"); // → 500ms

console.time("Request 2");
await fetch("/api/provinces");
console.timeEnd("Request 2"); // → 500ms

// With cache
console.time("Request 1");
await fetch("/api/provinces"); // Hit API
console.timeEnd("Request 1"); // → 500ms

console.time("Request 2");
await fetch("/api/provinces"); // From cache
console.timeEnd("Request 2"); // → 5ms ⚡
```

#### Metrics show:

- Performance improvement
- Reduced API calls
- Cost savings

---

### **Scenario 3: "Xử lý lỗi như thế nào?"**

#### Live Demo:

```javascript
// Bad error handling
const data = await fetch("/api/provinces").then((r) => r.json());
// ❌ Nếu lỗi → App crash

// Good error handling
try {
  const response = await fetch("/api/provinces");
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  const data = await response.json();
  return data;
} catch (error) {
  console.error("Failed to fetch", error);
  return []; // Fallback
}
```

---

## 🎯 Điểm nhấn cho từng đối tượng học viên

### **👶 Beginners (Chưa biết API)**

Focus:

1. ✅ API là gì?
2. ✅ Cách đọc documentation
3. ✅ Fetch API basics
4. ✅ Async/Await syntax
5. ✅ Handle JSON response

Demo files:

- `client/src/services/api.js` - Simple API calls
- `client/src/components/ProvinceSelect.jsx` - Basic usage

---

### **👨‍💻 Intermediate (Đã biết basic)**

Focus:

1. ✅ Client vs Server calls
2. ✅ Security best practices
3. ✅ Error handling patterns
4. ✅ Loading states
5. ✅ Environment variables

Demo files:

- `server/src/routes/` - Routing patterns
- `server/src/middlewares/` - Middleware usage
- `client/src/hooks/` - Custom hooks

---

### **🚀 Advanced (Muốn học architecture)**

Focus:

1. ✅ MVC pattern
2. ✅ Service layer architecture
3. ✅ Caching strategies
4. ✅ Rate limiting
5. ✅ Monitoring & logging

Demo files:

- Full `server/src/` structure
- `server/src/utils/cache.js` - Cache implementation
- `server/src/utils/logger.js` - Logging system

---

## 🛠️ Setup cho buổi giảng

### **Chuẩn bị trước:**

1. **Clone & Setup**

```bash
git clone <repo>
cd location

# Backend
cd server
npm install
cp .env.example .env
# Add API keys

# Frontend
cd ../client
npm install
```

2. **Test everything works**

```bash
# Terminal 1
cd server && npm run dev

# Terminal 2
cd client && npm run dev

# Open http://localhost:5173
```

3. **Prepare checkpoints**

- Commit ban đầu (empty project)
- Commit sau mỗi bài (step by step)
- Tag các version quan trọng

---

## 📝 Worksheets cho học viên

### **Exercise 1: Gọi API đơn giản**

```javascript
// TODO: Hoàn thành function này
async function getProvinces() {
  // 1. Fetch data từ API
  // 2. Convert sang JSON
  // 3. Return data
}

// Test
getProvinces().then((data) => console.log(data));
```

### **Exercise 2: Xử lý lỗi**

```javascript
// TODO: Thêm error handling
async function getProvincesWithErrorHandling() {
  try {
    // Your code here
  } catch (error) {
    // Handle error
  }
}
```

### **Exercise 3: Tạo server proxy**

```javascript
// TODO: Tạo Express endpoint
app.get("/api/provinces", async (req, res) => {
  // 1. Fetch từ provinces.open-api.vn
  // 2. Return JSON
  // 3. Handle errors
});
```

---

## 🎥 Recording Tips

### **Điều cần quay:**

1. ✅ DevTools → Network tab (show API calls)
2. ✅ Code editor (live coding)
3. ✅ Terminal output (show logs)
4. ✅ Browser (show UI updates)
5. ✅ Postman (test APIs)

### **Highlights:**

- 🔴 Moment API key lộ trong DevTools
- 🟢 Cache working (fast response)
- 🟡 Error handling in action
- 🔵 Loading states

---

## 📚 Tài liệu phụ

### **Cung cấp cho học viên:**

1. ✅ `API-ARCHITECTURE.md` - Theory
2. ✅ `README.md` - Setup guide
3. ✅ Code examples với comments
4. ✅ Postman collection (import & test)
5. ✅ Cheat sheet (common patterns)

---

## 🎯 KẾT LUẬN

### **Tại sao project này TỐT cho giảng dạy:**

1. ✅ **Real-world example** - Địa chỉ VN (dễ hiểu, practical)
2. ✅ **Complete stack** - Frontend + Backend
3. ✅ **Multiple APIs** - Different use cases
4. ✅ **Best practices** - Production-ready code
5. ✅ **Progressive difficulty** - Từ simple → advanced
6. ✅ **Visual feedback** - UI thay đổi khi gọi API
7. ✅ **Clear structure** - MVC, dễ follow

### **Điều chỉnh cần thiết:**

1. 📝 Thêm comments giải thích chi tiết
2. 📚 Tạo version đơn giản hơn (v1-basic, v2-intermediate, v3-advanced)
3. 🎯 Tạo exercises với test cases
4. 📹 Record demo videos
5. 📊 Tạo slides presentation

---

## 🚀 Next Steps

### **Để chuẩn bị giảng dạy:**

1. [ ] Tạo presentation slides
2. [ ] Prepare Postman collection
3. [ ] Create exercise templates
4. [ ] Record demo videos
5. [ ] Test with beta students
6. [ ] Gather feedback
7. [ ] Refine materials

**Dự án này sẵn sàng để giảng dạy! 🎓✨**

---

**Tạo bởi:** Lý Quốc Lâm  
**Ngày:** 8 tháng 10, 2025  
**Mục đích:** Hướng dẫn sử dụng Location Selector Project để giảng dạy về API
