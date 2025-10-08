// client/src/services/api.js

const API_BASE = import.meta.env.VITE_API_BASE || '';

/**
 * API Service for making HTTP requests
 */
class ApiService {
    constructor(baseURL = '') {
        this.baseURL = baseURL;
    }

    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;

        try {
            const response = await fetch(url, {
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers,
                },
                ...options,
            });

            if (!response.ok) {
                const error = await response.json().catch(() => ({}));
                throw new Error(error.message || `HTTP Error: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error(`API Error on ${endpoint}:`, error);
            throw error;
        }
    }

    get(endpoint, params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const url = queryString ? `${endpoint}?${queryString}` : endpoint;
        return this.request(url, { method: 'GET' });
    }

    post(endpoint, data) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }
}

const api = new ApiService(API_BASE);

// Address API endpoints
export const addressApi = {
    getProvinces: (depth = 1) => api.get('/api/provinces', { depth }),
    getProvinceByCode: (code, depth = 2) => api.get(`/api/provinces/${code}`, { depth }),
    getDistrictByCode: (code, depth = 2) => api.get(`/api/districts/${code}`, { depth }),
};

// Geocoding API endpoints
export const geocodeApi = {
    geocode: (address) => api.get('/api/geocode', { address }),
    testGeocode: (address) => api.get('/api/test-geocode', { address }),
    autocompleteStreets: (params) => api.get('/api/autocomplete-streets', params),
};

export default api;
