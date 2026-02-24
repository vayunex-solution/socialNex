/**
 * SocialMRT Server - Entry Point
 * 
 * Main server file that initializes Express app with all middleware
 */

require('dotenv').config();
const app = require('./src/app');
const { logger } = require('./src/utils/logger');
const { startScheduler } = require('./src/services/schedulerService');
const { startHolidayReminder } = require('./src/services/holidayReminderService');

const PORT = process.env.PORT || 5000;

// Start server
const server = app.listen(PORT, () => {
    logger.info(`🚀 SocialNex Server running on port ${PORT}`);
    logger.info(`📚 API Docs: http://localhost:${PORT}/api-docs`);
    logger.info(`🌍 Environment: ${process.env.NODE_ENV}`);

    // Start the scheduled posts cron job
    startScheduler();
    // Start the holiday reminder cron job (9 AM and 5 PM IST daily)
    startHolidayReminder();
});

// Graceful shutdown
process.on('SIGTERM', () => {
    logger.info('SIGTERM signal received: closing HTTP server');
    server.close(() => {
        logger.info('HTTP server closed');
        process.exit(0);
    });
});

process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception:', error);
    process.exit(1);
});
