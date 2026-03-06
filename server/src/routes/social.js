/**
 * Social Routes
 * API endpoints for social media account management
 */

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { upload } = require('../middleware/upload');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
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
    disconnectLinkedIn,
    getFacebookAuthUrl,
    connectFacebook,
    disconnectFacebook,
    disconnectInstagram,
    getYouTubeAuthUrl,
    connectYouTube,
    disconnectYouTube,
    uploadYouTubeVideo,
    getYouTubeChannelStats,
    getYouTubeVideoStatus
} = require('../controllers/socialController');

// ── Multer for YouTube video + thumbnail uploads ────────────
const videoStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = 'uploads/videos/';
        fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, `yt_${Date.now()}_${Math.random().toString(36).slice(2)}${ext}`);
    }
});
const videoUpload = multer({
    storage: videoStorage,
    limits: { fileSize: 4 * 1024 * 1024 * 1024 }, // 4 GB max
    fileFilter: (req, file, cb) => {
        if (file.fieldname === 'video') {
            const allowed = ['.mp4', '.mov', '.avi', '.wmv', '.flv', '.webm', '.mpeg'];
            if (allowed.includes(path.extname(file.originalname).toLowerCase()))
                return cb(null, true);
            return cb(new Error('Only video files are allowed (mp4, mov, webm, avi)'));
        }
        if (file.fieldname === 'thumbnail') {
            const allowed = ['.jpg', '.jpeg', '.png', '.webp'];
            if (allowed.includes(path.extname(file.originalname).toLowerCase()))
                return cb(null, true);
            return cb(new Error('Only image files allowed for thumbnail'));
        }
        cb(null, true);
    }
});

// All routes require authentication
router.use(protect);

// ── Core ────────────────────────────────────────────────────
router.get('/accounts', getConnectedAccounts);
router.post('/publish', upload.array('images', 10), publishPost);

// ── Bluesky ─────────────────────────────────────────────────
router.post('/bluesky/connect', connectBluesky);
router.post('/bluesky/:accountId/post', createBlueskyPost);
router.get('/bluesky/:accountId/profile', getBlueskyProfile);
router.delete('/bluesky/:accountId', disconnectBluesky);
router.delete('/bluesky/:accountId/post', deleteBlueskyPost);

// ── Telegram ─────────────────────────────────────────────────
router.post('/telegram/connect', connectTelegram);
router.post('/telegram/:accountId/message', sendTelegramMessage);
router.get('/telegram/:accountId/info', getTelegramChatInfo);
router.delete('/telegram/:accountId', disconnectTelegram);

// ── Discord ──────────────────────────────────────────────────
router.post('/discord/connect', connectDiscord);
router.post('/discord/:accountId/message', sendDiscordMessage);
router.delete('/discord/:accountId', disconnectDiscord);

// ── LinkedIn ─────────────────────────────────────────────────
router.get('/linkedin/auth-url', getLinkedInAuthUrl);
router.post('/linkedin/connect', connectLinkedIn);
router.delete('/linkedin/:accountId', disconnectLinkedIn);

// ── Facebook ─────────────────────────────────────────────────
router.get('/facebook/auth-url', getFacebookAuthUrl);
router.post('/facebook/connect', connectFacebook);
router.delete('/facebook/:accountId', disconnectFacebook);

// ── Instagram (connect via Facebook OAuth) ───────────────────
router.delete('/instagram/:accountId', disconnectInstagram);

// ── YouTube ──────────────────────────────────────────────────
router.get('/youtube/auth-url', getYouTubeAuthUrl);
router.post('/youtube/connect', connectYouTube);
router.delete('/youtube/:accountId', disconnectYouTube);
router.post(
    '/youtube/:accountId/upload',
    videoUpload.fields([{ name: 'video', maxCount: 1 }, { name: 'thumbnail', maxCount: 1 }]),
    uploadYouTubeVideo
);
router.get('/youtube/:accountId/stats', getYouTubeChannelStats);
router.get('/youtube/:accountId/video/:videoId/status', getYouTubeVideoStatus);

module.exports = router;
