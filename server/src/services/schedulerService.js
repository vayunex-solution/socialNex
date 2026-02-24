/**
 * Scheduler Service
 * Cron-based job runner that publishes scheduled posts at their due time.
 * Runs every 60 seconds, checks for posts with status='scheduled' and scheduled_at <= NOW().
 */

const cron = require('node-cron');
const { query } = require('../config/database');
const { logger } = require('../utils/logger');
const blueskyService = require('./blueskyService');
const telegramService = require('./telegramService');
const discordService = require('./discordService');
const linkedinService = require('./linkedinService');

let isProcessing = false;

/**
 * Start the scheduler cron job
 */
function startScheduler() {
    logger.info('📅 Post Scheduler started — checking every 60 seconds');

    // Run every minute
    cron.schedule('* * * * *', async () => {
        if (isProcessing) {
            return; // Skip if previous batch still processing
        }

        try {
            isProcessing = true;
            await processDuePosts();
        } catch (error) {
            logger.error('Scheduler error:', error.message);
        } finally {
            isProcessing = false;
        }
    });
}

/**
 * Find and publish all due posts
 */
async function processDuePosts() {
    const duePosts = await query(
        `SELECT * FROM scheduled_posts 
         WHERE status = 'scheduled' AND scheduled_at <= NOW()
         ORDER BY scheduled_at ASC
         LIMIT 10`
    );

    if (duePosts.length === 0) return;

    logger.info(`📤 Processing ${duePosts.length} scheduled post(s)...`);

    for (const post of duePosts) {
        await publishScheduledPost(post);
    }
}

/**
 * Publish a single scheduled post to all its target platforms
 */
async function publishScheduledPost(post) {
    const { id, user_id, content, account_ids, discord_bot_name } = post;

    // Mark as publishing
    await query(
        'UPDATE scheduled_posts SET status = ? WHERE id = ?',
        ['publishing', id]
    );

    try {
        let accountIds;
        try {
            accountIds = typeof account_ids === 'string' ? JSON.parse(account_ids) : account_ids;
        } catch {
            accountIds = [];
        }

        // Get target accounts
        const placeholders = accountIds.map(() => '?').join(',');
        const accounts = await query(
            `SELECT id, platform, account_name FROM social_accounts 
             WHERE id IN (${placeholders}) AND user_id = ? AND is_active = 1`,
            [...accountIds, user_id]
        );

        if (accounts.length === 0) {
            await query(
                'UPDATE scheduled_posts SET status = ?, error_message = ? WHERE id = ?',
                ['failed', 'No valid accounts found', id]
            );
            return;
        }

        // Parse stored images if any
        let images = [];
        if (post.images) {
            try {
                images = typeof post.images === 'string' ? JSON.parse(post.images) : post.images;
            } catch {
                images = [];
            }
        }

        const results = [];

        for (const account of accounts) {
            try {
                let postResult;

                if (account.platform === 'telegram') {
                    if (images.length > 0) {
                        const imgBuffer = Buffer.from(images[0].data, 'base64');
                        postResult = await telegramService.sendPhoto(
                            account.id, user_id, imgBuffer, content.trim()
                        );
                    } else {
                        postResult = await telegramService.sendMessage(
                            account.id, user_id, content.trim()
                        );
                    }
                } else if (account.platform === 'bluesky') {
                    const blueskyText = content.trim().length > 300
                        ? content.trim().substring(0, 297) + '...'
                        : content.trim();
                    
                    const blueskyImages = images.map(img => ({
                        data: Buffer.from(img.data, 'base64'),
                        mimeType: img.mimeType,
                        alt: ''
                    }));

                    postResult = await blueskyService.createPost(
                        account.id, user_id, blueskyText, blueskyImages
                    );
                } else if (account.platform === 'discord') {
                    const opts = { username: discord_bot_name || 'SocialNex' };
                    if (images.length > 0) {
                        const imgBuffer = Buffer.from(images[0].data, 'base64');
                        postResult = await discordService.sendImage(
                            account.id, user_id, imgBuffer, content.trim(), opts
                        );
                    } else {
                        postResult = await discordService.sendMessage(
                            account.id, user_id, content.trim(), opts
                        );
                    }
                } else if (account.platform === 'linkedin') {
                    const liImages = images.map(img => ({
                        data: Buffer.from(img.data, 'base64'),
                        mimeType: img.mimeType,
                        alt: ''
                    }));
                    postResult = await linkedinService.createPost(
                        account.id, user_id, content.trim(), liImages
                    );
                }

                results.push({
                    platform: account.platform,
                    name: account.account_name,
                    success: true,
                    data: postResult
                });

                // Log individual result
                await logPostResult(user_id, id, account, content, 'success', postResult);

            } catch (err) {
                logger.error(`Scheduled post ${id} → ${account.platform} failed:`, err.message);
                results.push({
                    platform: account.platform,
                    name: account.account_name,
                    success: false,
                    error: err.message
                });

                await logPostResult(user_id, id, account, content, 'failed', null, err.message);
            }
        }

        const anySuccess = results.some(r => r.success);
        const allSuccess = results.every(r => r.success);

        await query(
            `UPDATE scheduled_posts SET 
             status = ?, publish_results = ?, error_message = ?, updated_at = NOW()
             WHERE id = ?`,
            [
                allSuccess ? 'published' : anySuccess ? 'published' : 'failed',
                JSON.stringify(results),
                allSuccess ? null : results.filter(r => !r.success).map(r => `${r.platform}: ${r.error}`).join('; '),
                id
            ]
        );

        // Update analytics
        await updateDailyAnalytics(user_id, results);

        logger.info(`📤 Scheduled post ${id}: ${allSuccess ? 'all published' : anySuccess ? 'partial' : 'all failed'}`);

    } catch (error) {
        logger.error(`Scheduled post ${id} failed:`, error.message);
        await query(
            'UPDATE scheduled_posts SET status = ?, error_message = ? WHERE id = ?',
            ['failed', error.message, id]
        );
    }
}

/**
 * Log individual post result
 */
async function logPostResult(userId, scheduledPostId, account, content, status, result, errorMsg) {
    try {
        await query(
            `INSERT INTO post_results 
             (user_id, scheduled_post_id, platform, account_id, account_name, content, post_type, status, platform_post_id, error_message, published_at)
             VALUES (?, ?, ?, ?, ?, ?, 'scheduled', ?, ?, ?, NOW())`,
            [
                userId,
                scheduledPostId,
                account.platform,
                account.id,
                account.account_name,
                content,
                status,
                result?.uri || result?.messageId || null,
                errorMsg || null
            ]
        );
    } catch (e) {
        logger.warn('Failed to log post result:', e.message);
    }
}

/**
 * Update daily analytics aggregates
 */
async function updateDailyAnalytics(userId, results) {
    try {
        const today = new Date().toISOString().split('T')[0];
        const successCount = results.filter(r => r.success).length;
        const failCount = results.filter(r => !r.success).length;

        // Build platforms breakdown
        const platformCounts = {};
        results.forEach(r => {
            platformCounts[r.platform] = (platformCounts[r.platform] || 0) + 1;
        });

        await query(
            `INSERT INTO analytics_daily (user_id, date, total_posts, successful_posts, failed_posts, platforms_used)
             VALUES (?, ?, ?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE
                total_posts = total_posts + VALUES(total_posts),
                successful_posts = successful_posts + VALUES(successful_posts),
                failed_posts = failed_posts + VALUES(failed_posts),
                platforms_used = VALUES(platforms_used)`,
            [userId, today, results.length, successCount, failCount, JSON.stringify(platformCounts)]
        );
    } catch (e) {
        logger.warn('Failed to update analytics:', e.message);
    }
}

module.exports = { startScheduler, logPostResult, updateDailyAnalytics };
