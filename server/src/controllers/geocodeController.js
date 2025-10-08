/**
 * 🌍 Geocoding & Autocomplete Controller
 * 
 * Handles HTTP requests for:
 * 1. Geocoding (Address → Coordinates)
 * 2. Street autocomplete suggestions
 * 
 * Controllers in MVC:
 * - Validate request parameters
 * - Call appropriate service methods
 * - Format and send responses
 * - Handle errors appropriately
 */

// server/src/controllers/geocodeController.js
import { geocodeService } from '../services/geocodeService.js';
import { autocompleteService } from '../services/autocompleteService.js';

export const geocodeController = {
    /**
     * 📍 GET /api/geocode
     * Convert address string to geographic coordinates
     * 
     * Query params:
     * - address (required): Full address string
     * 
     * Response:
     * - Success: { lat: number, lng: number }
     * - Error 400: Missing address parameter
     * - Error 404: Address not found
     */
    async geocode(req, res, next) {
        try {
            // 📥 Extract and validate address parameter
            const address = req.query.address?.trim();

            // ⚠️ Validation: Require address
            if (!address) {
                return res.status(400).json({
                    message: 'Address parameter is required'
                });
            }

            // 🔄 Call geocoding service
            const coordinates = await geocodeService.geocodeAddress(address);

            // 📤 Send coordinates as JSON
            res.json(coordinates);

        } catch (error) {
            // 🎯 Handle specific "not found" error
            if (error.message === 'Coordinates not found') {
                return res.status(404).json({
                    message: 'Coordinates not found for the given address'
                });
            }

            // ⚠️ Pass other errors to error handler middleware
            next(error);
        }
    },

    /**
     * 🧪 GET /api/test-geocode
     * Test geocoding endpoint (for development/debugging)
     * 
     * Query params:
     * - address (optional): Defaults to "Hà Nội, Việt Nam"
     */
    async testGeocode(req, res, next) {
        try {
            // 📥 Extract address or use default
            const address = req.query.address?.trim() || 'Hà Nội, Việt Nam';

            // 🔄 Call test geocoding service
            const result = await geocodeService.testGeocode(address);

            // 📤 Send test result
            res.json(result);
        } catch (error) {
            // ⚠️ Pass error to error handler
            next(error);
        }
    },

    /**
     * 🔍 GET /api/autocomplete-streets
     * Get street address suggestions as user types
     * 
     * Query params:
     * - q (required): Search query (min 2 characters)
     * - ward (optional): Ward code for filtering
     * - district (optional): District code for filtering
     * - province (optional): Province code for filtering
     * 
     * Response:
     * - Array of street name strings
     */
    async autocompleteStreets(req, res, next) {
        try {
            // 📥 Extract query parameters
            const { q: query, ward, district, province } = req.query;

            // ⚠️ Validation: Require at least 2 characters
            if (!query || query.length < 2) {
                return res.json([]); // Return empty array, not an error
            }

            // 🔄 Call autocomplete service with filters
            const suggestions = await autocompleteService.searchStreets(
                query,
                ward,
                district,
                province
            );

            // 📤 Send suggestions array
            res.json(suggestions);

        } catch (error) {
            // ⚠️ Pass error to error handler
            next(error);
        }
    },
};
