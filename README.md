# 🏠 Location Selector - Full-Stack Application

Full-stack application cho chọn địa chỉ Việt Nam với autocomplete và geocoding, được xây dựng theo mô hình **MVC** chuẩn.

> 🎓 **Phù hợp để giảng dạy về API, React, Express, và Full-Stack Development**

## 📦 Tech Stack

### Backend

- **Framework**: Express.js
- **Architecture**: MVC Pattern
- **APIs**:
  - Provinces API (provinces.open-api.vn)
  - DistanceMatrix.ai (Geocoding)
  - Vietmap API (Autocomplete)

### Frontend

- **Framework**: React + Vite
- **State Management**: Zustand
- **Styling**: TailwindCSS
- **Icons**: Lucide React

## 📁 Project Structure

```
location/
├── server/                          # BACKEND (MVC)
│   ├── src/
│   │   ├── config/                 # Configuration
│   │   │   └── env.js
│   │   ├── controllers/            # Request handlers
│   │   │   ├── addressController.js
│   │   │   └── geocodeController.js
│   │   ├── services/               # Business logic
│   │   │   ├── provinceService.js
│   │   │   ├── geocodeService.js
│   │   │   └── autocompleteService.js
│   │   ├── routes/                 # API routes
│   │   │   ├── index.js
│   │   │   ├── addressRoutes.js
│   │   │   └── geocodeRoutes.js
│   │   ├── middlewares/            # Middlewares
│   │   │   └── errorHandler.js
│   │   └── utils/                  # Utilities
│   │       ├── cache.js
│   │       └── logger.js
│   ├── server.js                   # Entry point
│   ├── package.json
│   └── .env
│
└── client/                          # FRONTEND
    ├── src/
    │   ├── components/
    │   │   ├── common/
    │   │   │   └── LoadingSpinner.jsx
    │   │   └── address/
    │   │       ├── AddressSelector.jsx
    │   │       ├── ProvinceSelect.jsx
    │   │       ├── DistrictSelect.jsx
    │   │       ├── WardSelect.jsx
    │   │       ├── StreetInput.jsx
    │   │       └── MapDisplay.jsx
    │   ├── store/                  # Zustand stores
    │   │   └── addressStore.js
    │   ├── services/               # API clients
    │   │   └── api.js
    │   ├── hooks/                  # Custom hooks
    │   │   └── useAutocomplete.js
    │   ├── utils/                  # Utilities
    │   │   └── helpers.js
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── package.json
    └── vite.config.js
```

## 🚀 Installation & Setup

### 1. Backend Setup

```bash
cd server

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Add your API keys to .env
# DISTANCEMATRIX_API_KEY=your_key_here
# VIETMAP_API_KEY=your_key_here

# Start development server
npm run dev
```

Server will run on: `http://localhost:5000`

### 2. Frontend Setup

```bash
cd client

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend will run on: `http://localhost:5173`

## 🔧 Environment Variables

### Backend (.env)

```env
PORT=5000
DISTANCEMATRIX_API_KEY=your_distancematrix_api_key
VIETMAP_API_KEY=your_vietmap_api_key
NODE_ENV=development
```

## 📡 API Endpoints

### Address Endpoints

- `GET /api/health` - Health check
- `GET /api/provinces?depth=1` - Get all provinces
- `GET /api/provinces/:code?depth=2` - Get province with districts
- `GET /api/districts/:code?depth=2` - Get district with wards

### Geocoding Endpoints

- `GET /api/geocode?address=...` - Get coordinates for address
- `GET /api/test-geocode?address=...` - Test geocoding
- `GET /api/autocomplete-streets?q=...&district=...&province=...` - Autocomplete streets

## ✨ Features

### 🎯 Core Features

- ✅ Select Province/District/Ward (Cascading dropdowns)
- ✅ Street name autocomplete with Vietmap API
- ✅ Geocoding to get GPS coordinates
- ✅ Google Maps integration
- ✅ Responsive design

### ⌨️ Keyboard Navigation

- `↓` Arrow Down - Next suggestion
- `↑` Arrow Up - Previous suggestion
- `Enter` - Select highlighted suggestion
- `Esc` - Close suggestions

### 🎨 UI/UX

- Real-time autocomplete suggestions
- Loading states
- Error handling
- Visual feedback on selection

## 🏗️ Architecture Patterns

### Backend (MVC)

```
Request → Route → Controller → Service → External API
                      ↓
                   Response
```

### Frontend (Zustand + Custom Hooks)

```
Component → Zustand Store → API Service → Backend
              ↓
         State Updates
```

## 🔄 Data Flow

1. **User selects Province** → Load Districts
2. **User selects District** → Load Wards
3. **User selects Ward** → Enable Street input
4. **User types Street** → Autocomplete suggestions (Vietmap API)
5. **User selects Street** → Auto-geocode
6. **Geocode** → Get coordinates → Display on map

## 📝 Scripts

### Backend

```bash
npm run dev      # Start development server with nodemon
npm start        # Start production server
```

### Frontend

```bash
npm run dev      # Start Vite dev server
npm run build    # Build for production
npm run preview  # Preview production build
```

## 🛠️ Development

### Adding New Features

#### Backend

1. Create service in `src/services/`
2. Create controller in `src/controllers/`
3. Create route in `src/routes/`
4. Register route in `src/routes/index.js`

#### Frontend

1. Add API method in `src/services/api.js`
2. Add action in `src/store/addressStore.js`
3. Create/update component in `src/components/`

## 📚 Key Dependencies

### Backend

- `express` - Web framework
- `cors` - CORS middleware
- `dotenv` - Environment variables
- `node-fetch` - HTTP client

### Frontend

- `react` - UI framework
- `zustand` - State management
- `lucide-react` - Icons
- `tailwindcss` - Styling

## 🐛 Troubleshooting

### Backend not starting?

- Check if `.env` file exists
- Verify API keys are correct
- Check if port 5000 is available

### Autocomplete not working?

- Verify `VIETMAP_API_KEY` in `.env`
- Check browser console for errors
- Ensure Ward/District/Province are selected

### Geocoding fails?

- Verify `DISTANCEMATRIX_API_KEY` in `.env`
- Check if address is complete
- Review server logs

## 📄 License

MIT

## � Tài liệu Giảng dạy

Project này đi kèm với tài liệu đầy đủ để sử dụng cho giảng dạy:

- 📖 **[TEACHING-GUIDE.md](./docs/TEACHING-GUIDE.md)** - Hướng dẫn giảng dạy chi tiết
- 📋 **[API-CHEATSHEET.md](./docs/API-CHEATSHEET.md)** - Cheat sheet cho học viên
- 🎯 **[EXERCISES.md](./docs/EXERCISES.md)** - Bài tập thực hành (3 levels)
- 🏗️ **[API-ARCHITECTURE.md](./docs/API-ARCHITECTURE.md)** - Kiến trúc API deep-dive

### 🎓 Phù hợp cho:

- Giảng dạy về REST API
- Học React hooks & state management
- Express.js backend development
- Full-stack JavaScript development
- Best practices & architecture patterns

## �👨‍💻 Author

Your Name

---

**Happy Coding! 🎉**
