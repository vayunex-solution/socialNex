/**
 * JWT Authentication Middleware
 */

const jwt = require('jsonwebtoken');
const { ApiError, asyncHandler } = require('./errorHandler');
const { query } = require('../config/database');

/**
 * Protect routes - Verify JWT token
 */
const protect = asyncHandler(async (req, res, next) => {
    let token;

    // Get token from header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        throw new ApiError(401, 'Not authorized. No token provided.');
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

        // Get user from database
        const users = await query(
            'SELECT id, email, full_name, avatar, role, is_verified FROM users WHERE id = ? AND is_active = 1',
            [decoded.userId]
        );

        if (!users.length) {
            throw new ApiError(401, 'User not found or deactivated.');
        }

        // Attach user to request
        req.user = {
            id: users[0].id,
            email: users[0].email,
            fullName: users[0].full_name,
            avatar: users[0].avatar,
            role: users[0].role,
            isVerified: users[0].is_verified
        };

        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            throw new ApiError(401, 'Invalid token.');
        }
        if (error.name === 'TokenExpiredError') {
            throw new ApiError(401, 'Token expired.');
        }
        throw error;
    }
});

/**
 * Optional auth - Attach user if token exists, but don't require it
 */
const optionalAuth = asyncHandler(async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];

        try {
            const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
            const users = await query(
                'SELECT id, email, full_name, avatar, role, is_verified FROM users WHERE id = ? AND is_active = 1',
                [decoded.userId]
            );

            if (users.length) {
                req.user = {
                    id: users[0].id,
                    email: users[0].email,
                    fullName: users[0].full_name,
                    avatar: users[0].avatar,
                    role: users[0].role,
                    isVerified: users[0].is_verified
                };
            }
        } catch (error) {
            // Ignore token errors for optional auth
        }
    }

    next();
});

/**
 * Require email verification
 */
const requireVerified = asyncHandler(async (req, res, next) => {
    if (!req.user.isVerified) {
        throw new ApiError(403, 'Please verify your email to access this resource.');
    }
    next();
});

/**
 * Role-based authorization
 */
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            throw new ApiError(403, 'You do not have permission to perform this action.');
        }
        next();
    };
};

module.exports = {
    protect,
    optionalAuth,
    requireVerified,
    authorize
};
