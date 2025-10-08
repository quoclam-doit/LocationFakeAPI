// server/src/config/env.js
import dotenv from 'dotenv';

dotenv.config();

export const config = {
    port: process.env.PORT || 5000,
    distanceMatrixApiKey: process.env.DISTANCEMATRIX_API_KEY,
    vietmapApiKey: process.env.VIETMAP_API_KEY,
    env: process.env.NODE_ENV || 'development',
};

// Validate required environment variables
export const validateConfig = () => {
    const requiredVars = ['DISTANCEMATRIX_API_KEY', 'VIETMAP_API_KEY'];
    const missing = requiredVars.filter(varName => !process.env[varName]);

    if (missing.length > 0) {
        console.warn(`⚠️  Warning: Missing environment variables: ${missing.join(', ')}`);
    }

    return missing.length === 0;
};
