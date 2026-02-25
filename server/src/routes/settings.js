const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
    getNotificationSettings,
    updateNotificationSettings,
    getActivityLogs
} = require('../controllers/settingsController');

// Notification preference routes
router.get('/notifications', protect, getNotificationSettings);
router.put('/notifications', protect, updateNotificationSettings);

// Activity logs
router.get('/activity', protect, getActivityLogs);

module.exports = router;
