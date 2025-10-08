// client/src/components/common/LoadingSpinner.jsx
import React from "react";

export default function LoadingSpinner({ size = "md", className = "" }) {
  const sizeClasses = {
    sm: "h-4 w-4 border-2",
    md: "h-5 w-5 border-2",
    lg: "h-8 w-8 border-3",
  };

  return (
    <div
      className={`animate-spin rounded-full border-blue-600 border-b-transparent ${sizeClasses[size]} ${className}`}
      role="status"
      aria-label="Loading"
    />
  );
}
