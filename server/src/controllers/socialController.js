/**
 * Social Accounts Controller
 * Handles connecting, managing, and posting to social platforms
 */

const { ApiError, asyncHandler } = require('../middleware/errorHandler');
const blueskyService = require('../services/blueskyService');
const linkedinService = require('../services/linkedinService');
const telegramService = require('../services/telegramService');
// dialogflowService removed - not yet implemented
const facebookService = require('../services/facebookService');
const { query } = require('../config/database');
const { logger } = require('../utils/logger');
const crypto = require('crypto');

/**
 * @swagger
 * /social/accounts:
 *   get:
 *     tags: [Social]
 *     summary: Get all connected social accounts
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of connected accounts
 */
const getConnectedAccounts = asyncHandler(async (req, res) => {
    const userId = req.user.id;

    const accounts = await query(
        `SELECT id, platform, account_name, account_username, account_avatar, 
                is_active, connected_at 
         FROM social_accounts 
         WHERE user_id = ? AND is_active = 1
         ORDER BY connected_at DESC`,
        [userId]
    );

    res.json({
        success: true,
        data: accounts.map(acc => ({
            id: acc.id,
            platform: acc.platform,
            name: acc.account_name,
            username: acc.account_username,
            avatar: acc.account_avatar,
            connectedAt: acc.connected_at
        }))
    });
});

/**
 * @swagger
 * /social/bluesky/connect:
 *   post:
 *     tags: [Social]
 *     summary: Connect a Bluesky account
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - handle
 *               - appPassword
 *             properties:
 *               handle:
 *                 type: string
 *                 description: Bluesky handle (e.g., user.bsky.social)
 *               appPassword:
 *                 type: string
 *                 description: App password from Bluesky settings
 *     responses:
 *       200:
 *         description: Account connected successfully
 *       400:
 *         description: Invalid credentials
 */
const connectBluesky = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { handle, appPassword } = req.body;

    if (!handle || !appPassword) {
        throw new ApiError(400, 'Please provide handle and app password.');
    }

    // Validate handle format
    const cleanHandle = handle.startsWith('@') ? handle.slice(1) : handle;

    if (!cleanHandle.includes('.')) {
        throw new ApiError(400, 'Invalid handle format. Use format: user.bsky.social');
    }

    const result = await blueskyService.connect(cleanHandle, appPassword, userId);

    res.json({
        success: true,
        message: result.reconnected
            ? 'Bluesky account reconnected successfully!'
            : 'Bluesky account connected successfully!',
        data: result
    });
});

/**
 * @swagger
 * /social/bluesky/{accountId}/post:
 *   post:
 *     tags: [Social]
 *     summary: Create a post on Bluesky
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: accountId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - text
 *             properties:
 *               text:
 *                 type: string
 *                 maxLength: 300
 *     responses:
 *       200:
 *         description: Post created successfully
 */
const createBlueskyPost = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { accountId } = req.params;
    const { text, images } = req.body;

    if (!text || text.trim().length === 0) {
        throw new ApiError(400, 'Post text is required.');
    }

    if (text.length > 300) {
        throw new ApiError(400, 'Post text cannot exceed 300 characters.');
    }

    const result = await blueskyService.createPost(
        parseInt(accountId),
        userId,
        text.trim(),
        images || []
    );

    res.json({
        success: true,
        message: 'Post published to Bluesky!',
        data: result
    });
});

/**
 * @swagger
 * /social/bluesky/{accountId}/profile:
 *   get:
 *     tags: [Social]
 *     summary: Get Bluesky profile info
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: accountId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Profile information
 */
const getBlueskyProfile = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { accountId } = req.params;

    const profile = await blueskyService.getProfile(parseInt(accountId), userId);

    res.json({
        success: true,
        data: profile
    });
});

/**
 * @swagger
 * /social/bluesky/{accountId}:
 *   delete:
 *     tags: [Social]
 *     summary: Disconnect a Bluesky account
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: accountId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Account disconnected
 */
const disconnectBluesky = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { accountId } = req.params;

    await blueskyService.disconnect(parseInt(accountId), userId);

    res.json({
        success: true,
        message: 'Bluesky account disconnected.'
    });
});

/**
 * @swagger
 * /social/bluesky/{accountId}/post:
 *   delete:
 *     tags: [Social]
 *     summary: Delete a post from Bluesky
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: accountId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - postUri
 *             properties:
 *               postUri:
 *                 type: string
 *     responses:
 *       200:
 *         description: Post deleted
 */
const deleteBlueskyPost = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { accountId } = req.params;
    const { postUri } = req.body;

    if (!postUri) {
        throw new ApiError(400, 'Post URI is required.');
    }

    await blueskyService.deletePost(parseInt(accountId), userId, postUri);

    res.json({
        success: true,
        message: 'Post deleted from Bluesky.'
    });
});

// =============================================
// TELEGRAM ENDPOINTS
// =============================================

/**
 * @swagger
 * /social/telegram/connect:
 *   post:
 *     tags: [Social]
 *     summary: Connect a Telegram channel/group via bot
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - botToken
 *               - chatId
 *             properties:
 *               botToken:
 *                 type: string
 *                 description: Bot token from @BotFather
 *               chatId:
 *                 type: string
 *                 description: Channel/group chat ID or @username
 *     responses:
 *       200:
 *         description: Telegram connected successfully
 */
const connectTelegram = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { botToken, chatId } = req.body;

    if (!botToken) {
        throw new ApiError(400, 'Please provide your Telegram bot token.');
    }

    const result = await telegramService.connect(botToken, chatId, userId);

    res.json({
        success: true,
        message: result.reconnected
            ? 'Telegram reconnected successfully!'
            : 'Telegram connected successfully!',
        data: result
    });
});

/**
 * @swagger
 * /social/telegram/{accountId}/message:
 *   post:
 *     tags: [Social]
 *     summary: Send a message to Telegram channel/group
 *     security:
 *       - bearerAuth: []
 */
const sendTelegramMessage = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { accountId } = req.params;
    const { text, parseMode, disablePreview } = req.body;

    if (!text || text.trim().length === 0) {
        throw new ApiError(400, 'Message text is required.');
    }

    const result = await telegramService.sendMessage(
        parseInt(accountId),
        userId,
        text.trim(),
        { parseMode, disablePreview }
    );

    res.json({
        success: true,
        message: 'Message sent to Telegram!',
        data: result
    });
});

/**
 * @swagger
 * /social/telegram/{accountId}/info:
 *   get:
 *     tags: [Social]
 *     summary: Get Telegram chat/channel info
 *     security:
 *       - bearerAuth: []
 */
const getTelegramChatInfo = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { accountId } = req.params;

    const info = await telegramService.getChatInfo(parseInt(accountId), userId);

    res.json({
        success: true,
        data: info
    });
});

/**
 * @swagger
 * /social/telegram/{accountId}:
 *   delete:
 *     tags: [Social]
 *     summary: Disconnect Telegram account
 *     security:
 *       - bearerAuth: []
 */
const disconnectTelegram = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { accountId } = req.params;

    await telegramService.disconnect(parseInt(accountId), userId);

    res.json({
        success: true,
        message: 'Telegram disconnected.'
    });
});

// =============================================
// UNIFIED MULTI-PLATFORM POST
// =============================================

/**
 * Publish a post to multiple platforms at once (with optional images)
 * POST /social/publish
 * Body (multipart/form-data):
 *   - text: string
 *   - accountIds: JSON array of account IDs e.g. "[2,3]"
 *   - images: up to 4 image files
 */
const publishPost = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { text, discordBotName } = req.body;

    let accountIds;
    try {
        accountIds = JSON.parse(req.body.accountIds || '[]');
    } catch {
        throw new ApiError(400, 'Invalid accountIds format.');
    }

    if (!text || text.trim().length === 0) {
        throw new ApiError(400, 'Post text is required.');
    }
    if (!accountIds || accountIds.length === 0) {
        throw new ApiError(400, 'Select at least one platform.');
    }

    // Get uploaded images
    const images = (req.files || []).map(file => ({
        data: file.buffer,
        mimeType: file.mimetype,
        alt: '',
        size: file.size
    }));

    logger.info(`Publish: ${images.length} images received, ${accountIds.length} accounts selected, text length: ${text.length}`);

    // Fetch selected accounts
    const placeholders = accountIds.map(() => '?').join(',');
    const accounts = await query(
        `SELECT id, platform, account_name FROM social_accounts 
         WHERE id IN (${placeholders}) AND user_id = ? AND is_active = 1`,
        [...accountIds, userId]
    );

    if (accounts.length === 0) {
        throw new ApiError(404, 'No valid accounts found.');
    }

    const results = [];

    for (const account of accounts) {
        try {
            let postResult;

            if (account.platform === 'telegram') {
                if (images.length > 0) {
                    // Send first image with caption
                    postResult = await telegramService.sendPhoto(
                        account.id, userId, images[0].data, text.trim()
                    );
                } else {
                    postResult = await telegramService.sendMessage(
                        account.id, userId, text.trim()
                    );
                }
            } else if (account.platform === 'bluesky') {
                // Bluesky handles images via uploadBlob internally
                const blueskyText = text.trim().length > 300
                    ? text.trim().substring(0, 297) + '...'
                    : text.trim();
                postResult = await blueskyService.createPost(
                    account.id, userId, blueskyText, images
                );
            } else if (account.platform === 'discord') {
                const discordOpts = { username: discordBotName || 'SocialNex' };
                if (images.length > 0) {
                    postResult = await discordService.sendImage(
                        account.id, userId, images[0].data, text.trim(), discordOpts
                    );
                } else {
                    postResult = await discordService.sendMessage(
                        account.id, userId, text.trim(), discordOpts
                    );
                }
            } else if (account.platform === 'linkedin') {
                try {
                    const result = await linkedinService.createPost(account.id, userId, text.trim(), images);
                    results.push({ platform: 'linkedin', name: account.account_name, success: true, data: result });
                } catch (err) {
                    results.push({ platform: 'linkedin', name: account.account_name, success: false, error: err.message });
                }
            } else if (account.platform === 'facebook') {
                try {
                    const result = await facebookService.createPost(account.id, userId, text.trim(), images);
                    results.push({ platform: 'facebook', name: account.account_name, success: true, data: result });
                } catch (err) {
                    results.push({ platform: 'facebook', name: account.account_name, success: false, error: err.message });
                }
            } else {
                logger.warn(`Unsupported platform for post: ${account.platform}`);
                results.push({
                    platform: account.platform,
                    name: account.account_name,
                    success: false,
                    error: 'Unsupported platform for posting.'
                });
            }

            // For platforms that use the outer postResult variable
            if (postResult) {
                results.push({
                    platform: account.platform,
                    name: account.account_name,
                    success: true,
                    data: postResult
                });
            }

        } catch (err) {
            logger.error(`Post to ${account.platform} failed:`, err.message);
            results.push({
                platform: account.platform,
                name: account.account_name,
                success: false,
                error: err.message
            });
        }
    }

    // Log results to post_results table (for analytics)
    const { logPostResult, updateDailyAnalytics } = require('../services/schedulerService');
    for (const r of results) {
        const matchedAccount = accounts.find(a => a.platform === r.platform);
        if (matchedAccount) {
            try {
                await query(
                    `INSERT INTO post_results 
                     (user_id, platform, account_id, account_name, content, post_type, status, platform_post_id, error_message, published_at)
                     VALUES (?, ?, ?, ?, ?, 'instant', ?, ?, ?, NOW())`,
                    [
                        userId,
                        r.platform,
                        matchedAccount.id,
                        r.name,
                        text.trim(),
                        r.success ? 'success' : 'failed',
                        r.data?.uri || r.data?.messageId || null,
                        r.error || null
                    ]
                );
            } catch (logErr) {
                logger.warn('Post result logging skipped:', logErr.message);
            }
        }
    }

    // Update daily analytics
    try {
        await updateDailyAnalytics(userId, results);
    } catch (analyticsErr) {
        logger.warn('Analytics update skipped:', analyticsErr.message);
    }

    // Legacy posts table logging
    try {
        await query(
            `INSERT INTO posts (user_id, content, metadata, status, created_at) 
             VALUES (?, ?, ?, 'published', NOW())`,
            [userId, text.trim(), JSON.stringify({ platforms: results.map(r => r.platform) })]
        );
    } catch (logErr) {
        logger.warn('Post logging skipped:', logErr.message);
    }

    const allSuccess = results.every(r => r.success);
    const anySuccess = results.some(r => r.success);

    res.json({
        success: anySuccess,
        message: allSuccess
            ? 'Published to all platforms!'
            : anySuccess
                ? 'Published to some platforms (check details).'
                : 'Failed to publish to any platform.',
        data: { results, imageCount: images.length }
    });
});

// =============================================
// DISCORD ENDPOINTS
// =============================================

const connectDiscord = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { webhookUrl, channelName } = req.body;

    if (!webhookUrl) {
        throw new ApiError(400, 'Please provide a Discord webhook URL.');
    }

    const result = await discordService.connect(webhookUrl, channelName, userId);

    res.json({
        success: true,
        message: result.reconnected
            ? 'Discord reconnected successfully!'
            : 'Discord connected successfully!',
        data: result
    });
});

const sendDiscordMessage = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { accountId } = req.params;
    const { content } = req.body;

    if (!content || content.trim().length === 0) {
        throw new ApiError(400, 'Message content is required.');
    }

    const result = await discordService.sendMessage(
        parseInt(accountId), userId, content.trim()
    );

    res.json({
        success: true,
        message: 'Message sent to Discord!',
        data: result
    });
});

const disconnectDiscord = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { accountId } = req.params;

    await discordService.disconnect(parseInt(accountId), userId);

    res.json({
        success: true,
        message: 'Discord disconnected.'
    });
});

// =============================================
// LINKEDIN ENDPOINTS
// =============================================

/**
 * @swagger
 * /social/linkedin/auth-url:
 *   get:
 *     tags: [Social]
 *     summary: Get LinkedIn OAuth authorization URL
 *     security:
 *       - bearerAuth: []
 */
const getLinkedInAuthUrl = asyncHandler(async (req, res) => {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const redirectUri = `${frontendUrl}/dashboard`;
    const state = 'linkedin_' + crypto.randomBytes(16).toString('hex');

    const authUrl = linkedinService.getAuthUrl(redirectUri, state);

    res.json({
        success: true,
        data: { authUrl, state }
    });
});

/**
 * @swagger
 * /social/linkedin/connect:
 *   post:
 *     tags: [Social]
 *     summary: Connect LinkedIn account using OAuth code
 *     security:
 *       - bearerAuth: []
 */
const connectLinkedIn = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { code, redirectUri } = req.body;

    if (!code) {
        throw new ApiError(400, 'Authorization code is required.');
    }

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    // Ensure no trailing slash on frontendUrl
    const cleanFrontendUrl = frontendUrl.replace(/\/+$/, '');
    const finalRedirectUri = redirectUri || `${cleanFrontendUrl}/dashboard`;

    logger.info(`LinkedIn Connect attempt: POST code=${code}, redirectUri=${finalRedirectUri}, envFrontend=${frontendUrl}`);

    const result = await linkedinService.connect(code, finalRedirectUri, userId);

    res.json({
        success: true,
        message: result.reconnected
            ? 'LinkedIn reconnected successfully!'
            : 'LinkedIn connected successfully!',
        data: result
    });
});

const disconnectLinkedIn = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { accountId } = req.params;

    await linkedinService.disconnect(parseInt(accountId), userId);

    res.json({
        success: true,
        message: 'LinkedIn disconnected.'
    });
});

// =============================================
// FACEBOOK ENDPOINTS
// =============================================

const getFacebookAuthUrl = asyncHandler(async (req, res) => {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    // Match the redirect URI configured in Facebook App Settings exactly
    const redirectUri = `${frontendUrl}/dashboard`;
    const state = 'facebook_' + crypto.randomBytes(16).toString('hex');

    const authUrl = facebookService.getAuthUrl(redirectUri, state);

    res.json({
        success: true,
        data: { authUrl, state }
    });
});

const connectFacebook = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { code, redirectUri } = req.body;

    if (!code) {
        throw new ApiError(400, 'Authorization code is required.');
    }

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const cleanFrontendUrl = frontendUrl.replace(/\/+$/, '');
    const finalRedirectUri = redirectUri || `${cleanFrontendUrl}/dashboard`;

    logger.info(`Facebook Connect attempt: POST code=${code}, redirectUri=${finalRedirectUri}`);

    const result = await facebookService.connect(code, finalRedirectUri, userId);

    res.json({
        success: true,
        message: result.reconnected
            ? 'Facebook Page reconnected successfully!'
            : 'Facebook Page connected successfully!',
        data: result
    });
});

const disconnectFacebook = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { accountId } = req.params;

    await facebookService.disconnect(parseInt(accountId), userId);

    res.json({
        success: true,
        message: 'Facebook Page disconnected.'
    });
});

module.exports = {
    getConnectedAccounts,
    connectBluesky,
    createBlueskyPost,
    getBlueskyProfile,
    disconnectBluesky,
    deleteBlueskyPost,
    connectTelegram,
    sendTelegramMessage,
    getTelegramChatInfo,
    disconnectTelegram,
    publishPost,
    connectDiscord,
    sendDiscordMessage,
    disconnectDiscord,
    getLinkedInAuthUrl,
    connectLinkedIn,
    disconnectLinkedIn,
    getFacebookAuthUrl,
    connectFacebook,
    disconnectFacebook
};
