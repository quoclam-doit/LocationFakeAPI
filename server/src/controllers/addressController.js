/**
 * 🏛️ Address Controller
 * 
 * Handles HTTP requests for Vietnamese administrative divisions
 * (Provinces, Districts, Wards)
 * 
 * Controllers in MVC:
 * - Receive HTTP requests from routes
 * - Extract parameters from req (params, query, body)
 * - Call service layer for business logic
 * - Send JSON response to client
 * - Pass errors to error handler middleware
 */

// server/src/controllers/addressController.js
import { provinceService } from '../services/provinceService.js';
import { logger } from '../utils/logger.js';

export const addressController = {
    /**
     * 🏙️ GET /api/provinces
     * Get all provinces in Vietnam
     * 
     * Query params:
     * - depth (optional): 1 = basic info, 2 = with districts
     */
    async getProvinces(req, res, next) {
        try {
            // 📥 Extract query parameter (with default value)
            const depth = parseInt(req.query.depth) || 1;

            // 🔄 Call service layer
            const provinces = await provinceService.getAllProvinces(depth);

            // 📤 Send JSON response
            res.json(provinces);
        } catch (error) {
            // ⚠️ Pass error to error handler middleware
            next(error);
        }
    },

    /**
     * 🏙️ GET /api/provinces/:code
     * Get specific province by code with its districts
     * 
     * URL params:
     * - code: Province code (e.g., "01" for Hà Nội)
     * 
     * Query params:
     * - depth (optional): 1 = basic info, 2 = with districts
     */
    async getProvinceByCode(req, res, next) {
        try {
            // 📥 Extract URL parameter
            const { code } = req.params;

            // 📥 Extract query parameter
            const depth = parseInt(req.query.depth) || 2;

            // 🔄 Call service layer
            const province = await provinceService.getProvinceByCode(code, depth);

            // 📤 Send JSON response
            res.json(province);
        } catch (error) {
            // ⚠️ Pass error to error handler middleware
            next(error);
        }
    },

    /**
     * 🏘️ GET /api/districts/:code
     * Get specific district by code with its wards
     * 
     * URL params:
     * - code: District code (e.g., "001")
     * 
     * Query params:
     * - depth (optional): 1 = basic info, 2 = with wards
     */
    async getDistrictByCode(req, res, next) {
        try {
            // 📥 Extract URL parameter
            const { code } = req.params;

            // 📥 Extract query parameter
            const depth = parseInt(req.query.depth) || 2;

            // 🔄 Call service layer
            const district = await provinceService.getDistrictByCode(code, depth);

            // 📤 Send JSON response
            res.json(district);
        } catch (error) {
            // ⚠️ Pass error to error handler middleware
            next(error);
        }
    },
};
