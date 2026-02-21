/**
 * Auth Routes
 */

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
    register,
    login,
    refreshToken,
    verifyEmail,
    resendVerification,
    logout,
    getMe,
    forgotPassword,
    resetPassword,
    updateProfile,
    changePassword
} = require('../controllers/authController');

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refreshToken);
router.post('/verify-email', verifyEmail);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Protected routes
router.post('/resend-verification', protect, resendVerification);
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);
router.put('/update-profile', protect, updateProfile);
router.post('/change-password', protect, changePassword);

module.exports = router;
