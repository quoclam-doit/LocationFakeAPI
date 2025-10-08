/**
 * 🔍 Autocomplete Service
 * 
 * This service provides street address autocomplete suggestions
 * using the Vietmap API with location-based filtering
 * 
 * Key features:
 * - Real-time street suggestions as user types
 * - Filters results by province/district/ward
 * - Uses administrative area filtering for accurate results
 */

// server/src/services/autocompleteService.js
import fetch from 'node-fetch';
import { config } from '../config/env.js';
import { provinceService } from './provinceService.js';
import { logger } from '../utils/logger.js';

// 🔗 Vietmap Autocomplete API endpoint
const VIETMAP_AUTOCOMPLETE_URL = 'https://maps.vietmap.vn/api/autocomplete/v3';

export const autocompleteService = {
    /**
     * 🔍 Autocomplete street addresses using Vietmap API
     * Returns street suggestions filtered by administrative area
     * 
     * @param {string} query - Search query (e.g., "Hàng B")
     * @param {string} wardCode - Ward code for filtering
     * @param {string} districtCode - District code for filtering
     * @param {string} provinceCode - Province code for filtering
     * @returns {Promise<Array<string>>} Array of street suggestions
     */
    async searchStreets(query, wardCode, districtCode, provinceCode) {
        // ⚠️ Validation: Require at least 2 characters
        if (!query || query.length < 2) {
            return [];
        }

        // 🔑 Validation: Ensure API key is configured
        if (!config.vietmapApiKey) {
            logger.error('VIETMAP_API_KEY is not configured');
            throw new Error('Vietmap API key is missing');
        }

        try {
            logger.divider();
            logger.info('📍 Vietmap Autocomplete request', { query, district: districtCode, province: provinceCode });

            // 🏗️ Get administrative names to build filter
            const [provinceName, districtName] = await Promise.all([
                provinceService.getAdminName(provinceCode, 'province'),
                provinceService.getAdminName(districtCode, 'district'),
            ]);

            // 🌏 Build components filter for geographical accuracy
            // Format: "country:VN|administrative_area:Hoàn Kiếm"
            let components = 'country:VN';
            if (districtName) {
                // District is more specific, prefer it
                components += `|administrative_area:${districtName}`;
            } else if (provinceName) {
                // Fallback to province if no district
                components += `|locality:${provinceName}`;
            }

            // 🔗 Build API request URL
            const url = `${VIETMAP_AUTOCOMPLETE_URL}?apikey=${config.vietmapApiKey}&text=${encodeURIComponent(query)}&components=${encodeURIComponent(components)}`;

            logger.debug('📡 Calling Vietmap API', url);

            // 📡 Make HTTP request
            const response = await fetch(url);

            logger.info(`📬 Vietmap Response: ${response.status} ${response.statusText}`);

            // ⚠️ Handle HTTP errors
            if (!response.ok) {
                logger.error('Vietmap API returned error status');
                return [];
            }

            // 📄 Get response text
            const responseText = await response.text();
            logger.debug('📄 Vietmap Raw Response', responseText);

            // ⚠️ Handle empty response
            if (!responseText) {
                logger.warning('Vietmap API returned empty response');
                return [];
            }

            // 📦 Parse JSON
            let data;
            try {
                data = JSON.parse(responseText);
            } catch (error) {
                // ❌ JSON parsing failed
                logger.error('Failed to parse Vietmap JSON response', error);
                return [];
            }

            // 🔍 Extract suggestions from response
            // Important: Vietmap returns array directly (not wrapped in object)
            if (Array.isArray(data) && data.length > 0) {
                // Map each result to its display name
                // Try different fields: display > address > name
                const suggestions = data.map(item => item.display || item.address || item.name);

                logger.success('📤 Returning suggestions', suggestions);
                logger.divider();

                // ✅ Return array of street names
                return suggestions;
            }

            // ℹ️ No results found
            logger.info('ℹ️  Vietmap API returned no results');
            logger.divider();
            return [];

        } catch (error) {
            // ❌ Catch-all error handler
            logger.error('💥 Autocomplete service error', error);
            logger.divider();
            throw error;
        }
    },
};
