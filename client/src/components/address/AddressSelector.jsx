// client/src/components/address/AddressSelector.jsx
import React, { useEffect } from "react";
import { MapPin } from "lucide-react";
import { useAddressStore } from "../../store/addressStore";
import ProvinceSelect from "./ProvinceSelect";
import DistrictSelect from "./DistrictSelect";
import WardSelect from "./WardSelect";
import StreetInput from "./StreetInput";
import MapDisplay from "./MapDisplay";

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
  } = useAddressStore();

  // Load provinces on mount
  useEffect(() => {
    loadProvinces();
  }, [loadProvinces]);

  return (
    <div className="max-w-full mx-auto p-6 bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen">
      <div className="bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800 flex items-center justify-center gap-3">
          <MapPin className="text-blue-600" />
          Chọn Địa Chỉ Việt Nam
        </h1>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Left Panel - Address Selection */}
          <div className="space-y-6">
            <ProvinceSelect
              provinces={provinces}
              value={selectedProvince?.code}
              onChange={selectProvince}
              disabled={loading}
            />

            <DistrictSelect
              districts={districts}
              value={selectedDistrict?.code}
              onChange={selectDistrict}
              disabled={!selectedProvince || loading}
            />

            <WardSelect
              wards={wards}
              value={selectedWard?.code}
              onChange={selectWard}
              disabled={!selectedDistrict || loading}
            />

            <StreetInput
              value={street}
              onChange={setStreet}
              onSelect={(value) => {
                setStreet(value);
                setTimeout(() => geocode(), 100);
              }}
              wardCode={selectedWard?.code}
              districtCode={selectedDistrict?.code}
              provinceCode={selectedProvince?.code}
              disabled={!selectedWard}
            />

            <button
              onClick={geocode}
              disabled={loading || !selectedWard || !street}
              className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {loading ? "Đang xử lý..." : "Lấy tọa độ & hiển thị bản đồ"}
            </button>

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}
          </div>

          {/* Right Panel - Result Display */}
          <div className="space-y-6">
            {/* Address Summary */}
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

            {/* Map Display */}
            <MapDisplay coordinates={coordinates} />
          </div>
        </div>
      </div>
    </div>
  );
}
