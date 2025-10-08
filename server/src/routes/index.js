// server/src/routes/index.js
import express from 'express';
import addressRoutes from './addressRoutes.js';
import geocodeRoutes from './geocodeRoutes.js';

const router = express.Router();

// Health check
router.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'Server is running',
        timestamp: new Date().toISOString(),
    });
});

// Mount routes
router.use('/addresses', addressRoutes);
router.use('/', geocodeRoutes);

export default router;
