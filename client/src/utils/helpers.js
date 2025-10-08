// client/src/utils/helpers.js

/**
 * Build full address string from address components
 */
export const buildAddress = (street, ward, district, province) => {
    const parts = [
        street?.trim(),
        ward?.name,
        district?.name,
        province?.name,
        'Việt Nam',
    ].filter(Boolean);

    return parts.join(', ');
};

/**
 * Debounce function for optimizing API calls
 */
export const debounce = (fn, delay = 600) => {
    let timeoutId;
    return (...args) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => fn(...args), delay);
    };
};

/**
 * Sort array by name property
 */
export const sortByName = (array) => {
    return [...array].sort((a, b) => a.name.localeCompare(b.name));
};

/**
 * Validate if address components are selected
 */
export const isAddressValid = (province, district, ward, street) => {
    return Boolean(province && district && ward && street?.trim());
};

/**
 * Format coordinates for display
 */
export const formatCoordinates = (lat, lng) => {
    return {
        lat: parseFloat(lat).toFixed(6),
        lng: parseFloat(lng).toFixed(6),
    };
};

/**
 * Get Google Maps URL
 */
export const getGoogleMapsUrl = (lat, lng, zoom = 17) => {
    return `https://www.google.com/maps?q=${lat},${lng}&z=${zoom}`;
};

/**
 * Get Google Maps embed URL
 */
export const getGoogleMapsEmbedUrl = (lat, lng, zoom = 17) => {
    return `https://www.google.com/maps?q=${lat},${lng}&z=${zoom}&output=embed`;
};
