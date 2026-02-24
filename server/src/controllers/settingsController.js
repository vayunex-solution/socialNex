/**
 * Settings Controller
 * Handles notification preferences and activity log retrieval.
 */

const { query } = require('../config/database');
const { ApiError, asyncHandler } = require('../middleware/errorHandler');
const { logActivity, ACTIONS } = require('../services/activityLogger');
const { logger } = require('../utils/logger');

/**
 * GET /settings/notifications
 * Get current user's notification settings
 */
const getNotificationSettings = asyncHandler(async (req, res) => {
    const userId = req.user.id;

    // Ensure row exists (upsert default)
    await query(
        `INSERT IGNORE INTO notification_settings (user_id) VALUES (?)`,
        [userId]
    );

    const rows = await query(
        `SELECT alert_email, master_toggle, email_on_login_success, email_on_login_fail,
                email_on_post_fail, email_on_account_disconnect, email_marketing_reminders, updated_at
         FROM notification_settings WHERE user_id = ?`,
        [userId]
    );

    const settings = rows[0];
    res.json({
        success: true,
        data: {
            alertEmail: settings.alert_email || null,
            masterToggle: !!settings.master_toggle,
            emailOnLoginSuccess: !!settings.email_on_login_success,
            emailOnLoginFail: !!settings.email_on_login_fail,
            emailOnPostFail: !!settings.email_on_post_fail,
            emailOnAccountDisconnect: !!settings.email_on_account_disconnect,
            emailMarketingReminders: !!settings.email_marketing_reminders,
            updatedAt: settings.updated_at,
        }
    });
});

/**
 * PUT /settings/notifications
 * Update notification preferences
 */
const updateNotificationSettings = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const {
        alertEmail,
        masterToggle,
        emailOnLoginSuccess,
        emailOnLoginFail,
        emailOnPostFail,
        emailOnAccountDisconnect,
        emailMarketingReminders,
    } = req.body;

    // Validate alertEmail if provided
    if (alertEmail !== undefined && alertEmail !== null && alertEmail !== '') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(alertEmail)) {
            throw new ApiError(400, 'Please provide a valid alert email address.');
        }
    }

    // Build update fields dynamically
    const updates = [];
    const values = [];

    if (alertEmail !== undefined) { updates.push('alert_email = ?'); values.push(alertEmail || null); }
    if (masterToggle !== undefined) { updates.push('master_toggle = ?'); values.push(masterToggle ? 1 : 0); }
    if (emailOnLoginSuccess !== undefined) { updates.push('email_on_login_success = ?'); values.push(emailOnLoginSuccess ? 1 : 0); }
    if (emailOnLoginFail !== undefined) { updates.push('email_on_login_fail = ?'); values.push(emailOnLoginFail ? 1 : 0); }
    if (emailOnPostFail !== undefined) { updates.push('email_on_post_fail = ?'); values.push(emailOnPostFail ? 1 : 0); }
    if (emailOnAccountDisconnect !== undefined) { updates.push('email_on_account_disconnect = ?'); values.push(emailOnAccountDisconnect ? 1 : 0); }
    if (emailMarketingReminders !== undefined) { updates.push('email_marketing_reminders = ?'); values.push(emailMarketingReminders ? 1 : 0); }

    if (updates.length === 0) {
        throw new ApiError(400, 'No settings provided to update.');
    }

    values.push(userId);

    await query(
        `INSERT INTO notification_settings (user_id${updates.length ? ', ' + updates.map(u => u.split(' ')[0]).join(', ') : ''})
         VALUES (?${values.slice(0, -1).map(() => ', ?').join('')})
         ON DUPLICATE KEY UPDATE ${updates.join(', ')}, updated_at = NOW()`,
        [userId, ...values]
    );

    await logActivity(userId, ACTIONS.SETTINGS_UPDATED, null, null, { fields: updates.map(u => u.split(' ')[0]) });

    res.json({
        success: true,
        message: 'Notification settings updated!'
    });
});

/**
 * GET /logs/activity
 * Get recent user activity log (last 100 entries)
 */
const getActivityLogs = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 50, 100);
    const offset = (page - 1) * limit;

    const logs = await query(
        `SELECT id, action, entity_type, entity_id, details, created_at
         FROM activity_logs
         WHERE user_id = ?
         ORDER BY created_at DESC
         LIMIT ? OFFSET ?`,
        [userId, limit, offset]
    );

    const [{ total }] = await query(
        `SELECT COUNT(*) AS total FROM activity_logs WHERE user_id = ?`,
        [userId]
    );

    const parsedLogs = logs.map(log => ({
        id: log.id,
        action: log.action,
        entityType: log.entity_type,
        entityId: log.entity_id,
        details: log.details ? (typeof log.details === 'string' ? JSON.parse(log.details) : log.details) : null,
        createdAt: log.created_at,
    }));

    res.json({
        success: true,
        data: parsedLogs,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    });
});

module.exports = { getNotificationSettings, updateNotificationSettings, getActivityLogs };
