/**
 * Posts Routes
 * Scheduling, calendar, and history endpoints
 */

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { upload } = require('../middleware/upload');
const {
    getScheduledPosts,
    createScheduledPost,
    updateScheduledPost,
    cancelScheduledPost,
    getCalendarData,
    getPostHistory
} = require('../controllers/schedulerController');

// All routes require authentication
router.use(protect);

// Scheduled posts CRUD
router.get('/scheduled', getScheduledPosts);
router.post('/scheduled', upload.array('images', 4), createScheduledPost);
router.put('/scheduled/:id', updateScheduledPost);
router.delete('/scheduled/:id', cancelScheduledPost);

// Calendar view
router.get('/calendar', getCalendarData);

// Post history
router.get('/history', getPostHistory);

module.exports = router;
