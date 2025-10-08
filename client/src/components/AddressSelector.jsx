import React, { useEffect, useState, useRef } from "react";
import { MapPin, Navigation, Search } from "lucide-react";
import { useAddressStore } from "../store/addressStore";

export default function AddressSelector() {
  const {
    provinces,
    districts,
    wards,
    selectedProvince,
    selectedDistrict,
    selectedWard,
    street,
    coordinates,
    loading,
    error,
    loadProvinces,
    selectProvince,
    selectDistrict,
    selectWard,
    setStreet,
    geocode,
    autocompleteStreets,
  } = useAddressStore();

  // Autocomplete state
  const [streetSuggestions, setStreetSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isAutocompleteLoading, setIsAutocompleteLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const streetInputRef = useRef(null);

  useEffect(() => {
    loadProvinces();
  }, []);

  // Handle street autocomplete
  const handleStreetChange = async (e) => {
    const value = e.target.value;
    setStreet(value);
    setSelectedIndex(-1); // Reset selected index when typing

    if (value.length < 2) {
      setStreetSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    if (!selectedWard || !selectedDistrict || !selectedProvince) {
      setStreetSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setIsAutocompleteLoading(true);
    try {
      const suggestions = await autocompleteStreets(
        value,
        selectedWard.code,
        selectedDistrict.code,
        selectedProvince.code
      );
      setStreetSuggestions(suggestions);
      setShowSuggestions(suggestions.length > 0);
    } catch (error) {
      console.error("Autocomplete error:", error);
      setStreetSuggestions([]);
      setShowSuggestions(false);
    } finally {
      setIsAutocompleteLoading(false);
    }
  };

  const handleStreetSelect = (suggestion) => {
    setStreet(suggestion);
    setShowSuggestions(false);
    setStreetSuggestions([]);
    setSelectedIndex(-1);
    // Trigger geocoding after selecting
    setTimeout(() => geocode(), 100);
  };

  const handleStreetInputClick = () => {
    if (
      street.length >= 2 &&
      selectedWard &&
      selectedDistrict &&
      selectedProvince
    ) {
      setShowSuggestions(true);
    }
  };

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (!showSuggestions || streetSuggestions.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < streetSuggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < streetSuggestions.length) {
          handleStreetSelect(streetSuggestions[selectedIndex]);
        }
        break;
      case "Escape":
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
      default:
        break;
    }
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        streetInputRef.current &&
        !streetInputRef.current.contains(event.target)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  return (
    <div className="max-w-full mx-auto p-6 bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen">
      <div className="bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800 flex items-center justify-center gap-3">
          <MapPin className="text-blue-600" />
          Chọn Địa Chỉ Việt Nam
        </h1>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-6">
            {/* Province */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tỉnh/Thành
              </label>
              <select
                value={selectedProvince?.code || ""}
                onChange={(e) => selectProvince(e.target.value)}
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Chọn tỉnh/thành --</option>
                {provinces.map((p) => (
                  <option key={p.code} value={p.code}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            {/* District */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quận/Huyện
              </label>
              <select
                value={selectedDistrict?.code || ""}
                onChange={(e) => selectDistrict(e.target.value)}
                disabled={!selectedProvince}
                className="w-full px-4 py-3 border rounded-lg disabled:bg-gray-100"
              >
                <option value="">-- Chọn quận/huyện --</option>
                {districts.map((d) => (
                  <option key={d.code} value={d.code}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Ward */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phường/Xã
              </label>
              <select
                value={selectedWard?.code || ""}
                onChange={(e) => selectWard(e.target.value)}
                disabled={!selectedDistrict}
                className="w-full px-4 py-3 border rounded-lg disabled:bg-gray-100"
              >
                <option value="">-- Chọn phường/xã --</option>
                {wards.map((w) => (
                  <option key={w.code} value={w.code}>
                    {w.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Street */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tên đường
              </label>
              <div className="relative">
                <input
                  ref={streetInputRef}
                  value={street}
                  onChange={handleStreetChange}
                  onClick={handleStreetInputClick}
                  onKeyDown={handleKeyDown}
                  placeholder="Ví dụ: 2 Nguyễn Huệ"
                  className="w-full px-4 py-3 border rounded-lg pr-10"
                />
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                {isAutocompleteLoading && (
                  <div className="absolute right-10 top-1/2 transform -translate-y-1/2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                  </div>
                )}
              </div>

              {/* Autocomplete Dropdown */}
              {showSuggestions && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {streetSuggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      className={`px-4 py-3 cursor-pointer border-b border-gray-100 last:border-b-0 ${
                        index === selectedIndex
                          ? "bg-blue-100 text-blue-900"
                          : "hover:bg-blue-50"
                      }`}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        handleStreetSelect(suggestion);
                      }}
                      onMouseEnter={() => setSelectedIndex(index)}
                    >
                      <div className="text-sm font-medium">{suggestion}</div>
                    </div>
                  ))}
                  {streetSuggestions.length === 0 && !isAutocompleteLoading && (
                    <div className="px-4 py-3 text-sm text-gray-500">
                      Không tìm thấy đường phù hợp
                    </div>
                  )}
                </div>
              )}
            </div>

            <button
              onClick={geocode}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              disabled={loading || (!selectedWard && !street)}
            >
              {loading ? "Đang xử lý..." : "Lấy tọa độ & hiển thị bản đồ"}
            </button>

            {error && <p className="text-red-600 text-sm">{error}</p>}
          </div>

          {/* Result */}
          <div className="space-y-6">
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">
                📍 Địa chỉ đã chọn:
              </h3>
              <div className="space-y-2 text-sm">
                <p>
                  <span className="font-medium">Tỉnh/Thành:</span>{" "}
                  {selectedProvince?.name || "Chưa chọn"}
                </p>
                <p>
                  <span className="font-medium">Quận/Huyện:</span>{" "}
                  {selectedDistrict?.name || "Chưa chọn"}
                </p>
                <p>
                  <span className="font-medium">Phường/Xã:</span>{" "}
                  {selectedWard?.name || "Chưa chọn"}
                </p>
                <p>
                  <span className="font-medium">Đường:</span>{" "}
                  {street || "Chưa nhập"}
                </p>
              </div>
            </div>

            {coordinates && (
              <div className="bg-blue-50 rounded-lg p-6 border-l-4 border-blue-500">
                <h3 className="text-lg font-semibold mb-3 text-blue-800 flex items-center gap-2">
                  <Navigation className="w-5 h-5" /> Tọa độ GPS:
                </h3>
                <div className="text-sm font-mono">
                  <p>Lat: {coordinates.lat}</p>
                  <p>Lng: {coordinates.lng}</p>
                </div>
                <a
                  href={`https://www.google.com/maps?q=${coordinates.lat},${coordinates.lng}&z=17`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                >
                  🗺️ Xem trên Google Maps
                </a>
              </div>
            )}

            {!coordinates && (
              <div className="bg-gray-100 rounded-lg p-8 text-center">
                <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">
                  Chọn/nhập địa chỉ rồi bấm “Lấy tọa độ”.
                </p>
              </div>
            )}

            {coordinates && (
              <div className="bg-white rounded-lg p-4 shadow-inner">
                <iframe
                  width="100%"
                  height="300"
                  frameBorder="0"
                  style={{ border: 0, borderRadius: "8px" }}
                  src={`https://www.google.com/maps?q=${coordinates.lat},${coordinates.lng}&z=17&output=embed`}
                  allowFullScreen
                  title="Map"
                  className="rounded-lg"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
