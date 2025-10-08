/**
 * 🌐 API Service Layer
 * 
 * This file provides a centralized API client for making HTTP requests
 * to the backend server. It abstracts away fetch() details and provides
 * clean, reusable methods for each API endpoint.
 * 
 * Benefits:
 * - Single source of truth for API endpoints
 * - Consistent error handling
 * - Easy to mock for testing
 * - Type-safe endpoint definitions
 */

// client/src/services/api.js

// 🔗 Base URL from environment variables (e.g., http://localhost:5000)
const API_BASE = import.meta.env.VITE_API_BASE || '';

/**
 * 🛠️ API Service Class
 * Generic HTTP client with error handling
 */
class ApiService {
    constructor(baseURL = '') {
        this.baseURL = baseURL;
    }

    /**
     * 📡 Make HTTP request with error handling
     * @param {string} endpoint - API endpoint path
     * @param {Object} options - Fetch options (method, headers, body)
     * @returns {Promise<any>} Parsed JSON response
     */
    async request(endpoint, options = {}) {
        // 🔗 Build full URL
        const url = `${this.baseURL}${endpoint}`;

        try {
            // 📡 Make HTTP request
            const response = await fetch(url, {
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers,
                },
                ...options,
            });

            // ⚠️ Handle HTTP errors
            if (!response.ok) {
                const error = await response.json().catch(() => ({}));
                throw new Error(error.message || `HTTP Error: ${response.status}`);
            }

            // 📦 Parse and return JSON
            return await response.json();
        } catch (error) {
            // ❌ Log and re-throw error
            console.error(`API Error on ${endpoint}:`, error);
            throw error;
        }
    }

    /**
     * 📥 Make GET request with query parameters
     * @param {string} endpoint - API endpoint
     * @param {Object} params - Query parameters
     * @returns {Promise<any>}
     */
    get(endpoint, params = {}) {
        // 🔗 Build query string from params object
        const queryString = new URLSearchParams(params).toString();
        const url = queryString ? `${endpoint}?${queryString}` : endpoint;
        return this.request(url, { method: 'GET' });
    }

    /**
     * 📤 Make POST request with JSON body
     * @param {string} endpoint - API endpoint
     * @param {Object} data - Request body data
     * @returns {Promise<any>}
     */
    post(endpoint, data) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }
}

// 🏗️ Create singleton API instance
const api = new ApiService(API_BASE);

// 🏛️ Address API endpoints
// These methods fetch administrative division data
export const addressApi = {
    /**
     * Get all provinces in Vietnam
     * @param {number} depth - 1 = basic, 2 = with districts
     */
    getProvinces: (depth = 1) => api.get('/api/provinces', { depth }),

    /**
     * Get specific province with districts
     * @param {string} code - Province code (e.g., "01")
     * @param {number} depth - 1 = basic, 2 = with districts
     */
    getProvinceByCode: (code, depth = 2) => api.get(`/api/provinces/${code}`, { depth }),

    /**
     * Get specific district with wards
     * @param {string} code - District code
     * @param {number} depth - 1 = basic, 2 = with wards
     */
    getDistrictByCode: (code, depth = 2) => api.get(`/api/districts/${code}`, { depth }),
};

// 🌍 Geocoding API endpoints
// These methods handle address-to-coordinates conversion and autocomplete
export const geocodeApi = {
    /**
     * Convert address to coordinates
     * @param {string} address - Full address string
     * @returns {Promise<{lat: number, lng: number}>}
     */
    geocode: (address) => api.get('/api/geocode', { address }),

    /**
     * Test geocoding (development only)
     * @param {string} address - Address to test
     */
    testGeocode: (address) => api.get('/api/test-geocode', { address }),

    /**
     * Get street autocomplete suggestions
     * @param {Object} params - { q, ward, district, province }
     * @returns {Promise<string[]>} Array of street names
     */
    autocompleteStreets: (params) => api.get('/api/autocomplete-streets', params),
};

export default api;
