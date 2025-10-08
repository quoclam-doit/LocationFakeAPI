// server/src/services/geocodeService.js
import fetch from 'node-fetch';
import { config } from '../config/env.js';
import { logger } from '../utils/logger.js';

const GEOCODE_BASE_URL = 'https://api.distancematrix.ai/maps/api/geocode/json';

export const geocodeService = {
    /**
     * Geocode an address to get coordinates
     * @param {string} address - Full address string
     * @returns {Promise<{lat: number, lng: number}>}
     */
    async geocodeAddress(address) {
        if (!address) {
            throw new Error('Address is required');
        }

        if (!config.distanceMatrixApiKey) {
            throw new Error('DISTANCEMATRIX_API_KEY is not configured');
        }

        try {
            logger.info(`🌍 Geocoding address: "${address}"`);

            const url = `${GEOCODE_BASE_URL}?address=${encodeURIComponent(address)}&key=${config.distanceMatrixApiKey}`;
            const response = await fetch(url);
            const data = await response.json();

            logger.debug('Geocode API response', data);

            const results = data.results || data.result;

            if (data.status !== 'OK' || !results?.length) {
                logger.warning('No coordinates found for address', { address, status: data.status });
                throw new Error('Coordinates not found');
            }

            const location = results[0].geometry.location;
            const coordinates = {
                lat: location.lat,
                lng: location.lng,
            };

            logger.success('Geocoding successful', coordinates);
            return coordinates;

        } catch (error) {
            logger.error('Geocoding error', error);
            throw error;
        }
    },

    /**
     * Test geocoding endpoint
     * @param {string} address - Address to test
     * @returns {Promise<Object>}
     */
    async testGeocode(address = 'Hà Nội, Việt Nam') {
        if (!config.distanceMatrixApiKey) {
            throw new Error('DISTANCEMATRIX_API_KEY is not configured');
        }

        try {
            const url = `${GEOCODE_BASE_URL}?address=${encodeURIComponent(address)}&key=${config.distanceMatrixApiKey}`;
            const response = await fetch(url);
            const data = await response.json();

            if (data.status !== 'OK') {
                return { query: address, status: data.status, raw: data };
            }

            if (data.results && data.results.length > 0) {
                const location = data.results[0].geometry.location;
                return {
                    query: address,
                    lat: location.lat,
                    lng: location.lng,
                    formatted: data.results[0].formatted_address,
                };
            }

            return { query: address, raw: data };
        } catch (error) {
            logger.error('Test geocoding error', error);
            throw error;
        }
    },
};
