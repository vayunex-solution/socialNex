/**
 * Analytics Controller
 * Dashboard stats, daily charts, platform breakdowns
 */

const { asyncHandler } = require('../middleware/errorHandler');
const { query } = require('../config/database');

/**
 * GET /analytics/overview
 * Dashboard summary stats
 */
const getOverview = asyncHandler(async (req, res) => {
    const userId = req.user.id;

    // Total posts ever
    const [{ totalPosts }] = await query(
        'SELECT COUNT(*) as totalPosts FROM post_results WHERE user_id = ?',
        [userId]
    );

    // Success/fail counts
    const [{ successCount }] = await query(
        "SELECT COUNT(*) as successCount FROM post_results WHERE user_id = ? AND status = 'success'",
        [userId]
    );

    const successRate = totalPosts > 0 ? Math.round((successCount / totalPosts) * 100) : 0;

    // Posts this week
    const [{ weekPosts }] = await query(
        'SELECT COUNT(*) as weekPosts FROM post_results WHERE user_id = ? AND published_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)',
        [userId]
    );

    // Posts this month
    const [{ monthPosts }] = await query(
        'SELECT COUNT(*) as monthPosts FROM post_results WHERE user_id = ? AND published_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)',
        [userId]
    );

    // Most active platform
    const platformStats = await query(
        `SELECT platform, COUNT(*) as count 
         FROM post_results WHERE user_id = ? AND status = 'success'
         GROUP BY platform ORDER BY count DESC LIMIT 1`,
        [userId]
    );
    const topPlatform = platformStats.length > 0 ? platformStats[0].platform : null;

    // Scheduled posts pending
    const [{ pendingPosts }] = await query(
        "SELECT COUNT(*) as pendingPosts FROM scheduled_posts WHERE user_id = ? AND status = 'scheduled'",
        [userId]
    );

    // Connected accounts count
    const [{ accountsCount }] = await query(
        'SELECT COUNT(*) as accountsCount FROM social_accounts WHERE user_id = ? AND is_active = 1',
        [userId]
    );

    res.json({
        success: true,
        data: {
            totalPosts,
            successRate,
            weekPosts,
            monthPosts,
            topPlatform,
            pendingPosts,
            accountsCount
        }
    });
});

/**
 * GET /analytics/daily
 * Daily post counts for chart (last N days)
 */
const getDailyStats = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { days = 30 } = req.query;
    const dayCount = Math.min(parseInt(days), 90);

    const stats = await query(
        `SELECT DATE(published_at) as date, 
                COUNT(*) as total,
                SUM(CASE WHEN status = 'success' THEN 1 ELSE 0 END) as success,
                SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed
         FROM post_results 
         WHERE user_id = ? AND published_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
         GROUP BY DATE(published_at)
         ORDER BY date ASC`,
        [userId, dayCount]
    );

    // Fill in missing dates with zeros
    const filled = [];
    const now = new Date();
    for (let i = dayCount - 1; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        const existing = stats.find(s => {
            const sDate = new Date(s.date).toISOString().split('T')[0];
            return sDate === dateStr;
        });
        filled.push({
            date: dateStr,
            total: existing ? existing.total : 0,
            success: existing ? existing.success : 0,
            failed: existing ? existing.failed : 0
        });
    }

    res.json({ success: true, data: filled });
});

/**
 * GET /analytics/platforms
 * Per-platform breakdown
 */
const getPlatformStats = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { days = 30 } = req.query;

    const stats = await query(
        `SELECT platform,
                COUNT(*) as total,
                SUM(CASE WHEN status = 'success' THEN 1 ELSE 0 END) as success,
                SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed
         FROM post_results 
         WHERE user_id = ? AND published_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
         GROUP BY platform
         ORDER BY total DESC`,
        [userId, parseInt(days)]
    );

    res.json({ success: true, data: stats });
});

/**
 * GET /analytics/recent
 * Recent post results
 */
const getRecentPosts = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { limit = 20 } = req.query;

    const posts = await query(
        `SELECT pr.*, sa.account_avatar 
         FROM post_results pr
         LEFT JOIN social_accounts sa ON pr.account_id = sa.id
         WHERE pr.user_id = ? 
         ORDER BY pr.published_at DESC 
         LIMIT ?`,
        [userId, parseInt(limit)]
    );

    res.json({ success: true, data: posts });
});

module.exports = {
    getOverview,
    getDailyStats,
    getPlatformStats,
    getRecentPosts
};
