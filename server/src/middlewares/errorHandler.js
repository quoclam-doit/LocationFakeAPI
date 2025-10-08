// server/src/middlewares/errorHandler.js
import { logger } from '../utils/logger.js';

export const errorHandler = (err, req, res, next) => {
    logger.error(`Error on ${req.method} ${req.path}`, err);

    // Default error
    let statusCode = 500;
    let message = 'Internal Server Error';

    // Handle specific errors
    if (err.message === 'Address is required') {
        statusCode = 400;
        message = err.message;
    } else if (err.message === 'Coordinates not found') {
        statusCode = 404;
        message = err.message;
    } else if (err.message.includes('API key')) {
        statusCode = 500;
        message = 'Server configuration error';
    }

    res.status(statusCode).json({
        success: false,
        message: message,
        ...(process.env.NODE_ENV === 'development' && { error: err.message, stack: err.stack }),
    });
};

export const notFoundHandler = (req, res) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.method} ${req.path} not found`,
    });
};
