/**
 * Authentication Controller
 * Handles user registration, login, token refresh, and email verification
 */

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { query, callProcedure } = require('../config/database');
const { ApiError, asyncHandler } = require('../middleware/errorHandler');
const emailService = require('../services/emailService');
const { logger } = require('../utils/logger');

// Generate UUID using crypto
const generateUUID = () => crypto.randomUUID();

/**
 * Generate Access Token
 */
const generateAccessToken = (userId) => {
    return jwt.sign(
        { userId },
        process.env.JWT_ACCESS_SECRET,
        { expiresIn: process.env.JWT_ACCESS_EXPIRES || '15m' }
    );
};

/**
 * Generate Refresh Token
 */
const generateRefreshToken = (userId) => {
    return jwt.sign(
        { userId },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: process.env.JWT_REFRESH_EXPIRES || '7d' }
    );
};

/**
 * Generate 6-digit OTP
 */
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * @swagger
 * /auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Register a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - fullName
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 8
 *               fullName:
 *                 type: string
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Validation error
 *       409:
 *         description: Email already exists
 */
const register = asyncHandler(async (req, res) => {
    const { email, password, fullName } = req.body;

    // Validation
    if (!email || !password || !fullName) {
        throw new ApiError(400, 'Please provide email, password and full name.');
    }

    if (password.length < 8) {
        throw new ApiError(400, 'Password must be at least 8 characters.');
    }

    // Check if email exists
    const existingUsers = await query('SELECT id FROM users WHERE email = ?', [email]);
    if (existingUsers.length) {
        throw new ApiError(409, 'Email already registered.');
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const result = await query(
        `INSERT INTO users (email, password, full_name, is_verified, is_active, role, created_at) 
     VALUES (?, ?, ?, 0, 1, 'user', NOW())`,
        [email, hashedPassword, fullName]
    );

    const userId = result.insertId;

    // Generate verification token
    const verificationToken = generateUUID();
    const otpCode = generateOTP();

    // Save verification token (expires in 24 hours)
    await query(
        `INSERT INTO email_verification_tokens (user_id, token, otp_code, expires_at, created_at) 
     VALUES (?, ?, ?, DATE_ADD(NOW(), INTERVAL 24 HOUR), NOW())`,
        [userId, verificationToken, otpCode]
    );

    // Send verification email
    try {
        await emailService.sendVerificationEmail(
            { email, fullName },
            verificationToken,
            otpCode
        );
    } catch (emailError) {
        logger.error('Failed to send verification email:', emailError);
    }

    // Generate tokens
    const accessToken = generateAccessToken(userId);
    const refreshToken = generateRefreshToken(userId);

    // Save refresh token
    await query(
        `INSERT INTO refresh_tokens (user_id, token, expires_at, created_at) 
     VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 7 DAY), NOW())`,
        [userId, refreshToken]
    );

    res.status(201).json({
        success: true,
        message: 'Registration successful! Please check your email to verify your account.',
        data: {
            user: {
                id: userId,
                email,
                fullName,
                isVerified: false,
                role: 'user'
            },
            accessToken,
            refreshToken
        }
    });
});

/**
 * @swagger
 * /auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Login user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       401:
 *         description: Invalid credentials
 */
const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
        throw new ApiError(400, 'Please provide email and password.');
    }

    // Find user
    const users = await query(
        `SELECT id, email, password, full_name, avatar, is_verified, is_active, role 
     FROM users WHERE email = ?`,
        [email]
    );

    if (!users.length) {
        throw new ApiError(401, 'Invalid email or password.');
    }

    const user = users[0];

    // Check if user is active
    if (!user.is_active) {
        throw new ApiError(401, 'Account is deactivated. Please contact support.');
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        throw new ApiError(401, 'Invalid email or password.');
    }

    // Generate tokens
    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    // Save refresh token
    await query(
        `INSERT INTO refresh_tokens (user_id, token, expires_at, created_at) 
     VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 7 DAY), NOW())`,
        [user.id, refreshToken]
    );

    // Update last login
    await query('UPDATE users SET last_login = NOW() WHERE id = ?', [user.id]);

    res.json({
        success: true,
        message: 'Login successful!',
        data: {
            user: {
                id: user.id,
                email: user.email,
                fullName: user.full_name,
                avatar: user.avatar,
                isVerified: !!user.is_verified,
                role: user.role
            },
            accessToken,
            refreshToken
        }
    });
});

/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     tags: [Auth]
 *     summary: Refresh access token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Token refreshed
 *       401:
 *         description: Invalid refresh token
 */
const refreshToken = asyncHandler(async (req, res) => {
    const { refreshToken: token } = req.body;

    if (!token) {
        throw new ApiError(400, 'Refresh token is required.');
    }

    try {
        // Verify refresh token
        const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);

        // Check if refresh token exists in database
        const tokens = await query(
            `SELECT * FROM refresh_tokens 
       WHERE user_id = ? AND token = ? AND expires_at > NOW() AND is_revoked = 0`,
            [decoded.userId, token]
        );

        if (!tokens.length) {
            throw new ApiError(401, 'Invalid or expired refresh token.');
        }

        // Generate new access token
        const accessToken = generateAccessToken(decoded.userId);

        res.json({
            success: true,
            message: 'Token refreshed.',
            data: { accessToken }
        });
    } catch (error) {
        throw new ApiError(401, 'Invalid refresh token.');
    }
});

/**
 * @swagger
 * /auth/verify-email:
 *   post:
 *     tags: [Auth]
 *     summary: Verify email with OTP or token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *                 description: Verification token from email link
 *               otp:
 *                 type: string
 *                 description: 6-digit OTP code
 *     responses:
 *       200:
 *         description: Email verified successfully
 *       400:
 *         description: Invalid or expired token
 */
const verifyEmail = asyncHandler(async (req, res) => {
    const { token, otp } = req.body;

    if (!token && !otp) {
        throw new ApiError(400, 'Please provide verification token or OTP.');
    }

    const verifyValue = token || otp;

    // Find valid token
    const tokens = await query(
        `SELECT user_id FROM email_verification_tokens 
     WHERE (token = ? OR otp_code = ?) AND expires_at > NOW() AND is_used = 0`,
        [verifyValue, verifyValue]
    );

    if (!tokens.length) {
        throw new ApiError(400, 'Invalid or expired verification token.');
    }

    const userId = tokens[0].user_id;

    // Mark token as used
    await query(
        `UPDATE email_verification_tokens SET is_used = 1 WHERE user_id = ?`,
        [userId]
    );

    // Mark user as verified
    await query(
        `UPDATE users SET is_verified = 1, verified_at = NOW() WHERE id = ?`,
        [userId]
    );

    // Get user details for welcome email
    const users = await query('SELECT email, full_name FROM users WHERE id = ?', [userId]);

    // Send welcome email
    try {
        await emailService.sendWelcomeEmail({
            email: users[0].email,
            fullName: users[0].full_name
        });
    } catch (emailError) {
        logger.error('Failed to send welcome email:', emailError);
    }

    res.json({
        success: true,
        message: 'Email verified successfully! Welcome to SocialNex!'
    });
});

/**
 * @swagger
 * /auth/resend-verification:
 *   post:
 *     tags: [Auth]
 *     summary: Resend verification email
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Verification email sent
 *       429:
 *         description: Too many requests
 */
const resendVerification = asyncHandler(async (req, res) => {
    const userId = req.user.id;

    // Check if already verified
    if (req.user.isVerified) {
        throw new ApiError(400, 'Email is already verified.');
    }

    // Rate limit - check last email sent
    const recentTokens = await query(
        `SELECT created_at FROM email_verification_tokens 
     WHERE user_id = ? AND created_at > DATE_SUB(NOW(), INTERVAL 2 MINUTE)
     ORDER BY created_at DESC LIMIT 1`,
        [userId]
    );

    if (recentTokens.length) {
        throw new ApiError(429, 'Please wait 2 minutes before requesting another verification email.');
    }

    // Invalidate old tokens
    await query(
        `UPDATE email_verification_tokens SET is_used = 1 WHERE user_id = ?`,
        [userId]
    );

    // Generate new tokens
    const verificationToken = uuidv4();
    const otpCode = generateOTP();

    // Save new token
    await query(
        `INSERT INTO email_verification_tokens (user_id, token, otp_code, expires_at, created_at) 
     VALUES (?, ?, ?, DATE_ADD(NOW(), INTERVAL 24 HOUR), NOW())`,
        [userId, verificationToken, otpCode]
    );

    // Get user email
    const users = await query('SELECT email, full_name FROM users WHERE id = ?', [userId]);

    // Send email
    await emailService.sendVerificationEmail(
        { email: users[0].email, fullName: users[0].full_name },
        verificationToken,
        otpCode
    );

    res.json({
        success: true,
        message: 'Verification email sent! Please check your inbox.'
    });
});

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     tags: [Auth]
 *     summary: Logout user
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Logged out successfully
 */
const logout = asyncHandler(async (req, res) => {
    const { refreshToken } = req.body;

    if (refreshToken) {
        // Revoke the refresh token
        await query(
            `UPDATE refresh_tokens SET is_revoked = 1 WHERE token = ?`,
            [refreshToken]
        );
    }

    res.json({
        success: true,
        message: 'Logged out successfully.'
    });
});

/**
 * @swagger
 * /auth/me:
 *   get:
 *     tags: [Auth]
 *     summary: Get current user profile
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/User'
 */
const getMe = asyncHandler(async (req, res) => {
    res.json({
        success: true,
        data: req.user
    });
});

/**
 * @swagger
 * /auth/forgot-password:
 *   post:
 *     tags: [Auth]
 *     summary: Request password reset email
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Password reset email sent
 *       404:
 *         description: Email not found
 */
const forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;

    if (!email) {
        throw new ApiError(400, 'Please provide your email address.');
    }

    // Find user by email
    const users = await query('SELECT id, email, full_name FROM users WHERE email = ?', [email]);

    if (!users.length) {
        // Don't reveal if email exists or not (security best practice)
        return res.json({
            success: true,
            message: 'If an account exists with this email, you will receive a password reset link.'
        });
    }

    const user = users[0];

    // Rate limit - check last reset email sent
    const recentTokens = await query(
        `SELECT created_at FROM password_reset_tokens 
         WHERE user_id = ? AND created_at > DATE_SUB(NOW(), INTERVAL 5 MINUTE)
         ORDER BY created_at DESC LIMIT 1`,
        [user.id]
    );

    if (recentTokens.length) {
        throw new ApiError(429, 'Please wait 5 minutes before requesting another password reset.');
    }

    // Invalidate old tokens
    await query(
        `UPDATE password_reset_tokens SET is_used = 1 WHERE user_id = ? AND is_used = 0`,
        [user.id]
    );

    // Generate reset token
    const resetToken = generateUUID();

    // Save reset token (expires in 1 hour)
    await query(
        `INSERT INTO password_reset_tokens (user_id, token, expires_at, created_at) 
         VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 1 HOUR), NOW())`,
        [user.id, resetToken]
    );

    // Send password reset email
    try {
        await emailService.sendPasswordResetEmail(
            { email: user.email, fullName: user.full_name },
            resetToken
        );
    } catch (emailError) {
        logger.error('Failed to send password reset email:', emailError);
        throw new ApiError(500, 'Failed to send reset email. Please try again later.');
    }

    res.json({
        success: true,
        message: 'If an account exists with this email, you will receive a password reset link.'
    });
});

/**
 * @swagger
 * /auth/reset-password:
 *   post:
 *     tags: [Auth]
 *     summary: Reset password using token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - password
 *             properties:
 *               token:
 *                 type: string
 *               password:
 *                 type: string
 *                 minLength: 8
 *     responses:
 *       200:
 *         description: Password reset successful
 *       400:
 *         description: Invalid or expired token
 */
const resetPassword = asyncHandler(async (req, res) => {
    const { token, password } = req.body;

    if (!token || !password) {
        throw new ApiError(400, 'Please provide token and new password.');
    }

    if (password.length < 8) {
        throw new ApiError(400, 'Password must be at least 8 characters.');
    }

    // Find valid token
    const tokens = await query(
        `SELECT user_id FROM password_reset_tokens 
         WHERE token = ? AND expires_at > NOW() AND is_used = 0`,
        [token]
    );

    if (!tokens.length) {
        throw new ApiError(400, 'Invalid or expired reset token. Please request a new one.');
    }

    const userId = tokens[0].user_id;

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Update password
    await query('UPDATE users SET password = ?, updated_at = NOW() WHERE id = ?', [hashedPassword, userId]);

    // Mark token as used
    await query('UPDATE password_reset_tokens SET is_used = 1 WHERE token = ?', [token]);

    // Revoke all refresh tokens (force re-login)
    await query('UPDATE refresh_tokens SET is_revoked = 1 WHERE user_id = ?', [userId]);

    res.json({
        success: true,
        message: 'Password reset successful! Please login with your new password.'
    });
});

/**
 * @swagger
 * /auth/update-profile:
 *   put:
 *     tags: [Auth]
 *     summary: Update user profile
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fullName:
 *                 type: string
 *               bio:
 *                 type: string
 *               avatar:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile updated
 */
const updateProfile = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { fullName, bio, avatar } = req.body;

    // Build update query dynamically
    const updates = [];
    const values = [];

    if (fullName !== undefined) {
        updates.push('full_name = ?');
        values.push(fullName);
    }
    if (bio !== undefined) {
        updates.push('bio = ?');
        values.push(bio);
    }
    if (avatar !== undefined) {
        updates.push('avatar = ?');
        values.push(avatar);
    }

    if (updates.length === 0) {
        throw new ApiError(400, 'Please provide at least one field to update.');
    }

    updates.push('updated_at = NOW()');
    values.push(userId);

    // Update user
    await query(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`, values);

    // Get updated user
    const users = await query(
        `SELECT id, email, full_name, avatar, bio, is_verified, role, created_at 
         FROM users WHERE id = ?`,
        [userId]
    );

    res.json({
        success: true,
        message: 'Profile updated successfully!',
        data: {
            id: users[0].id,
            email: users[0].email,
            fullName: users[0].full_name,
            avatar: users[0].avatar,
            bio: users[0].bio,
            isVerified: !!users[0].is_verified,
            role: users[0].role
        }
    });
});

/**
 * @swagger
 * /auth/change-password:
 *   post:
 *     tags: [Auth]
 *     summary: Change password (for logged in users)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *                 minLength: 8
 *     responses:
 *       200:
 *         description: Password changed
 *       401:
 *         description: Current password incorrect
 */
const changePassword = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
        throw new ApiError(400, 'Please provide current and new password.');
    }

    if (newPassword.length < 8) {
        throw new ApiError(400, 'New password must be at least 8 characters.');
    }

    // Get current password hash
    const users = await query('SELECT password FROM users WHERE id = ?', [userId]);

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, users[0].password);
    if (!isMatch) {
        throw new ApiError(401, 'Current password is incorrect.');
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password
    await query('UPDATE users SET password = ?, updated_at = NOW() WHERE id = ?', [hashedPassword, userId]);

    res.json({
        success: true,
        message: 'Password changed successfully!'
    });
});

module.exports = {
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
};
