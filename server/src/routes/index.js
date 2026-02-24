/**
 * Main Routes Index
 * Combines all route modules
 */

const express = require('express');
const router = express.Router();

// Import route modules
const authRoutes = require('./auth');
const socialRoutes = require('./social');
const postsRoutes = require('./posts');
const analyticsRoutes = require('./analytics');
const settingsRoutes = require('./settings');

// Mount routes
router.use('/auth', authRoutes);
router.use('/social', socialRoutes);
router.use('/posts', postsRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/settings', settingsRoutes);

// API info endpoint
router.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Welcome to SocialNex API',
        version: 'v1',
        endpoints: {
            auth: '/api/v1/auth',
            social: '/api/v1/social',
            posts: '/api/v1/posts',
            analytics: '/api/v1/analytics',
            settings: '/api/v1/settings'
        },
        documentation: '/api-docs'
    });
});

module.exports = router;
