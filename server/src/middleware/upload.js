/**
 * File Upload Middleware
 * Handles image uploads using multer with memory storage
 */

const multer = require('multer');
const path = require('path');

// Use memory storage - files stored as Buffer (no disk writes)
const storage = multer.memoryStorage();

// File filter - allow images and videos
const fileFilter = (req, file, cb) => {
    const allowedTypes = [
        'image/jpeg', 'image/png', 'image/gif', 'image/webp',
        'video/mp4', 'video/quicktime', 'video/webm', 'video/mpeg'
    ];

    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Only JPEG, PNG, GIF, WebP images and MP4, MOV, WebM videos are allowed.'), false);
    }
};

// Configure multer
const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 50 * 1024 * 1024, // 50MB max per file (for videos)
        files: 10 // Max 10 files (Instagram carousel limit)
    }
});

module.exports = { upload };
