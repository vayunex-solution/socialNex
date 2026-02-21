/**
 * Main Routes Index
 * Combines all route modules
 */

const express = require('express');
const router = express.Router();

// Import route modules
const authRoutes = require('./auth');
const socialRoutes = require('./social');

// Mount routes
router.use('/auth', authRoutes);
router.use('/social', socialRoutes);

// API info endpoint
router.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Welcome to SocialNex API',
        version: 'v1',
        endpoints: {
            auth: '/api/v1/auth',
            social: '/api/v1/social',
            posts: '/api/v1/posts (coming soon)',
            campaigns: '/api/v1/campaigns (coming soon)',
            analytics: '/api/v1/analytics (coming soon)'
        },
        documentation: '/api-docs'
    });
});

module.exports = router;
