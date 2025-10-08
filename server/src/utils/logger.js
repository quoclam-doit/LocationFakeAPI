// server/src/utils/logger.js

const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
};

export const logger = {
    info: (message, data = null) => {
        console.log(`${colors.blue}ℹ️  [INFO]${colors.reset} ${message}`);
        if (data) console.log(data);
    },

    success: (message, data = null) => {
        console.log(`${colors.green}✅ [SUCCESS]${colors.reset} ${message}`);
        if (data) console.log(data);
    },

    warning: (message, data = null) => {
        console.log(`${colors.yellow}⚠️  [WARNING]${colors.reset} ${message}`);
        if (data) console.log(data);
    },

    error: (message, error = null) => {
        console.error(`${colors.red}❌ [ERROR]${colors.reset} ${message}`);
        if (error) console.error(error);
    },

    debug: (message, data = null) => {
        if (process.env.NODE_ENV === 'development') {
            console.log(`${colors.magenta}🔍 [DEBUG]${colors.reset} ${message}`);
            if (data) console.log(data);
        }
    },

    divider: () => {
        console.log(`${colors.cyan}${'='.repeat(80)}${colors.reset}`);
    },
};
