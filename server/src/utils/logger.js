/**
 * Logger Utility
 * Simple logger with color-coded output
 */

const colors = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m'
};

const formatDate = () => {
    return new Date().toISOString();
};

const logger = {
    info: (message, ...args) => {
        console.log(`${colors.cyan}[${formatDate()}] INFO:${colors.reset}`, message, ...args);
    },

    success: (message, ...args) => {
        console.log(`${colors.green}[${formatDate()}] SUCCESS:${colors.reset}`, message, ...args);
    },

    warn: (message, ...args) => {
        console.warn(`${colors.yellow}[${formatDate()}] WARN:${colors.reset}`, message, ...args);
    },

    error: (message, ...args) => {
        console.error(`${colors.red}[${formatDate()}] ERROR:${colors.reset}`, message, ...args);
    },

    debug: (message, ...args) => {
        if (process.env.NODE_ENV === 'development') {
            console.log(`${colors.magenta}[${formatDate()}] DEBUG:${colors.reset}`, message, ...args);
        }
    }
};

module.exports = { logger };
