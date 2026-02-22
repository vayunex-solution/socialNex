/**
 * Social Routes
 * API endpoints for social media account management
 */

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { upload } = require('../middleware/upload');
const {
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
    disconnectLinkedIn
} = require('../controllers/socialController');

// All routes require authentication
router.use(protect);

// Get all connected accounts
router.get('/accounts', getConnectedAccounts);

// Unified publish (with image support)
router.post('/publish', upload.array('images', 4), publishPost);

// Bluesky routes
router.post('/bluesky/connect', connectBluesky);
router.post('/bluesky/:accountId/post', createBlueskyPost);
router.get('/bluesky/:accountId/profile', getBlueskyProfile);
router.delete('/bluesky/:accountId', disconnectBluesky);
router.delete('/bluesky/:accountId/post', deleteBlueskyPost);

// Telegram routes
router.post('/telegram/connect', connectTelegram);
router.post('/telegram/:accountId/message', sendTelegramMessage);
router.get('/telegram/:accountId/info', getTelegramChatInfo);
router.delete('/telegram/:accountId', disconnectTelegram);

// Discord routes
router.post('/discord/connect', connectDiscord);
router.post('/discord/:accountId/message', sendDiscordMessage);
router.delete('/discord/:accountId', disconnectDiscord);

// LinkedIn routes
router.get('/linkedin/auth-url', getLinkedInAuthUrl);
router.post('/linkedin/connect', connectLinkedIn);
router.delete('/linkedin/:accountId', disconnectLinkedIn);

module.exports = router;
