/**
 * Activity Logger Service
 * Call from any controller/service to record user actions.
 */

const { query } = require('../config/database');
const { logger } = require('../utils/logger');

// Action constants (keep consistent across the app)
const ACTIONS = {
    // Auth
    LOGIN_SUCCESS: 'LOGIN_SUCCESS',
    LOGIN_FAILED: 'LOGIN_FAILED',
    LOGOUT: 'LOGOUT',
    PASSWORD_CHANGED: 'PASSWORD_CHANGED',
    PASSWORD_RESET: 'PASSWORD_RESET',
    EMAIL_VERIFIED: 'EMAIL_VERIFIED',
    // Social Accounts
    ACCOUNT_CONNECTED: 'ACCOUNT_CONNECTED',
    ACCOUNT_REMOVED: 'ACCOUNT_REMOVED',
    // Posts
    POST_CREATED: 'POST_CREATED',
    POST_PUBLISHED: 'POST_PUBLISHED',
    POST_FAILED: 'POST_FAILED',
    POST_SCHEDULED: 'POST_SCHEDULED',
    POST_CANCELLED: 'POST_CANCELLED',
    // Settings
    SETTINGS_UPDATED: 'SETTINGS_UPDATED',
};

/**
 * Log a user activity
 * @param {number} userId
 * @param {string} action - Use ACTIONS constants above
 * @param {string|null} entityType - e.g. 'social_account', 'post'
 * @param {number|null} entityId - ID of the entity
 * @param {object|null} details - Extra JSON context (e.g. { platform: 'bluesky', ip: '...' })
 */
async function logActivity(userId, action, entityType = null, entityId = null, details = null) {
    try {
        await query(
            `INSERT INTO activity_logs (user_id, action, entity_type, entity_id, details, created_at)
             VALUES (?, ?, ?, ?, ?, NOW())`,
            [userId, action, entityType, entityId, details ? JSON.stringify(details) : null]
        );
    } catch (err) {
        // Logging must NEVER break the main flow
        logger.warn('activityLogger: failed to insert log:', err.message);
    }
}

module.exports = { logActivity, ACTIONS };
