/**
 * Scheduler Controller
 * CRUD endpoints for scheduled posts + calendar view
 */

const { asyncHandler, ApiError } = require('../middleware/errorHandler');
const { query } = require('../config/database');
const { logger } = require('../utils/logger');

/**
 * GET /posts/scheduled
 * List scheduled posts with optional status filter
 */
const getScheduledPosts = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { status, limit = 50, offset = 0 } = req.query;

    let sql = `SELECT sp.*, 
               (SELECT GROUP_CONCAT(sa.platform) FROM social_accounts sa WHERE FIND_IN_SET(sa.id, REPLACE(REPLACE(sp.account_ids, '[', ''), ']', ''))) as platforms
               FROM scheduled_posts sp 
               WHERE sp.user_id = ?`;
    const params = [userId];

    if (status) {
        sql += ' AND sp.status = ?';
        params.push(status);
    }

    sql += ' ORDER BY sp.scheduled_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const posts = await query(sql, params);

    // Parse JSON fields
    const parsed = posts.map(p => ({
        ...p,
        account_ids: typeof p.account_ids === 'string' ? JSON.parse(p.account_ids) : p.account_ids,
        publish_results: p.publish_results ? (typeof p.publish_results === 'string' ? JSON.parse(p.publish_results) : p.publish_results) : null,
        images: p.images ? (typeof p.images === 'string' ? JSON.parse(p.images) : p.images) : null
    }));

    res.json({ success: true, data: parsed });
});

/**
 * POST /posts/scheduled
 * Create a new scheduled post
 */
const createScheduledPost = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { content, accountIds, scheduledAt, timezone, discordBotName } = req.body;

    if (!content || content.trim().length === 0) {
        throw new ApiError(400, 'Post content is required.');
    }
    if (!accountIds || accountIds.length === 0) {
        throw new ApiError(400, 'Select at least one platform.');
    }
    if (!scheduledAt) {
        throw new ApiError(400, 'Scheduled date/time is required.');
    }

    const schedDate = new Date(scheduledAt);
    if (schedDate <= new Date()) {
        throw new ApiError(400, 'Scheduled time must be in the future.');
    }

    // Validate accounts belong to user
    const placeholders = accountIds.map(() => '?').join(',');
    const validAccounts = await query(
        `SELECT id FROM social_accounts WHERE id IN (${placeholders}) AND user_id = ? AND is_active = 1`,
        [...accountIds, userId]
    );

    if (validAccounts.length === 0) {
        throw new ApiError(404, 'No valid connected accounts found.');
    }

    // Handle images if uploaded
    let imagesData = null;
    if (req.files && req.files.length > 0) {
        imagesData = JSON.stringify(req.files.map(f => ({
            data: f.buffer.toString('base64'),
            mimeType: f.mimetype,
            size: f.size
        })));
    }

    const result = await query(
        `INSERT INTO scheduled_posts 
         (user_id, content, account_ids, images, scheduled_at, timezone, discord_bot_name)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
            userId,
            content.trim(),
            JSON.stringify(accountIds),
            imagesData,
            schedDate,
            timezone || 'Asia/Kolkata',
            discordBotName || 'SocialNex'
        ]
    );

    logger.info(`Scheduled post ${result.insertId} created for user ${userId}, due at ${scheduledAt}`);

    res.status(201).json({
        success: true,
        message: `Post scheduled for ${schedDate.toLocaleString()}`,
        data: { id: result.insertId, scheduledAt: schedDate }
    });
});

/**
 * PUT /posts/scheduled/:id
 * Update/reschedule a post
 */
const updateScheduledPost = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { id } = req.params;
    const { content, accountIds, scheduledAt, timezone, discordBotName } = req.body;

    // Verify ownership and status
    const [post] = await query(
        'SELECT * FROM scheduled_posts WHERE id = ? AND user_id = ?',
        [id, userId]
    );

    if (!post) {
        throw new ApiError(404, 'Scheduled post not found.');
    }

    if (post.status !== 'scheduled') {
        throw new ApiError(400, `Cannot edit a post with status: ${post.status}`);
    }

    const updates = {};
    if (content) updates.content = content.trim();
    if (accountIds) updates.account_ids = JSON.stringify(accountIds);
    if (scheduledAt) {
        const schedDate = new Date(scheduledAt);
        if (schedDate <= new Date()) {
            throw new ApiError(400, 'Scheduled time must be in the future.');
        }
        updates.scheduled_at = schedDate;
    }
    if (timezone) updates.timezone = timezone;
    if (discordBotName) updates.discord_bot_name = discordBotName;

    const setClauses = Object.keys(updates).map(k => `${k} = ?`).join(', ');
    const values = Object.values(updates);

    if (setClauses) {
        await query(
            `UPDATE scheduled_posts SET ${setClauses}, updated_at = NOW() WHERE id = ?`,
            [...values, id]
        );
    }

    res.json({
        success: true,
        message: 'Scheduled post updated.',
        data: { id: parseInt(id) }
    });
});

/**
 * DELETE /posts/scheduled/:id
 * Cancel a scheduled post
 */
const cancelScheduledPost = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { id } = req.params;

    const [post] = await query(
        'SELECT * FROM scheduled_posts WHERE id = ? AND user_id = ?',
        [id, userId]
    );

    if (!post) {
        throw new ApiError(404, 'Scheduled post not found.');
    }

    if (post.status !== 'scheduled') {
        throw new ApiError(400, `Cannot cancel a post with status: ${post.status}`);
    }

    await query(
        'UPDATE scheduled_posts SET status = ?, updated_at = NOW() WHERE id = ?',
        ['cancelled', id]
    );

    res.json({
        success: true,
        message: 'Scheduled post cancelled.'
    });
});

/**
 * GET /posts/calendar
 * Get posts grouped by date for calendar view
 */
const getCalendarData = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { month, year } = req.query;

    const m = parseInt(month) || new Date().getMonth() + 1;
    const y = parseInt(year) || new Date().getFullYear();

    // Get scheduled posts for this month
    const scheduled = await query(
        `SELECT id, content, account_ids, scheduled_at, status, publish_results
         FROM scheduled_posts 
         WHERE user_id = ? AND MONTH(scheduled_at) = ? AND YEAR(scheduled_at) = ?
         ORDER BY scheduled_at ASC`,
        [userId, m, y]
    );

    // Get instant posts for this month (from post_results)
    const instant = await query(
        `SELECT id, content, platform, account_name, status, published_at, post_type
         FROM post_results
         WHERE user_id = ? AND MONTH(published_at) = ? AND YEAR(published_at) = ?
         ORDER BY published_at ASC`,
        [userId, m, y]
    );

    // Group by date
    const calendar = {};

    scheduled.forEach(p => {
        const date = new Date(p.scheduled_at).toISOString().split('T')[0];
        if (!calendar[date]) calendar[date] = { scheduled: [], published: [] };
        calendar[date].scheduled.push({
            ...p,
            account_ids: typeof p.account_ids === 'string' ? JSON.parse(p.account_ids) : p.account_ids
        });
    });

    instant.forEach(p => {
        const date = new Date(p.published_at).toISOString().split('T')[0];
        if (!calendar[date]) calendar[date] = { scheduled: [], published: [] };
        calendar[date].published.push(p);
    });

    res.json({
        success: true,
        data: { month: m, year: y, calendar }
    });
});

/**
 * GET /posts/history
 * Get published post history with results
 */
const getPostHistory = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { limit = 30, offset = 0, platform } = req.query;

    let sql = `SELECT * FROM post_results WHERE user_id = ?`;
    const params = [userId];

    if (platform) {
        sql += ' AND platform = ?';
        params.push(platform);
    }

    sql += ' ORDER BY published_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const history = await query(sql, params);

    // Get total count
    let countSql = 'SELECT COUNT(*) as total FROM post_results WHERE user_id = ?';
    const countParams = [userId];
    if (platform) {
        countSql += ' AND platform = ?';
        countParams.push(platform);
    }
    const [{ total }] = await query(countSql, countParams);

    res.json({
        success: true,
        data: { posts: history, total, limit: parseInt(limit), offset: parseInt(offset) }
    });
});

module.exports = {
    getScheduledPosts,
    createScheduledPost,
    updateScheduledPost,
    cancelScheduledPost,
    getCalendarData,
    getPostHistory
};
