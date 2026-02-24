/**
 * Analytics Routes
 * Dashboard stats, charts, and platform breakdowns
 */

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
    getOverview,
    getDailyStats,
    getPlatformStats,
    getRecentPosts
} = require('../controllers/analyticsController');

// All routes require authentication
router.use(protect);

router.get('/overview', getOverview);
router.get('/daily', getDailyStats);
router.get('/platforms', getPlatformStats);
router.get('/recent', getRecentPosts);

module.exports = router;
