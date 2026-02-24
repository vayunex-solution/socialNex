const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const {
    getNotificationSettings,
    updateNotificationSettings,
    getActivityLogs
} = require('../controllers/settingsController');

// Notification preference routes
router.get('/notifications', authenticate, getNotificationSettings);
router.put('/notifications', authenticate, updateNotificationSettings);

// Activity logs
router.get('/activity', authenticate, getActivityLogs);

module.exports = router;
