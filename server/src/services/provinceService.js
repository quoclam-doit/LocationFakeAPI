// ============================================
// 🏗️ PROVINCE SERVICE (DỊCH VỤ LẤY DỮ LIỆU ĐỊA CHỈ)
// ============================================
// Mục đích: Xử lý logic nghiệp vụ cho dữ liệu địa chỉ
// Chức năng: Lấy dữ liệu tỉnh, quận/huyện, phường/xã từ API bên ngoài
// Cache: Sử dụng adminNameCache để lưu dữ liệu hay dùng
// ============================================

import fetch from 'node-fetch';
import { adminNameCache } from '../utils/cache.js';
import { logger } from '../utils/logger.js';

// 🌐 Cấu hình API
const BASE_URL = 'https://provinces.open-api.vn/api/v1';

export const provinceService = {
    /**
     * 📍 Lấy tất cả các tỉnh/thành phố ở Việt Nam
     * @param {number} depth - Độ sâu dữ liệu (1 = chỉ tỉnh, 2 = kèm quận/huyện)
     * @returns {Promise<Array>} Mảng các đối tượng tỉnh/thành phố
     */
    async getAllProvinces(depth = 1) {
        try {
            // 📡 Gọi API bên ngoài để lấy dữ liệu tỉnh
            const response = await fetch(`${BASE_URL}/?depth=${depth}`);

            // ✅ Kiểm tra xem request có thành công không
            if (!response.ok) throw new Error('Failed to fetch provinces');

            // 📦 Parse và trả về dữ liệu JSON
            return await response.json();
        } catch (error) {
            // ❌ Log lỗi để debug
            logger.error('Error fetching provinces', error);
            throw error; // Ném lại lỗi để controller xử lý
        }
    },

    /**
     * 🏙️ Lấy chi tiết tỉnh/thành phố theo mã (kèm quận/huyện nếu depth=2)
     * @param {string} code - Mã tỉnh (ví dụ: "01" là Hà Nội)
     * @param {number} depth - Độ sâu dữ liệu (1 = cơ bản, 2 = kèm quận/huyện)
     * @returns {Promise<Object>} Đối tượng tỉnh kèm danh sách quận/huyện
     */
    async getProvinceByCode(code, depth = 2) {
        try {
            // 📡 Lấy dữ liệu của tỉnh cụ thể
            const response = await fetch(`${BASE_URL}/p/${code}?depth=${depth}`);

            // ✅ Kiểm tra response
            if (!response.ok) throw new Error(`Failed to fetch province ${code}`);

            // 📦 Return province data with districts
            return await response.json();
        } catch (error) {
            // ❌ Log and re-throw error
            logger.error(`Error fetching province ${code}`, error);
            throw error;
        }
    },

    /**
     * 🏘️ Get district details by code (includes wards if depth=2)
     * @param {string} code - District code
     * @param {number} depth - Depth level (1 = basic, 2 = with wards)
     * @returns {Promise<Object>} District object with wards
     */
    async getDistrictByCode(code, depth = 2) {
        try {
            // 📡 Fetch specific district data
            const response = await fetch(`${BASE_URL}/d/${code}?depth=${depth}`);

            // ✅ Validate response
            if (!response.ok) throw new Error(`Failed to fetch district ${code}`);

            // 📦 Return district data with wards
            return await response.json();
        } catch (error) {
            // ❌ Log and re-throw error
            logger.error(`Error fetching district ${code}`, error);
            throw error;
        }
    },

    /**
     * 🔍 Get administrative unit name by code (with cache)
     * Uses a simple in-memory cache to avoid repeated API calls
     * 
     * @param {string} code - Administrative unit code
     * @param {string} type - Type: 'province', 'district', 'ward'
     * @returns {Promise<string|null>} Name or null if not found
     */
    async getAdminName(code, type) {
        // ⚠️ Early return for empty code
        if (!code) return null;

        // 💾 Check cache first (performance optimization)
        const cacheKey = `${type}-${code}`;
        const cachedName = adminNameCache.get(cacheKey);
        if (cachedName) {
            logger.debug(`Cache hit for ${cacheKey}`, cachedName);
            return cachedName;
        }

        try {
            // 🔗 Build appropriate URL based on type
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
                    // ❌ Invalid type
                    return null;
            }

            // 📡 Fetch data from API
            const response = await fetch(url);
            if (!response.ok) return null;

            // 📦 Parse response
            const data = await response.json();
            const name = data.name || null;

            // 💾 Cache the result for future use (performance)
            if (name) {
                adminNameCache.set(cacheKey, name);
                logger.debug(`Cached ${cacheKey}`, name);
            }

            // ✅ Return the name
            return name;
        } catch (error) {
            // ❌ Log error and return null (graceful degradation)
            logger.error(`Error fetching ${type} name for code ${code}`, error);
            return null;
        }
    },
};
