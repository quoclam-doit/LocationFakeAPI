// server/src/controllers/addressController.js
import { provinceService } from '../services/provinceService.js';
import { logger } from '../utils/logger.js';

export const addressController = {
    /**
     * GET /api/provinces
     * Get all provinces
     */
    async getProvinces(req, res, next) {
        try {
            const depth = parseInt(req.query.depth) || 1;
            const provinces = await provinceService.getAllProvinces(depth);
            res.json(provinces);
        } catch (error) {
            next(error);
        }
    },

    /**
     * GET /api/provinces/:code
     * Get province by code with districts
     */
    async getProvinceByCode(req, res, next) {
        try {
            const { code } = req.params;
            const depth = parseInt(req.query.depth) || 2;
            const province = await provinceService.getProvinceByCode(code, depth);
            res.json(province);
        } catch (error) {
            next(error);
        }
    },

    /**
     * GET /api/districts/:code
     * Get district by code with wards
     */
    async getDistrictByCode(req, res, next) {
        try {
            const { code } = req.params;
            const depth = parseInt(req.query.depth) || 2;
            const district = await provinceService.getDistrictByCode(code, depth);
            res.json(district);
        } catch (error) {
            next(error);
        }
    },
};
