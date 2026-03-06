/**
 * Media Cleanup Job
 * Automatically cleans up temporary upload files older than a specified age.
 * Run this via node-cron or as a standalone script.
 * 
 * Cleans: uploads/videos/ (YouTube temp uploads)
 * Interval: Every 6 hours
 * Max Age: 24 hours (files older than this get deleted)
 */

const fs = require('fs');
const path = require('path');
const { logger } = require('../utils/logger');

const UPLOAD_DIRS = [
    path.resolve(__dirname, '../../uploads/videos'),
    path.resolve(__dirname, '../../uploads'),
];

const MAX_AGE_HOURS = 24; // Delete files older than 24 hours

function cleanupOldFiles() {
    const maxAgeMs = MAX_AGE_HOURS * 60 * 60 * 1000;
    const now = Date.now();
    let totalDeleted = 0;

    for (const dir of UPLOAD_DIRS) {
        if (!fs.existsSync(dir)) continue;

        try {
            const files = fs.readdirSync(dir);
            for (const file of files) {
                // Skip directories and hidden files
                const filePath = path.join(dir, file);
                const stat = fs.statSync(filePath);
                if (stat.isDirectory()) continue;

                // Check age
                const age = now - stat.mtimeMs;
                if (age > maxAgeMs) {
                    try {
                        fs.unlinkSync(filePath);
                        totalDeleted++;
                        logger.info(`[MediaCleanup] Deleted: ${file} (age: ${Math.round(age / 3600000)}h)`);
                    } catch (err) {
                        logger.warn(`[MediaCleanup] Failed to delete ${file}: ${err.message}`);
                    }
                }
            }
        } catch (err) {
            logger.warn(`[MediaCleanup] Error reading ${dir}: ${err.message}`);
        }
    }

    if (totalDeleted > 0) {
        logger.info(`[MediaCleanup] Cleanup complete: ${totalDeleted} file(s) deleted`);
    }
}

// Export for use with node-cron or standalone
module.exports = { cleanupOldFiles, MAX_AGE_HOURS };

// If run directly: node src/jobs/mediaCleanup.js
if (require.main === module) {
    console.log('Running media cleanup...');
    cleanupOldFiles();
    console.log('Done.');
}
