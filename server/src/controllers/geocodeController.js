// server/src/controllers/geocodeController.js
import { geocodeService } from '../services/geocodeService.js';
import { autocompleteService } from '../services/autocompleteService.js';

export const geocodeController = {
    /**
     * GET /api/geocode
     * Geocode an address to coordinates
     */
    async geocode(req, res, next) {
        try {
            const address = req.query.address?.trim();

            if (!address) {
                return res.status(400).json({
                    message: 'Address parameter is required'
                });
            }

            const coordinates = await geocodeService.geocodeAddress(address);
            res.json(coordinates);

        } catch (error) {
            if (error.message === 'Coordinates not found') {
                return res.status(404).json({
                    message: 'Coordinates not found for the given address'
                });
            }
            next(error);
        }
    },

    /**
     * GET /api/test-geocode
     * Test geocoding endpoint
     */
    async testGeocode(req, res, next) {
        try {
            const address = req.query.address?.trim() || 'Hà Nội, Việt Nam';
            const result = await geocodeService.testGeocode(address);
            res.json(result);
        } catch (error) {
            next(error);
        }
    },

    /**
     * GET /api/autocomplete-streets
     * Autocomplete street addresses
     */
    async autocompleteStreets(req, res, next) {
        try {
            const { q: query, ward, district, province } = req.query;

            if (!query || query.length < 2) {
                return res.json([]);
            }

            const suggestions = await autocompleteService.searchStreets(
                query,
                ward,
                district,
                province
            );

            res.json(suggestions);

        } catch (error) {
            next(error);
        }
    },
};
