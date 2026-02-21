/**
 * File Upload Middleware
 * Handles image uploads using multer with memory storage
 */

const multer = require('multer');
const path = require('path');

// Use memory storage - files stored as Buffer (no disk writes)
const storage = multer.memoryStorage();

// File filter - only allow images
const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Only JPEG, PNG, GIF, and WebP images are allowed.'), false);
    }
};

// Configure multer
const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB max per file
        files: 4 // Max 4 images (Bluesky limit)
    }
});

module.exports = { upload };
