// server/src/routes/geocodeRoutes.js
import express from 'express';
import { geocodeController } from '../controllers/geocodeController.js';

const router = express.Router();

// GET /api/geocode - Geocode address to coordinates
router.get('/geocode', geocodeController.geocode);

// GET /api/geocode/test - Test geocoding
router.get('/geocode/test', geocodeController.testGeocode);

// GET /api/geocode/autocomplete - Autocomplete streets
router.get('/geocode/autocomplete', geocodeController.autocompleteStreets);

export default router;
