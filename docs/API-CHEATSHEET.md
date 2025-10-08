# 📋 API Cheat Sheet - Quick Reference

## 🎯 Basic Concepts

### API là gì?

```
API (Application Programming Interface)
= Cách để các ứng dụng nói chuyện với nhau
```

### REST API

```
REST = Representational State Transfer
= Sử dụng HTTP methods để CRUD data
```

---

## 🌐 HTTP Methods

| Method     | Mục đích          | Ví dụ              |
| ---------- | ----------------- | ------------------ |
| **GET**    | Lấy data          | Get danh sách tỉnh |
| **POST**   | Tạo mới           | Tạo user mới       |
| **PUT**    | Cập nhật toàn bộ  | Cập nhật profile   |
| **PATCH**  | Cập nhật một phần | Đổi tên            |
| **DELETE** | Xóa               | Xóa bài viết       |

---

## 📡 Fetch API Syntax

### Basic GET Request

```javascript
// Cách 1: Promise then/catch
fetch("https://api.example.com/data")
  .then((response) => response.json())
  .then((data) => console.log(data))
  .catch((error) => console.error(error));

// Cách 2: Async/Await (Recommended)
async function getData() {
  try {
    const response = await fetch("https://api.example.com/data");
    const data = await response.json();
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}
```

### POST Request

```javascript
async function createData() {
  const response = await fetch("https://api.example.com/data", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: "John",
      email: "john@example.com",
    }),
  });
  const data = await response.json();
  return data;
}
```

### With Query Parameters

```javascript
// URL: https://api.example.com/provinces?depth=1&limit=10
const params = new URLSearchParams({
  depth: 1,
  limit: 10,
});
const response = await fetch(`https://api.example.com/provinces?${params}`);
```

### With Headers

```javascript
const response = await fetch("https://api.example.com/data", {
  headers: {
    Authorization: "Bearer YOUR_TOKEN",
    "Content-Type": "application/json",
  },
});
```

---

## ⚡ React + API Integration

### 1. Simple Fetch in Component

```javascript
import { useState, useEffect } from "react";

function MyComponent() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const response = await fetch("/api/data");
        if (!response.ok) {
          throw new Error("Failed to fetch");
        }
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <ul>
      {data.map((item) => (
        <li key={item.id}>{item.name}</li>
      ))}
    </ul>
  );
}
```

### 2. API Service Pattern (Better)

```javascript
// services/api.js
export const api = {
  async getProvinces() {
    const response = await fetch("/api/provinces");
    if (!response.ok) throw new Error("Failed to fetch");
    return response.json();
  },

  async getDistrictsByProvince(provinceCode) {
    const response = await fetch(`/api/provinces/${provinceCode}`);
    if (!response.ok) throw new Error("Failed to fetch");
    return response.json();
  },
};

// Component
import { api } from "./services/api";

function ProvinceList() {
  const [provinces, setProvinces] = useState([]);

  useEffect(() => {
    api.getProvinces().then(setProvinces).catch(console.error);
  }, []);

  return <div>{/* render */}</div>;
}
```

### 3. Custom Hook Pattern (Best)

```javascript
// hooks/useProvinces.js
import { useState, useEffect } from "react";
import { api } from "../services/api";

export function useProvinces() {
  const [provinces, setProvinces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api
      .getProvinces()
      .then(setProvinces)
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

  return { provinces, loading, error };
}

// Component
import { useProvinces } from "./hooks/useProvinces";

function ProvinceList() {
  const { provinces, loading, error } = useProvinces();

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error!</div>;

  return (
    <ul>
      {provinces.map((p) => (
        <li key={p.code}>{p.name}</li>
      ))}
    </ul>
  );
}
```

---

## 🖥️ Express Server Setup

### Basic Server

```javascript
// server.js
import express from "express";
import cors from "cors";

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.get("/api/data", (req, res) => {
  res.json({ message: "Hello API" });
});

// Start server
app.listen(5000, () => {
  console.log("Server running on http://localhost:5000");
});
```

### Proxy Pattern

```javascript
import fetch from "node-fetch";

app.get("/api/provinces", async (req, res) => {
  try {
    const response = await fetch(
      "https://provinces.open-api.vn/api/v1/?depth=1"
    );
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch" });
  }
});
```

### With Environment Variables

```javascript
// .env
PORT = 5000;
API_KEY = your_secret_key;

// server.js
import dotenv from "dotenv";
dotenv.config();

const apiKey = process.env.API_KEY;

app.get("/api/geocode", async (req, res) => {
  const response = await fetch(
    `https://api.service.com/geocode?key=${apiKey}&address=${req.query.address}`
  );
  const data = await response.json();
  res.json(data);
});
```

---

## 🔒 Security Best Practices

### ❌ NEVER DO THIS

```javascript
// Client-side - API key exposed!
const API_KEY = "abc123xyz";
fetch(`https://api.service.com?key=${API_KEY}`);
// → Anyone can see this in DevTools
```

### ✅ ALWAYS DO THIS

```javascript
// Server-side - API key hidden
// .env
API_KEY = abc123xyz;

// server.js
const apiKey = process.env.API_KEY;
app.get("/api/data", async (req, res) => {
  const response = await fetch(`https://api.service.com?key=${apiKey}`);
  res.json(await response.json());
});

// Client-side - no key exposed
fetch("/api/data");
```

---

## 🐛 Error Handling Patterns

### Client-Side

```javascript
async function fetchData() {
  try {
    const response = await fetch("/api/data");

    // Check HTTP status
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    // Network error or other issues
    console.error("Fetch error:", error);
    throw error;
  }
}
```

### Server-Side

```javascript
// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({
    success: false,
    message: "Internal server error",
    // Only in development
    ...(process.env.NODE_ENV === "dev" && { error: err.message }),
  });
});

// Usage in routes
app.get("/api/data", async (req, res, next) => {
  try {
    const data = await someAsyncOperation();
    res.json(data);
  } catch (error) {
    next(error); // Pass to error handler
  }
});
```

---

## 💾 Caching Pattern

### Simple In-Memory Cache

```javascript
const cache = new Map();

app.get("/api/provinces", async (req, res) => {
  // Check cache
  if (cache.has("provinces")) {
    console.log("From cache");
    return res.json(cache.get("provinces"));
  }

  // Fetch from API
  const response = await fetch("https://provinces.open-api.vn/api/v1/");
  const data = await response.json();

  // Store in cache
  cache.set("provinces", data);

  res.json(data);
});
```

### Cache with TTL (Time To Live)

```javascript
class Cache {
  constructor(ttl = 24 * 60 * 60 * 1000) {
    // 24 hours
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

    // Check if expired
    if (Date.now() - item.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.value;
  }
}

const cache = new Cache();
```

---

## 📊 Status Codes

| Code    | Meaning      | Usage               |
| ------- | ------------ | ------------------- |
| **200** | OK           | Success             |
| **201** | Created      | Resource created    |
| **400** | Bad Request  | Invalid input       |
| **401** | Unauthorized | Need authentication |
| **403** | Forbidden    | No permission       |
| **404** | Not Found    | Resource not found  |
| **500** | Server Error | Server crashed      |

---

## 🎯 Common Patterns

### Loading State

```javascript
const [loading, setLoading] = useState(false);

async function fetchData() {
  setLoading(true);
  try {
    const data = await api.getData();
    setData(data);
  } finally {
    setLoading(false);
  }
}

return loading ? <Spinner /> : <DataDisplay data={data} />;
```

### Debounce (for search)

```javascript
import { useState, useEffect } from "react";

function SearchComponent() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);

  useEffect(() => {
    // Debounce: wait 500ms after user stops typing
    const timer = setTimeout(() => {
      if (query.length > 2) {
        fetch(`/api/search?q=${query}`)
          .then((r) => r.json())
          .then(setResults);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [query]);

  return <input value={query} onChange={(e) => setQuery(e.target.value)} />;
}
```

### Retry Logic

```javascript
async function fetchWithRetry(url, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        return response.json();
      }
    } catch (error) {
      if (i === retries - 1) throw error;
      // Wait before retry
      await new Promise((resolve) => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
}
```

---

## 🔧 Tools & Extensions

### Browser DevTools

- **Network Tab**: Xem API requests
- **Console**: Debug & test
- **Application**: Xem localStorage/cookies

### VS Code Extensions

- REST Client
- Thunder Client
- Postman

### Testing Tools

- Postman
- Insomnia
- cURL

---

## 📝 Quick Commands

### cURL Examples

```bash
# GET request
curl https://api.example.com/data

# POST request
curl -X POST https://api.example.com/data \
  -H "Content-Type: application/json" \
  -d '{"name":"John"}'

# With authentication
curl https://api.example.com/data \
  -H "Authorization: Bearer TOKEN"
```

### Test API in Terminal

```bash
# Using Node.js
node -e "fetch('https://api.example.com/data').then(r=>r.json()).then(console.log)"
```

---

## 🎓 Learning Resources

### Documentation

- [MDN Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)
- [Express.js](https://expressjs.com/)
- [REST API Tutorial](https://restfulapi.net/)

### Practice APIs

- [JSONPlaceholder](https://jsonplaceholder.typicode.com/) - Fake API
- [Provinces VN](https://provinces.open-api.vn/) - VN địa chỉ
- [Cat Facts](https://catfact.ninja/) - Random facts

---

## ✅ Checklist khi gọi API

- [ ] Check API documentation
- [ ] Test trong Postman trước
- [ ] Handle loading state
- [ ] Handle error state
- [ ] Check response status
- [ ] Parse JSON correctly
- [ ] Add try/catch
- [ ] Hide API keys (nếu có)
- [ ] Consider caching
- [ ] Add timeout (nếu cần)

---

**💡 Tip:** Practice makes perfect! Càng code nhiều càng quen.

**🎯 Remember:**

- Client-side = Fast nhưng kém bảo mật
- Server-side = An toàn hơn, control tốt hơn

---

**Created by:** Lý Quốc Lâm  
**For:** Location Selector API Teaching  
**Date:** October 8, 2025
