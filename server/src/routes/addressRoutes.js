// server/src/routes/addressRoutes.js
import express from 'express';
import { addressController } from '../controllers/addressController.js';

const router = express.Router();

// GET /api/addresses/provinces - Get all provinces
router.get('/provinces', addressController.getProvinces);

// GET /api/addresses/provinces/:code - Get province by code with districts
router.get('/provinces/:code', addressController.getProvinceByCode);

// GET /api/addresses/districts/:code - Get district by code with wards
router.get('/districts/:code', addressController.getDistrictByCode);

export default router;
