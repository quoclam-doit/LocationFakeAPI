/**
 * 🌍 Geocoding Service
 * 
 * This service converts addresses to coordinates (latitude, longitude)
 * using the DistanceMatrix.ai Geocoding API
 * 
 * Key concepts:
 * - Geocoding: Address → Coordinates (e.g., "Hà Nội" → {lat: 21.02, lng: 105.84})
 * - Requires API key for authentication
 * - Returns geographic location data for mapping
 */

// server/src/services/geocodeService.js
import fetch from 'node-fetch';
import { config } from '../config/env.js';
import { logger } from '../utils/logger.js';

// 🔗 DistanceMatrix API endpoint for geocoding
const GEOCODE_BASE_URL = 'https://api.distancematrix.ai/maps/api/geocode/json';

export const geocodeService = {
    /**
     * 📍 Geocode an address to get coordinates
     * Converts human-readable address into lat/lng coordinates
     * 
     * @param {string} address - Full address string (e.g., "Hoàn Kiếm, Hà Nội")
     * @returns {Promise<{lat: number, lng: number}>} Geographic coordinates
     */
    async geocodeAddress(address) {
        // ⚠️ Validation: Ensure address is provided
        if (!address) {
            throw new Error('Address is required');
        }

        // 🔑 Validation: Ensure API key is configured
        if (!config.distanceMatrixApiKey) {
            throw new Error('DISTANCEMATRIX_API_KEY is not configured');
        }

        try {
            logger.info(`🌍 Geocoding address: "${address}"`);

            // 🔗 Build API request URL with encoded address
            const url = `${GEOCODE_BASE_URL}?address=${encodeURIComponent(address)}&key=${config.distanceMatrixApiKey}`;

            // 📡 Make HTTP request to geocoding API
            const response = await fetch(url);
            const data = await response.json();

            logger.debug('Geocode API response', data);

            // 📦 Extract results (API may return 'results' or 'result')
            const results = data.results || data.result;

            // ✅ Validate API response status and results
            if (data.status !== 'OK' || !results?.length) {
                logger.warning('No coordinates found for address', { address, status: data.status });
                throw new Error('Coordinates not found');
            }

            // 📍 Extract coordinates from first result
            const location = results[0].geometry.location;
            const coordinates = {
                lat: location.lat,
                lng: location.lng,
            };

            logger.success('Geocoding successful', coordinates);

            // ✅ Return coordinates
            return coordinates;

        } catch (error) {
            // ❌ Log error and re-throw
            logger.error('Geocoding error', error);
            throw error;
        }
    },

    /**
     * 🧪 Test geocoding endpoint (for debugging/development)
     * Useful for verifying API key and connection status
     * 
     * @param {string} address - Address to test (defaults to "Hà Nội, Việt Nam")
     * @returns {Promise<Object>} Test result with coordinates or error info
     */
    async testGeocode(address = 'Hà Nội, Việt Nam') {
        // 🔑 Validation: Ensure API key is configured
        if (!config.distanceMatrixApiKey) {
            throw new Error('DISTANCEMATRIX_API_KEY is not configured');
        }

        try {
            // 🔗 Build test request URL
            const url = `${GEOCODE_BASE_URL}?address=${encodeURIComponent(address)}&key=${config.distanceMatrixApiKey}`;

            // 📡 Make HTTP request
            const response = await fetch(url);
            const data = await response.json();

            // ⚠️ Check if geocoding failed
            if (data.status !== 'OK') {
                return { query: address, status: data.status, raw: data };
            }

            // ✅ Extract coordinates from successful response
            if (data.results && data.results.length > 0) {
                const location = data.results[0].geometry.location;
                return {
                    query: address,
                    lat: location.lat,
                    lng: location.lng,
                    formatted: data.results[0].formatted_address, // Human-readable address
                };
            }

            // 📦 Return raw data if structure is unexpected
            return { query: address, raw: data };
        } catch (error) {
            // ❌ Log and re-throw error
            logger.error('Test geocoding error', error);
            throw error;
        }
    },
};
