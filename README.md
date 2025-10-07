# Provinces Full-Stack Starter (VN Address Picker via Third-Party API)

Full-stack mẫu: **Express backend proxy** + **Vite React + Tailwind + Zustand** frontend.
Dùng API bên thứ ba: `https://provinces.open-api.vn/api/v1/` để lấy Tỉnh/Quận/Phường và Google Geocoding để lấy toạ độ.

## Cấu trúc
```
provinces-fullstack-starter/
├─ server/
│  ├─ server.js
│  ├─ package.json
│  └─ .env.example
└─ client/
   ├─ index.html
   ├─ vite.config.js
   ├─ tailwind.config.js
   ├─ postcss.config.js
   ├─ package.json
   └─ src/
      ├─ index.css
      ├─ main.jsx
      ├─ App.jsx
      ├─ store/addressStore.js
      └─ components/AddressSelector.jsx
```

## Chạy dự án (local)
1. **Backend**
   ```bash
   cd server
   cp .env.example .env
   # sửa GOOGLE_API_KEY=... của bạn
   npm install
   npm run dev
   ```
   Server default: `http://localhost:5000`

2. **Frontend**
   ```bash
   cd ../client
   npm install
   npm run dev
   ```
   Frontend default: `http://localhost:5173` (đã cấu hình proxy `/api` tới backend).

## Lưu ý
- API tỉnh/huyện/phường **không có tên đường** ⇒ nhập tự do ở frontend rồi gọi `/api/geocode?address=...` để ra toạ độ.
- Giữ `depth=1` (tỉnh) và `depth=2` (tỉnh+kèm quận, quận+kèm phường) để tối ưu tải.
- Ẩn Google API key trong **server/.env** (không commit).

## Nâng cấp gợi ý
- Thêm autocomplete tìm kiếm phường/đường.
- Cache server (memory/Redis) cho danh sách tĩnh.
- Thêm rate-limit, logging, và unit test cho endpoints.
