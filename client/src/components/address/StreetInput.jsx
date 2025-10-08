// client/src/components/address/StreetInput.jsx
import React, { useRef, useEffect } from "react";
import { Search } from "lucide-react";
import LoadingSpinner from "../common/LoadingSpinner";
import { useAutocomplete } from "../../hooks/useAutocomplete";

export default function StreetInput({
  value,
  onChange,
  onSelect,
  wardCode,
  districtCode,
  provinceCode,
  disabled,
}) {
  const inputRef = useRef(null);
  const {
    suggestions,
    isLoading,
    showSuggestions,
    selectedIndex,
    search,
    clear,
    navigate,
    getSelected,
    setShowSuggestions,
    setSelectedIndex,
  } = useAutocomplete();

  // Handle input change
  const handleChange = (e) => {
    const newValue = e.target.value;
    onChange(newValue);
    setSelectedIndex(-1);
    search(newValue, wardCode, districtCode, provinceCode);
  };

  // Handle suggestion select
  const handleSelect = (suggestion) => {
    onSelect(suggestion);
    clear();
  };

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        navigate("down");
        break;
      case "ArrowUp":
        e.preventDefault();
        navigate("up");
        break;
      case "Enter":
        e.preventDefault();
        const selected = getSelected();
        if (selected) {
          handleSelect(selected);
        }
        break;
      case "Escape":
        clear();
        break;
      default:
        break;
    }
  };

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (inputRef.current && !inputRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [setShowSuggestions]);

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Tên đường
      </label>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onClick={() => value.length >= 2 && setShowSuggestions(true)}
          disabled={disabled}
          placeholder="Ví dụ: 2 Nguyễn Huệ"
          className="w-full px-4 py-3 border rounded-lg pr-10 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
        />
        <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        {isLoading && (
          <div className="absolute right-10 top-1/2 transform -translate-y-1/2">
            <LoadingSpinner size="sm" />
          </div>
        )}
      </div>

      {/* Autocomplete Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {suggestions.map((suggestion, index) => (
            <div
              key={index}
              className={`px-4 py-3 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors ${
                index === selectedIndex
                  ? "bg-blue-100 text-blue-900"
                  : "hover:bg-blue-50"
              }`}
              onMouseDown={(e) => {
                e.preventDefault();
                handleSelect(suggestion);
              }}
              onMouseEnter={() => setSelectedIndex(index)}
            >
              <div className="text-sm font-medium">{suggestion}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
