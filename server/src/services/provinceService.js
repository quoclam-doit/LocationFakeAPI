// server/src/services/provinceService.js
import fetch from 'node-fetch';
import { adminNameCache } from '../utils/cache.js';
import { logger } from '../utils/logger.js';

const BASE_URL = 'https://provinces.open-api.vn/api/v1';

export const provinceService = {
    /**
     * Get all provinces
     * @param {number} depth - Depth level (1 or 2)
     * @returns {Promise<Array>}
     */
    async getAllProvinces(depth = 1) {
        try {
            const response = await fetch(`${BASE_URL}/?depth=${depth}`);
            if (!response.ok) throw new Error('Failed to fetch provinces');
            return await response.json();
        } catch (error) {
            logger.error('Error fetching provinces', error);
            throw error;
        }
    },

    /**
     * Get province by code with districts
     * @param {string} code - Province code
     * @param {number} depth - Depth level
     * @returns {Promise<Object>}
     */
    async getProvinceByCode(code, depth = 2) {
        try {
            const response = await fetch(`${BASE_URL}/p/${code}?depth=${depth}`);
            if (!response.ok) throw new Error(`Failed to fetch province ${code}`);
            return await response.json();
        } catch (error) {
            logger.error(`Error fetching province ${code}`, error);
            throw error;
        }
    },

    /**
     * Get district by code with wards
     * @param {string} code - District code
     * @param {number} depth - Depth level
     * @returns {Promise<Object>}
     */
    async getDistrictByCode(code, depth = 2) {
        try {
            const response = await fetch(`${BASE_URL}/d/${code}?depth=${depth}`);
            if (!response.ok) throw new Error(`Failed to fetch district ${code}`);
            return await response.json();
        } catch (error) {
            logger.error(`Error fetching district ${code}`, error);
            throw error;
        }
    },

    /**
     * Get administrative unit name by code (with cache)
     * @param {string} code - Administrative unit code
     * @param {string} type - Type: 'province', 'district', 'ward'
     * @returns {Promise<string|null>}
     */
    async getAdminName(code, type) {
        if (!code) return null;

        // Check cache first
        const cacheKey = `${type}-${code}`;
        const cachedName = adminNameCache.get(cacheKey);
        if (cachedName) {
            logger.debug(`Cache hit for ${cacheKey}`, cachedName);
            return cachedName;
        }

        try {
            let url;
            switch (type) {
                case 'province':
                    url = `${BASE_URL}/p/${code}?depth=1`;
                    break;
                case 'district':
                    url = `${BASE_URL}/d/${code}?depth=1`;
                    break;
                case 'ward':
                    url = `${BASE_URL}/w/${code}?depth=1`;
                    break;
                default:
                    return null;
            }

            const response = await fetch(url);
            if (!response.ok) return null;

            const data = await response.json();
            const name = data.name || null;

            if (name) {
                adminNameCache.set(cacheKey, name);
                logger.debug(`Cached ${cacheKey}`, name);
            }

            return name;
        } catch (error) {
            logger.error(`Error fetching ${type} name for code ${code}`, error);
            return null;
        }
    },
};
