// server/server.js
import express from 'express';
import cors from 'cors';
import { config, validateConfig } from './src/config/env.js';
import routes from './src/routes/index.js';
import { errorHandler, notFoundHandler } from './src/middlewares/errorHandler.js';
import { logger } from './src/utils/logger.js';

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Validate configuration
validateConfig();

// API Routes
app.use('/api', routes);

// For backward compatibility - keep old routes
import addressRoutes from './src/routes/addressRoutes.js';
import geocodeRoutes from './src/routes/geocodeRoutes.js';

// Mount old routes directly under /api
app.use('/api', addressRoutes);
app.use('/api', geocodeRoutes);

// Add backward compatibility for autocomplete
import { geocodeController } from './src/controllers/geocodeController.js';
app.get('/api/autocomplete-streets', geocodeController.autocompleteStreets);
app.get('/api/test-geocode', geocodeController.testGeocode);

// 404 handler
app.use(notFoundHandler);

// Error handler (must be last)
app.use(errorHandler);

// Start server
app.listen(config.port, () => {
  logger.divider();
  logger.success(`🚀 Server started on http://localhost:${config.port}`);
  logger.info(`📝 Environment: ${config.env}`);
  logger.info(`🔑 API Keys configured: ${config.distanceMatrixApiKey ? '✅' : '❌'} DistanceMatrix, ${config.vietmapApiKey ? '✅' : '❌'} Vietmap`);
  logger.divider();
});

export default app;
