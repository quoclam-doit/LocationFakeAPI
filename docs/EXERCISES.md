# 🎯 API Exercises - Bài tập thực hành

## 📚 Mục lục

- [Level 1: Beginner](#level-1-beginner)
- [Level 2: Intermediate](#level-2-intermediate)
- [Level 3: Advanced](#level-3-advanced)
- [Answers](#answers)

---

## Level 1: Beginner

### Exercise 1.1: First API Call

**Mục tiêu:** Gọi API đầu tiên và hiển thị kết quả

**Yêu cầu:**

1. Gọi API: `https://provinces.open-api.vn/api/v1/?depth=1`
2. Log kết quả ra console
3. Đếm số lượng tỉnh/thành

```javascript
// TODO: Viết code ở đây
async function getProvinces() {
  // Your code here
}

getProvinces();
```

<details>
<summary>💡 Hint</summary>

```javascript
// Dùng fetch() và await
// response.json() để parse JSON
// data.length để đếm
```

</details>

---

### Exercise 1.2: Display Data in React

**Mục tiêu:** Hiển thị danh sách tỉnh/thành trong React component

**Yêu cầu:**

1. Tạo component `ProvinceList`
2. Gọi API khi component mount
3. Hiển thị danh sách dạng `<ul><li>`

```javascript
import { useState, useEffect } from "react";

function ProvinceList() {
  // TODO: Add state and fetch logic

  return (
    <div>
      <h2>Danh sách Tỉnh/Thành</h2>
      {/* TODO: Render list here */}
    </div>
  );
}
```

<details>
<summary>💡 Hint</summary>

```javascript
// useState để lưu data
// useEffect để gọi API
// .map() để render list
```

</details>

---

### Exercise 1.3: Loading State

**Mục tiêu:** Thêm loading state

**Yêu cầu:**

1. Hiển thị "Loading..." khi đang fetch
2. Hiển thị data khi fetch xong

```javascript
function ProvinceList() {
  const [provinces, setProvinces] = useState([]);
  // TODO: Add loading state

  useEffect(() => {
    // TODO: Set loading = true before fetch
    // TODO: Set loading = false after fetch
  }, []);

  // TODO: Show loading or data
}
```

---

### Exercise 1.4: Error Handling

**Mục tiêu:** Xử lý lỗi khi gọi API

**Yêu cầu:**

1. Thêm error state
2. Hiển thị error message nếu có lỗi
3. Dùng try/catch

```javascript
function ProvinceList() {
  const [provinces, setProvinces] = useState([]);
  const [loading, setLoading] = useState(false);
  // TODO: Add error state

  useEffect(() => {
    async function fetchData() {
      // TODO: Add try/catch
      // TODO: Handle error
    }
    fetchData();
  }, []);

  // TODO: Show error if exists
}
```

---

## Level 2: Intermediate

### Exercise 2.1: Cascading Dropdowns

**Mục tiêu:** Tạo cascading dropdowns (Tỉnh → Quận → Phường)

**Yêu cầu:**

1. Dropdown 1: Chọn tỉnh
2. Dropdown 2: Hiện quận (sau khi chọn tỉnh)
3. Dropdown 3: Hiện phường (sau khi chọn quận)

```javascript
function AddressSelector() {
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);

  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");

  // TODO: Load provinces on mount

  // TODO: Load districts when province changes

  // TODO: Load wards when district changes

  return <div>{/* TODO: Render 3 dropdowns */}</div>;
}
```

**API endpoints:**

- Provinces: `https://provinces.open-api.vn/api/v1/?depth=1`
- Districts: `https://provinces.open-api.vn/api/v1/p/{provinceCode}?depth=2`
- Wards: `https://provinces.open-api.vn/api/v1/d/{districtCode}?depth=2`

---

### Exercise 2.2: Create API Service

**Mục tiêu:** Tách logic gọi API ra service riêng

**Yêu cầu:**

1. Tạo file `services/api.js`
2. Export các functions: `getProvinces()`, `getDistricts()`, `getWards()`
3. Sử dụng trong component

```javascript
// services/api.js
const BASE_URL = "https://provinces.open-api.vn/api/v1";

export const addressApi = {
  // TODO: Implement getProvinces()
  // TODO: Implement getDistricts(provinceCode)
  // TODO: Implement getWards(districtCode)
};

// Component
import { addressApi } from "./services/api";

function MyComponent() {
  useEffect(() => {
    // TODO: Use addressApi
  }, []);
}
```

---

### Exercise 2.3: Custom Hook

**Mục tiêu:** Tạo custom hook để reuse logic

**Yêu cầu:**

1. Tạo `useProvinces()` hook
2. Return { provinces, loading, error }
3. Sử dụng trong component

```javascript
// hooks/useProvinces.js
export function useProvinces() {
  // TODO: Implement hook

  return { provinces, loading, error };
}

// Component
function ProvinceSelect() {
  const { provinces, loading, error } = useProvinces();

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <select>
      {provinces.map((p) => (
        <option key={p.code} value={p.code}>
          {p.name}
        </option>
      ))}
    </select>
  );
}
```

---

### Exercise 2.4: Search with Debounce

**Mục tiêu:** Tạo search box với debounce

**Yêu cầu:**

1. Input để search tỉnh/thành
2. Debounce 500ms (chờ user ngừng gõ)
3. Filter và hiển thị kết quả

```javascript
function ProvinceSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);

  useEffect(() => {
    // TODO: Implement debounce
    // TODO: Filter provinces by query
  }, [query]);

  return (
    <div>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Tìm tỉnh/thành..."
      />
      {/* TODO: Display results */}
    </div>
  );
}
```

---

## Level 3: Advanced

### Exercise 3.1: Server Proxy Setup

**Mục tiêu:** Tạo Express server proxy cho API

**Yêu cầu:**

1. Setup Express server
2. Tạo endpoint `/api/provinces`
3. Proxy sang provinces.open-api.vn

```javascript
// server.js
import express from "express";
import cors from "cors";

const app = express();

// TODO: Add middlewares

// TODO: Create /api/provinces endpoint

// TODO: Start server on port 5000
```

---

### Exercise 3.2: Add Caching

**Mục tiêu:** Implement cache để giảm API calls

**Yêu cầu:**

1. Cache provinces data trong 24h
2. Return cached data nếu có
3. Refresh cache khi hết hạn

```javascript
const cache = new Map();

app.get("/api/provinces", async (req, res) => {
  // TODO: Check cache
  // TODO: If cache exists and not expired, return it
  // TODO: Otherwise, fetch from API and cache it
});
```

---

### Exercise 3.3: Error Handling Middleware

**Mục tiêu:** Tạo centralized error handler

**Yêu cầu:**

1. Tạo error handling middleware
2. Log errors
3. Return consistent error response

```javascript
// middlewares/errorHandler.js
export function errorHandler(err, req, res, next) {
  // TODO: Log error
  // TODO: Return JSON error response
}

// server.js
app.use(errorHandler);
```

---

### Exercise 3.4: Rate Limiting

**Mục tiêu:** Giới hạn số requests

**Yêu cầu:**

1. Limit 10 requests/phút per IP
2. Return 429 status khi vượt limit
3. Reset counter sau 1 phút

```javascript
const rateLimits = new Map();

function rateLimiter(req, res, next) {
  const ip = req.ip;

  // TODO: Check request count for this IP

  // TODO: If > 10, return 429

  // TODO: Otherwise, increment and continue

  // TODO: Reset after 1 minute
}

app.use("/api", rateLimiter);
```

---

### Exercise 3.5: Complete Project

**Mục tiêu:** Build complete address selector app

**Yêu cầu:**

**Backend:**

- ✅ Express server với routes
- ✅ Proxy cho provinces API
- ✅ Caching
- ✅ Error handling
- ✅ Logging

**Frontend:**

- ✅ Province, District, Ward selects
- ✅ Street input với autocomplete
- ✅ Loading states
- ✅ Error handling
- ✅ Clean UI

**Bonus:**

- ✅ Geocoding integration
- ✅ Map display
- ✅ Save to localStorage

---

## 🎓 Bonus Challenges

### Challenge 1: Pagination

Implement pagination cho danh sách dài

- 10 items per page
- Previous/Next buttons
- Page numbers

### Challenge 2: Infinite Scroll

Implement infinite scroll thay vì pagination

### Challenge 3: Offline Support

- Cache data trong localStorage
- Show cached data when offline
- Sync when online again

### Challenge 4: TypeScript

Convert project sang TypeScript với type definitions

### Challenge 5: Testing

Write unit tests cho:

- API service functions
- Custom hooks
- React components

---

## ✅ Solutions

### Solution 1.1: First API Call

```javascript
async function getProvinces() {
  try {
    const response = await fetch(
      "https://provinces.open-api.vn/api/v1/?depth=1"
    );
    const data = await response.json();
    console.log("Total provinces:", data.length);
    console.log("Data:", data);
    return data;
  } catch (error) {
    console.error("Error:", error);
  }
}

getProvinces();
```

---

### Solution 1.2: Display Data in React

```javascript
import { useState, useEffect } from "react";

function ProvinceList() {
  const [provinces, setProvinces] = useState([]);

  useEffect(() => {
    async function fetchProvinces() {
      const response = await fetch(
        "https://provinces.open-api.vn/api/v1/?depth=1"
      );
      const data = await response.json();
      setProvinces(data);
    }
    fetchProvinces();
  }, []);

  return (
    <div>
      <h2>Danh sách Tỉnh/Thành</h2>
      <ul>
        {provinces.map((province) => (
          <li key={province.code}>{province.name}</li>
        ))}
      </ul>
    </div>
  );
}
```

---

### Solution 1.3: Loading State

```javascript
function ProvinceList() {
  const [provinces, setProvinces] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProvinces() {
      setLoading(true);
      try {
        const response = await fetch(
          "https://provinces.open-api.vn/api/v1/?depth=1"
        );
        const data = await response.json();
        setProvinces(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    fetchProvinces();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h2>Danh sách Tỉnh/Thành</h2>
      <ul>
        {provinces.map((province) => (
          <li key={province.code}>{province.name}</li>
        ))}
      </ul>
    </div>
  );
}
```

---

### Solution 1.4: Error Handling

```javascript
function ProvinceList() {
  const [provinces, setProvinces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchProvinces() {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(
          "https://provinces.open-api.vn/api/v1/?depth=1"
        );
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        const data = await response.json();
        setProvinces(data);
      } catch (error) {
        setError(error.message);
        console.error("Fetch error:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchProvinces();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>Danh sách Tỉnh/Thành</h2>
      <ul>
        {provinces.map((province) => (
          <li key={province.code}>{province.name}</li>
        ))}
      </ul>
    </div>
  );
}
```

---

### Solution 2.2: API Service

```javascript
// services/api.js
const BASE_URL = "https://provinces.open-api.vn/api/v1";

async function request(endpoint) {
  const response = await fetch(`${BASE_URL}${endpoint}`);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  return response.json();
}

export const addressApi = {
  getProvinces: () => request("/?depth=1"),
  getDistricts: (provinceCode) => request(`/p/${provinceCode}?depth=2`),
  getWards: (districtCode) => request(`/d/${districtCode}?depth=2`),
};
```

---

### Solution 2.3: Custom Hook

```javascript
// hooks/useProvinces.js
import { useState, useEffect } from "react";

export function useProvinces() {
  const [provinces, setProvinces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchProvinces() {
      setLoading(true);
      try {
        const response = await fetch(
          "https://provinces.open-api.vn/api/v1/?depth=1"
        );
        const data = await response.json();
        setProvinces(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchProvinces();
  }, []);

  return { provinces, loading, error };
}
```

---

### Solution 3.1: Server Proxy

```javascript
// server.js
import express from "express";
import cors from "cors";
import fetch from "node-fetch";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/provinces", async (req, res) => {
  try {
    const depth = req.query.depth || 1;
    const response = await fetch(
      `https://provinces.open-api.vn/api/v1/?depth=${depth}`
    );
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch provinces" });
  }
});

app.listen(5000, () => {
  console.log("Server running on http://localhost:5000");
});
```

---

## 📊 Grading Rubric

### Beginner Exercises

- **Pass:** Completes 3/4 exercises
- **Good:** Completes all 4 with clean code
- **Excellent:** Adds extra features (sorting, filtering)

### Intermediate Exercises

- **Pass:** Completes 2/4 exercises
- **Good:** Completes 3/4 with good patterns
- **Excellent:** Completes all with best practices

### Advanced Exercises

- **Pass:** Completes 2/5 exercises
- **Good:** Completes 3/5 with documentation
- **Excellent:** Completes all with tests

---

## 🎯 Learning Path

1. ✅ Complete Beginner level
2. ✅ Read API-CHEATSHEET.md
3. ✅ Complete Intermediate level
4. ✅ Study project source code
5. ✅ Complete Advanced level
6. ✅ Try Bonus Challenges
7. ✅ Build your own project!

---

**Happy Coding! 🚀**

**Created by:** Lý Quốc Lâm  
**For:** Location Selector API Teaching  
**Date:** October 8, 2025
