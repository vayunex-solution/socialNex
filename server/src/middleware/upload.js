/**
 * File Upload Middleware
 * Handles image + video uploads using multer with DISK storage
 * Files saved to tmp/uploads/ and auto-cleaned by mediaCleanup job (24hr)
 */

const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

// Upload directory — same as mediaService uses
const UPLOAD_DIR = path.join(__dirname, '../../tmp/uploads');

// Ensure directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Disk storage — files go to tmp/uploads/ with unique names
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, UPLOAD_DIR);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname) || '.bin';
        const uniqueName = `${Date.now()}_${crypto.randomBytes(8).toString('hex')}${ext}`;
        cb(null, uniqueName);
    }
});

// File filter — allow images and videos
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
