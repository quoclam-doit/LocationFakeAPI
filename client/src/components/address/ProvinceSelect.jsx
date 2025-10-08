// client/src/components/address/ProvinceSelect.jsx
import React from "react";

export default function ProvinceSelect({
  provinces,
  value,
  onChange,
  disabled,
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Tỉnh/Thành
      </label>
      <select
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
      >
        <option value="">-- Chọn tỉnh/thành --</option>
        {provinces.map((province) => (
          <option key={province.code} value={province.code}>
            {province.name}
          </option>
        ))}
      </select>
    </div>
  );
}
