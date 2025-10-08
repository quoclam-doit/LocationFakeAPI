// server/src/services/autocompleteService.js
import fetch from 'node-fetch';
import { config } from '../config/env.js';
import { provinceService } from './provinceService.js';
import { logger } from '../utils/logger.js';

const VIETMAP_AUTOCOMPLETE_URL = 'https://maps.vietmap.vn/api/autocomplete/v3';

export const autocompleteService = {
    /**
     * Autocomplete street addresses using Vietmap API
     * @param {string} query - Search query
     * @param {string} wardCode - Ward code
     * @param {string} districtCode - District code
     * @param {string} provinceCode - Province code
     * @returns {Promise<Array<string>>}
     */
    async searchStreets(query, wardCode, districtCode, provinceCode) {
        if (!query || query.length < 2) {
            return [];
        }

        if (!config.vietmapApiKey) {
            logger.error('VIETMAP_API_KEY is not configured');
            throw new Error('Vietmap API key is missing');
        }

        try {
            logger.divider();
            logger.info('📍 Vietmap Autocomplete request', { query, district: districtCode, province: provinceCode });

            // Get administrative names
            const [provinceName, districtName] = await Promise.all([
                provinceService.getAdminName(provinceCode, 'province'),
                provinceService.getAdminName(districtCode, 'district'),
            ]);

            // Build components filter
            let components = 'country:VN';
            if (districtName) {
                components += `|administrative_area:${districtName}`;
            } else if (provinceName) {
                components += `|locality:${provinceName}`;
            }

            const url = `${VIETMAP_AUTOCOMPLETE_URL}?apikey=${config.vietmapApiKey}&text=${encodeURIComponent(query)}&components=${encodeURIComponent(components)}`;

            logger.debug('📡 Calling Vietmap API', url);

            const response = await fetch(url);

            logger.info(`📬 Vietmap Response: ${response.status} ${response.statusText}`);

            if (!response.ok) {
                logger.error('Vietmap API returned error status');
                return [];
            }

            const responseText = await response.text();
            logger.debug('📄 Vietmap Raw Response', responseText);

            if (!responseText) {
                logger.warning('Vietmap API returned empty response');
                return [];
            }

            // Parse JSON
            let data;
            try {
                data = JSON.parse(responseText);
            } catch (error) {
                logger.error('Failed to parse Vietmap JSON response', error);
                return [];
            }

            // Vietmap returns array directly
            if (Array.isArray(data) && data.length > 0) {
                const suggestions = data.map(item => item.display || item.address || item.name);
                logger.success('📤 Returning suggestions', suggestions);
                logger.divider();
                return suggestions;
            }

            logger.info('ℹ️  Vietmap API returned no results');
            logger.divider();
            return [];

        } catch (error) {
            logger.error('💥 Autocomplete service error', error);
            logger.divider();
            throw error;
        }
    },
};
