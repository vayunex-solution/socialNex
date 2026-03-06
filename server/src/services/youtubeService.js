/**
 * YouTube Service
 * Handles YouTube OAuth 2.0 (Google) and Data API v3
 * Supports: channel connect, video upload, channel stats
 */

const axios = require('axios');
const crypto = require('crypto');
const fs = require('fs');
const FormData = require('form-data');
const { logger } = require('../utils/logger');
const { query } = require('../config/database');

// ── AES-256-GCM Encryption (same pattern as LinkedIn) ──
const ALGORITHM = 'aes-256-gcm';
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'socialnex-encryption-key-32char';

function encrypt(text) {
    const iv = crypto.randomBytes(16);
    const key = crypto.scryptSync(ENCRYPTION_KEY, 'salt', 32);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag().toString('hex');
    return `${iv.toString('hex')}:${authTag}:${encrypted}`;
}

function decrypt(encryptedData) {
    try {
        const [ivHex, authTagHex, encrypted] = encryptedData.split(':');
        const iv = Buffer.from(ivHex, 'hex');
        const authTag = Buffer.from(authTagHex, 'hex');
        const key = crypto.scryptSync(ENCRYPTION_KEY, 'salt', 32);
        const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
        decipher.setAuthTag(authTag);
        let decrypted = decipher.update(encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    } catch (error) {
        logger.error('YouTube decrypt failed:', error.message);
        return null;
    }
}

class YouTubeService {
    constructor() {
        this.clientId = process.env.GOOGLE_CLIENT_ID;
        this.clientSecret = process.env.GOOGLE_CLIENT_SECRET;
        this.redirectUri = process.env.GOOGLE_REDIRECT_URI;
        this.tokenUrl = 'https://oauth2.googleapis.com/token';
        this.apiBase = 'https://www.googleapis.com/youtube/v3';
        this.uploadBase = 'https://www.googleapis.com/upload/youtube/v3';
    }

    /**
     * Generate Google OAuth URL for YouTube
     */
    getAuthUrl(state) {
        const scopes = [
            'https://www.googleapis.com/auth/youtube.upload',
            'https://www.googleapis.com/auth/youtube.readonly',
            'https://www.googleapis.com/auth/userinfo.profile',
            'https://www.googleapis.com/auth/userinfo.email'
        ].join(' ');

        const params = new URLSearchParams({
            response_type: 'code',
            client_id: this.clientId,
            redirect_uri: this.redirectUri,
            scope: scopes,
            access_type: 'offline',   // get refresh_token
            prompt: 'consent',         // force refresh_token every time
            state: state
        });

        return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
    }

    /**
     * Exchange auth code for tokens and store the YouTube account
     */
    async connect(code, userId) {
        // 1. Exchange code for tokens
        let tokenData;
        try {
            const response = await axios.post(this.tokenUrl, new URLSearchParams({
                code,
                client_id: this.clientId,
                client_secret: this.clientSecret,
                redirect_uri: this.redirectUri,
                grant_type: 'authorization_code'
            }).toString(), {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            });
            tokenData = response.data;
        } catch (err) {
            logger.error('YouTube token exchange failed:', err.response?.data || err.message);
            throw new Error(err.response?.data?.error_description || 'Failed to get YouTube access token');
        }

        const { access_token, refresh_token, expires_in } = tokenData;

        // 2. Fetch channel info
        let channel;
        try {
            const res = await axios.get(`${this.apiBase}/channels`, {
                params: { part: 'snippet,statistics', mine: true },
                headers: { Authorization: `Bearer ${access_token}` }
            });
            channel = res.data.items?.[0];
            if (!channel) throw new Error('No YouTube channel found. Please create a channel first.');
        } catch (err) {
            logger.error('YouTube channel fetch failed:', err.response?.data || err.message);
            throw new Error('Could not fetch YouTube channel. Make sure you have a YouTube channel.');
        }

        const channelId = channel.id;
        const channelName = channel.snippet.title;
        const channelAvatar = channel.snippet.thumbnails?.default?.url || null;
        const channelHandle = channel.snippet.customUrl || channelId;

        // 3. Encrypt tokens
        const encryptedAccess = encrypt(access_token);
        const encryptedRefresh = refresh_token ? encrypt(refresh_token) : null;
        const tokenExpiresAt = new Date(Date.now() + (expires_in || 3600) * 1000);

        // 4. Upsert into social_accounts
        const existing = await query(
            `SELECT id FROM social_accounts WHERE user_id = ? AND platform = 'youtube' AND account_id = ?`,
            [userId, channelId]
        );

        if (existing.length > 0) {
            await query(
                `UPDATE social_accounts SET
                 account_name = ?, account_username = ?, account_avatar = ?,
                 access_token = ?, refresh_token = ?, token_expires_at = ?,
                 is_active = 1, updated_at = NOW()
                 WHERE id = ?`,
                [channelName, channelHandle, channelAvatar,
                 encryptedAccess, encryptedRefresh, tokenExpiresAt, existing[0].id]
            );
            logger.info(`YouTube reconnected: ${channelName} for user ${userId}`);
            return { id: existing[0].id, reconnected: true, channelName, channelAvatar };
        }

        const result = await query(
            `INSERT INTO social_accounts
             (user_id, platform, account_id, account_name, account_username,
              account_avatar, access_token, refresh_token, token_expires_at, is_active, connected_at)
             VALUES (?, 'youtube', ?, ?, ?, ?, ?, ?, ?, 1, NOW())`,
            [userId, channelId, channelName, channelHandle, channelAvatar,
             encryptedAccess, encryptedRefresh, tokenExpiresAt]
        );

        logger.info(`YouTube connected: ${channelName} for user ${userId}`);
        return { id: result.insertId, reconnected: false, channelName, channelAvatar };
    }

    /**
     * Upload a video to YouTube
     * @param {number} accountId - social_accounts row ID
     * @param {number} userId
     * @param {object} videoData - { videoPath, title, description, tags, privacy, categoryId, thumbnailPath }
     */
    async uploadVideo(accountId, userId, videoData) {
        const account = await this._getAccount(accountId, userId);
        const accessToken = await this._getValidToken(account);

        const {
            videoPath,
            title = 'SocialNex Upload',
            description = '',
            tags = [],
            privacy = 'public',            // public | unlisted | private
            categoryId = '22',             // 22 = People & Blogs (default)
            thumbnailPath = null
        } = videoData;

        if (!videoPath || !fs.existsSync(videoPath)) {
            throw new Error('Video file not found');
        }

        const videoStat = fs.statSync(videoPath);
        const videoStream = fs.createReadStream(videoPath);

        // Step 1: Initiate resumable upload
        let uploadUrl;
        try {
            const initRes = await axios.post(
                `${this.uploadBase}/videos?uploadType=resumable&part=snippet,status`,
                {
                    snippet: {
                        title: title.substring(0, 100),
                        description: description.substring(0, 5000),
                        tags: Array.isArray(tags) ? tags.slice(0, 500) : [],
                        categoryId
                    },
                    status: {
                        privacyStatus: privacy,
                        selfDeclaredMadeForKids: false
                    }
                },
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        'Content-Type': 'application/json',
                        'X-Upload-Content-Type': 'video/*',
                        'X-Upload-Content-Length': videoStat.size
                    }
                }
            );
            uploadUrl = initRes.headers.location;
        } catch (err) {
            logger.error('YouTube resumable upload init failed:', err.response?.data || err.message);
            throw new Error(err.response?.data?.error?.message || 'Failed to initiate YouTube upload');
        }

        // Step 2: Upload video data
        let videoResult;
        try {
            const uploadRes = await axios.put(uploadUrl, videoStream, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'video/*',
                    'Content-Length': videoStat.size
                },
                maxBodyLength: Infinity,
                maxContentLength: Infinity
            });
            videoResult = uploadRes.data;
        } catch (err) {
            logger.error('YouTube video upload failed:', err.response?.data || err.message);
            throw new Error(err.response?.data?.error?.message || 'YouTube video upload failed');
        }

        const videoId = videoResult.id;
        const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;

        // Step 3: Upload custom thumbnail if provided
        if (thumbnailPath && fs.existsSync(thumbnailPath)) {
            try {
                const thumbStream = fs.createReadStream(thumbnailPath);
                const thumbStat = fs.statSync(thumbnailPath);
                await axios.post(
                    `${this.uploadBase}/thumbnails?uploadType=media&videoId=${videoId}`,
                    thumbStream,
                    {
                        headers: {
                            Authorization: `Bearer ${accessToken}`,
                            'Content-Type': 'image/jpeg',
                            'Content-Length': thumbStat.size
                        },
                        maxBodyLength: Infinity
                    }
                );
                logger.info(`YouTube thumbnail uploaded for video ${videoId}`);
            } catch (err) {
                // Non-fatal — video uploaded, thumbnail optional
                logger.warn(`YouTube thumbnail upload failed for ${videoId}:`, err.response?.data || err.message);
            }
        }

        logger.info(`YouTube video uploaded: ${videoId} for user ${userId}`);

        return {
            success: true,
            videoId,
            videoUrl,
            status: videoResult.status?.uploadStatus || 'uploaded',
            title: videoResult.snippet?.title,
            privacy: videoResult.status?.privacyStatus
        };
    }

    /**
     * Get channel statistics
     */
    async getChannelStats(accountId, userId) {
        const account = await this._getAccount(accountId, userId);
        const accessToken = await this._getValidToken(account);

        try {
            const res = await axios.get(`${this.apiBase}/channels`, {
                params: {
                    part: 'snippet,statistics,brandingSettings',
                    mine: true
                },
                headers: { Authorization: `Bearer ${accessToken}` }
            });

            const ch = res.data.items?.[0];
            if (!ch) throw new Error('Channel not found');

            return {
                channelId: ch.id,
                title: ch.snippet.title,
                description: ch.snippet.description,
                avatar: ch.snippet.thumbnails?.medium?.url,
                subscribers: parseInt(ch.statistics.subscriberCount || 0),
                totalViews: parseInt(ch.statistics.viewCount || 0),
                videoCount: parseInt(ch.statistics.videoCount || 0),
                hiddenSubscriberCount: ch.statistics.hiddenSubscriberCount || false,
                country: ch.snippet.country || null,
                customUrl: ch.snippet.customUrl || null
            };
        } catch (err) {
            logger.error('YouTube channel stats failed:', err.response?.data || err.message);
            throw new Error('Failed to fetch YouTube channel stats');
        }
    }

    /**
     * Get video upload status (for async processing check)
     */
    async getVideoStatus(accountId, userId, videoId) {
        const account = await this._getAccount(accountId, userId);
        const accessToken = await this._getValidToken(account);

        try {
            const res = await axios.get(`${this.apiBase}/videos`, {
                params: { part: 'status,snippet,statistics', id: videoId },
                headers: { Authorization: `Bearer ${accessToken}` }
            });

            const video = res.data.items?.[0];
            if (!video) throw new Error('Video not found');

            return {
                videoId,
                uploadStatus: video.status.uploadStatus,      // 'processed' | 'processing' | 'failed'
                privacyStatus: video.status.privacyStatus,
                title: video.snippet?.title,
                viewCount: video.statistics?.viewCount || 0,
                likeCount: video.statistics?.likeCount || 0,
                commentCount: video.statistics?.commentCount || 0
            };
        } catch (err) {
            logger.error('YouTube video status failed:', err.message);
            throw new Error('Failed to fetch video status');
        }
    }

    /**
     * Disconnect YouTube account
     */
    async disconnect(accountId, userId) {
        await query(
            `UPDATE social_accounts SET is_active = 0, updated_at = NOW()
             WHERE id = ? AND user_id = ? AND platform = 'youtube'`,
            [accountId, userId]
        );
        logger.info(`YouTube account ${accountId} disconnected for user ${userId}`);
        return { success: true };
    }

    // ── Private Helpers ──────────────────────────────────────

    async _getAccount(accountId, userId) {
        const accounts = await query(
            `SELECT * FROM social_accounts
             WHERE id = ? AND user_id = ? AND platform = 'youtube' AND is_active = 1`,
            [accountId, userId]
        );
        if (!accounts.length) throw new Error('YouTube account not found or inactive');
        return accounts[0];
    }

    async _getValidToken(account) {
        const now = new Date();
        const expiresAt = account.token_expires_at ? new Date(account.token_expires_at) : null;

        // If token expires within 5 minutes, refresh it
        if (expiresAt && (expiresAt - now) < 5 * 60 * 1000) {
            return await this._refreshToken(account);
        }

        const token = decrypt(account.access_token);
        if (!token) throw new Error('Failed to decrypt YouTube token. Please reconnect.');
        return token;
    }

    async _refreshToken(account) {
        if (!account.refresh_token) {
            throw new Error('YouTube token expired and no refresh token. Please reconnect.');
        }

        const refreshToken = decrypt(account.refresh_token);
        if (!refreshToken) throw new Error('Failed to decrypt refresh token. Please reconnect.');

        try {
            const res = await axios.post(this.tokenUrl, new URLSearchParams({
                client_id: this.clientId,
                client_secret: this.clientSecret,
                refresh_token: refreshToken,
                grant_type: 'refresh_token'
            }).toString(), {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            });

            const { access_token, expires_in } = res.data;
            const encryptedAccess = encrypt(access_token);
            const tokenExpiresAt = new Date(Date.now() + (expires_in || 3600) * 1000);

            await query(
                `UPDATE social_accounts SET access_token = ?, token_expires_at = ?, updated_at = NOW()
                 WHERE id = ?`,
                [encryptedAccess, tokenExpiresAt, account.id]
            );

            logger.info(`YouTube token refreshed for account ${account.id}`);
            return access_token;
        } catch (err) {
            logger.error('YouTube token refresh failed:', err.response?.data || err.message);
            throw new Error('YouTube token refresh failed. Please reconnect your account.');
        }
    }
}

module.exports = new YouTubeService();
