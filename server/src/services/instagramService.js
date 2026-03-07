/**
 * Instagram Service
 * Handles Instagram Graph API content publishing (Posts, Stories, Reels)
 * 
 * Instagram uses Meta's Graph API with a 2-step container model:
 *   Step 1: Create a media container with POST /{ig-user-id}/media
 *   Step 2: Publish the container with POST /{ig-user-id}/media_publish
 * 
 * Requires: instagram_basic, instagram_content_publish permissions
 * Account type: Instagram Business or Creator (linked to Facebook Page)
 */

const { logger } = require('../utils/logger');
const { query } = require('../config/database');
const crypto = require('crypto');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const FB_GRAPH_URL = 'https://graph.facebook.com/v20.0';

// Encryption (same pattern as other services)
const ALGORITHM = 'aes-256-gcm';
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'socialnex-encryption-key-32char';

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
        logger.error('Instagram decrypt failed:', error.message);
        return null;
    }
}

class InstagramService {

    /**
     * Create a photo post (single image or carousel)
     * @param {number} accountId - social_accounts ID
     * @param {number} userId - SocialNex user ID
     * @param {string} caption - Post caption
     * @param {Array} mediaUrls - Array of publicly accessible image URLs
     */
    async createPost(accountId, userId, caption, mediaUrls = []) {
        const account = await this._getAccount(accountId, userId);
        const accessToken = decrypt(account.access_token);
        const igUserId = account.account_id;

        if (!accessToken) {
            throw new Error('Failed to decrypt Instagram token. Please reconnect Facebook.');
        }

        try {
            if (mediaUrls.length === 0) {
                throw new Error('Instagram requires at least one image for a post.');
            }

            if (mediaUrls.length === 1) {
                const url = mediaUrls[0];
                const isVideo = url.match(/\.(mp4|mov|webm)$/i);
                
                const params = isVideo ? {
                    video_url: url,
                    media_type: 'VIDEO',
                    caption: caption
                } : {
                    image_url: url,
                    caption: caption
                };

                const containerId = await this._createMediaContainer(igUserId, accessToken, params);
                await this._waitForProcessing(igUserId, accessToken, containerId, isVideo ? 60 : 30);
                const result = await this._publishContainer(igUserId, accessToken, containerId);
                
                logger.info(`Instagram post published for user ${userId}, post: ${result.id}`);
                return { postId: result.id, success: true, type: 'post' };
            }

            // Carousel post (multiple images)
            const childContainerIds = [];
            for (const url of mediaUrls.slice(0, 10)) { // Max 10 items
                const isVideo = url.match(/\.(mp4|mov|webm)$/i);
                
                const params = isVideo ? {
                    video_url: url,
                    media_type: 'VIDEO',
                    is_carousel_item: true
                } : {
                    image_url: url,
                    is_carousel_item: true
                };

                const childId = await this._createMediaContainer(igUserId, accessToken, params);
                await this._waitForProcessing(igUserId, accessToken, childId, isVideo ? 60 : 30);
                childContainerIds.push(childId);
            }

            // Create carousel container
            const carouselId = await this._createMediaContainer(igUserId, accessToken, {
                media_type: 'CAROUSEL',
                caption: caption,
                children: childContainerIds.join(',')
            });
            const result = await this._publishContainer(igUserId, accessToken, carouselId);

            logger.info(`Instagram carousel published for user ${userId}, post: ${result.id}`);
            return { postId: result.id, success: true, type: 'carousel' };

        } catch (err) {
            logger.error(`Instagram post failed: ${JSON.stringify(err.response?.data || err.message)}`);
            throw new Error(err.response?.data?.error?.message || `Instagram post failed: ${err.message}`);
        }
    }

    /**
     * Create a Story (image or video)
     * @param {string} mediaUrl - Publicly accessible URL
     * @param {string} mediaType - 'IMAGE' or 'VIDEO'
     */
    async createStory(accountId, userId, mediaUrl, mediaType = 'IMAGE') {
        const account = await this._getAccount(accountId, userId);
        const accessToken = decrypt(account.access_token);
        const igUserId = account.account_id;

        if (!accessToken) {
            throw new Error('Failed to decrypt Instagram token. Please reconnect Facebook.');
        }

        try {
            const params = {};
            if (mediaType === 'VIDEO') {
                params.video_url = mediaUrl;
                params.media_type = 'STORIES';
            } else {
                params.image_url = mediaUrl;
                params.media_type = 'STORIES';
            }

            const containerId = await this._createMediaContainer(igUserId, accessToken, params);
            await this._waitForProcessing(igUserId, accessToken, containerId, mediaType === 'VIDEO' ? 60 : 30);
            const result = await this._publishContainer(igUserId, accessToken, containerId);

            logger.info(`Instagram story published for user ${userId}`);
            return { postId: result.id, success: true, type: 'story' };

        } catch (err) {
            logger.error(`Instagram story failed: ${JSON.stringify(err.response?.data || err.message)}`);
            throw new Error(err.response?.data?.error?.message || `Instagram story failed: ${err.message}`);
        }
    }

    /**
     * Create a Reel (video only)
     * @param {string} videoUrl - Publicly accessible video URL
     * @param {string} caption - Reel caption
     */
    async createReel(accountId, userId, videoUrl, caption = '') {
        const account = await this._getAccount(accountId, userId);
        const accessToken = decrypt(account.access_token);
        const igUserId = account.account_id;

        if (!accessToken) {
            throw new Error('Failed to decrypt Instagram token. Please reconnect Facebook.');
        }

        try {
            const containerId = await this._createMediaContainer(igUserId, accessToken, {
                video_url: videoUrl,
                caption: caption,
                media_type: 'REELS'
            });

            // Reels need longer processing time
            await this._waitForProcessing(igUserId, accessToken, containerId, 120);
            const result = await this._publishContainer(igUserId, accessToken, containerId);

            logger.info(`Instagram reel published for user ${userId}, reel: ${result.id}`);
            return { postId: result.id, success: true, type: 'reel' };

        } catch (err) {
            logger.error(`Instagram reel failed: ${JSON.stringify(err.response?.data || err.message)}`);
            throw new Error(err.response?.data?.error?.message || `Instagram reel failed: ${err.message}`);
        }
    }

    /**
     * Step 1: Create a media container
     */
    async _createMediaContainer(igUserId, accessToken, params) {
        const res = await axios.post(`${FB_GRAPH_URL}/${igUserId}/media`, null, {
            params: {
                ...params,
                access_token: accessToken
            }
        });

        if (!res.data?.id) {
            throw new Error('Failed to create Instagram media container.');
        }

        return res.data.id;
    }

    /**
     * Step 2: Publish the container
     */
    async _publishContainer(igUserId, accessToken, containerId) {
        const res = await axios.post(`${FB_GRAPH_URL}/${igUserId}/media_publish`, null, {
            params: {
                creation_id: containerId,
                access_token: accessToken
            }
        });

        return res.data;
    }

    /**
     * Poll until media container is ready for publishing
     * Video content needs time to process on Instagram's servers
     */
    async _waitForProcessing(igUserId, accessToken, containerId, maxWaitSeconds = 30) {
        const startTime = Date.now();
        const pollInterval = 3000; // 3 seconds

        while ((Date.now() - startTime) < maxWaitSeconds * 1000) {
            const res = await axios.get(`${FB_GRAPH_URL}/${containerId}`, {
                params: {
                    fields: 'status_code',
                    access_token: accessToken
                }
            });

            const status = res.data.status_code;

            if (status === 'FINISHED') {
                return true;
            }

            if (status === 'ERROR') {
                throw new Error('Instagram media processing failed. Please try a different file.');
            }

            // Wait before next poll
            await new Promise(resolve => setTimeout(resolve, pollInterval));
        }

        throw new Error('Instagram media processing timed out. Video may be too large or in an unsupported format.');
    }

    /**
     * Disconnect Instagram account
     */
    async disconnect(accountId, userId) {
        await query(
            `UPDATE social_accounts SET is_active = 0, updated_at = NOW()
             WHERE id = ? AND user_id = ? AND platform = 'instagram'`,
            [accountId, userId]
        );
        logger.info(`Instagram account ${accountId} disconnected for user ${userId}`);
        return { success: true };
    }

    /**
     * Internal: Get account from DB
     */
    async _getAccount(accountId, userId) {
        const accounts = await query(
            `SELECT * FROM social_accounts
             WHERE id = ? AND user_id = ? AND platform = 'instagram' AND is_active = 1`,
            [accountId, userId]
        );

        if (!accounts.length) {
            throw new Error('Instagram account not found or disconnected. Please reconnect via Facebook.');
        }

        return accounts[0];
    }
}

module.exports = new InstagramService();
