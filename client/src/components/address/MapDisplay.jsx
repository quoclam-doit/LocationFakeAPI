// client/src/components/address/MapDisplay.jsx
import React from "react";
import { Navigation, MapPin } from "lucide-react";
import {
  getGoogleMapsUrl,
  getGoogleMapsEmbedUrl,
  formatCoordinates,
} from "../../utils/helpers";

export default function MapDisplay({ coordinates }) {
  if (!coordinates) {
    return (
      <div className="bg-gray-100 rounded-lg p-8 text-center">
        <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500">Chọn/nhập địa chỉ rồi bấm "Lấy tọa độ".</p>
      </div>
    );
  }

  const { lat, lng } = formatCoordinates(coordinates.lat, coordinates.lng);

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 rounded-lg p-6 border-l-4 border-blue-500">
        <h3 className="text-lg font-semibold mb-3 text-blue-800 flex items-center gap-2">
          <Navigation className="w-5 h-5" /> Tọa độ GPS:
        </h3>
        <div className="text-sm font-mono space-y-1">
          <p>Latitude: {lat}</p>
          <p>Longitude: {lng}</p>
        </div>
        <a
          href={getGoogleMapsUrl(coordinates.lat, coordinates.lng)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm transition-colors"
        >
          🗺️ Xem trên Google Maps
        </a>
      </div>

      <div className="bg-white rounded-lg p-4 shadow-inner">
        <iframe
          width="100%"
          height="300"
          frameBorder="0"
          style={{ border: 0, borderRadius: "8px" }}
          src={getGoogleMapsEmbedUrl(coordinates.lat, coordinates.lng)}
          allowFullScreen
          title="Map"
          className="rounded-lg"
        />
      </div>
    </div>
  );
}
