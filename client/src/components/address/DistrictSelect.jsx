// client/src/components/address/DistrictSelect.jsx
import React from "react";

export default function DistrictSelect({
  districts,
  value,
  onChange,
  disabled,
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Quận/Huyện
      </label>
      <select
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
      >
        <option value="">-- Chọn quận/huyện --</option>
        {districts.map((district) => (
          <option key={district.code} value={district.code}>
            {district.name}
          </option>
        ))}
      </select>
    </div>
  );
}
