/**
 * Media Service
 * Handles temporary media file storage for platforms that require 
 * publicly accessible URLs (like Instagram)
 * 
 * Flow: Upload buffer → Save to /tmp/uploads/ → Serve via Express static → Delete after publish
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { logger } = require('../utils/logger');

const UPLOAD_DIR = path.join(__dirname, '../../tmp/uploads');
const BASE_URL = process.env.API_BASE_URL || process.env.FRONTEND_URL?.replace(/:\d+$/, ':5000') || 'http://localhost:5000';

class MediaService {

    constructor() {
        // Ensure upload directory exists
        if (!fs.existsSync(UPLOAD_DIR)) {
            fs.mkdirSync(UPLOAD_DIR, { recursive: true });
        }
    }

    /**
     * Save a buffer to temporary storage and return a public URL
     * @param {Buffer} buffer - File buffer
     * @param {string} originalName - Original filename
     * @param {string} mimetype - MIME type
     * @returns {{ url: string, filePath: string }}
     */
    async uploadToTempStorage(buffer, originalName, mimetype) {
        const ext = path.extname(originalName) || this._getExtFromMime(mimetype);
        const uniqueName = `${crypto.randomBytes(16).toString('hex')}${ext}`;
        const filePath = path.join(UPLOAD_DIR, uniqueName);

        fs.writeFileSync(filePath, buffer);
        
        const url = `${BASE_URL}/tmp/uploads/${uniqueName}`;
        
        logger.info(`Media saved to temp storage: ${uniqueName} (${(buffer.length / 1024 / 1024).toFixed(2)}MB)`);
        
        return { url, filePath, filename: uniqueName };
    }

    /**
     * Upload multiple buffers and return array of URLs
     * @param {Array} files - Array of { data: Buffer, originalname, mimetype }
     * @returns {Array<{ url, filePath, filename }>}
     */
    async uploadMultiple(files) {
        const results = [];
        for (const file of files) {
            const result = await this.uploadToTempStorage(
                file.data || file.buffer,
                file.originalname || 'upload',
                file.mimetype || file.mimeType || 'image/jpeg'
            );
            results.push(result);
        }
        return results;
    }

    /**
     * Delete temp files after publishing
     * @param {Array<string>} filePaths - Array of absolute file paths
     */
    async cleanupTempFiles(filePaths) {
        for (const fp of filePaths) {
            try {
                if (fs.existsSync(fp)) {
                    fs.unlinkSync(fp);
                    logger.info(`Temp file cleaned up: ${path.basename(fp)}`);
                }
            } catch (err) {
                logger.warn(`Failed to cleanup temp file: ${err.message}`);
            }
        }
    }

    /**
     * Schedule cleanup after a delay (for async processing like Reels)
     * @param {Array<string>} filePaths 
     * @param {number} delayMs - Delay in milliseconds (default: 5 minutes)
     */
    scheduleCleanup(filePaths, delayMs = 5 * 60 * 1000) {
        setTimeout(() => {
            this.cleanupTempFiles(filePaths);
        }, delayMs);
    }

    /**
     * Check if a file is a video based on mimetype
     */
    isVideo(mimetype) {
        return mimetype && mimetype.startsWith('video/');
    }

    /**
     * Validate video file
     */
    validateVideo(buffer, mimetype) {
        const maxSize = 100 * 1024 * 1024; // 100MB
        const allowedTypes = ['video/mp4', 'video/quicktime', 'video/webm', 'video/mpeg'];

        if (!allowedTypes.includes(mimetype)) {
            throw new Error(`Unsupported video format: ${mimetype}. Use MP4, MOV, or WebM.`);
        }

        if (buffer.length > maxSize) {
            throw new Error(`Video too large (${(buffer.length / 1024 / 1024).toFixed(1)}MB). Maximum is 100MB.`);
        }

        return true;
    }

    _getExtFromMime(mime) {
        const map = {
            'image/jpeg': '.jpg',
            'image/png': '.png',
            'image/gif': '.gif',
            'image/webp': '.webp',
            'video/mp4': '.mp4',
            'video/quicktime': '.mov',
            'video/webm': '.webm',
            'video/mpeg': '.mpeg'
        };
        return map[mime] || '.bin';
    }
}

module.exports = new MediaService();
