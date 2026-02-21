/**
 * Bluesky Service
 * Handles AT Protocol API integration for Bluesky Social
 */

const { BskyAgent, RichText } = require('@atproto/api');
const { logger } = require('../utils/logger');
const { query } = require('../config/database');
const crypto = require('crypto');

// Encryption for storing tokens
const ALGORITHM = 'aes-256-gcm';
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'socialmrt-encryption-key-32char';

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
        logger.error('Decryption failed:', error.message);
        return null;
    }
}

class BlueskyService {
    constructor() {
        this.agents = new Map(); // Cache agents by account ID
    }

    /**
     * Create a new Bluesky agent
     */
    createAgent() {
        return new BskyAgent({
            service: 'https://bsky.social'
        });
    }

    /**
     * Connect/authenticate a Bluesky account
     * @param {string} handle - Bluesky handle (e.g., user.bsky.social)
     * @param {string} appPassword - App password from Bluesky settings
     * @param {number} userId - SocialMRT user ID
     */
    async connect(handle, appPassword, userId) {
        const agent = this.createAgent();

        try {
            // Authenticate with Bluesky
            const response = await agent.login({
                identifier: handle,
                password: appPassword
            });

            if (!response.success) {
                throw new Error('Authentication failed');
            }

            const profile = await agent.getProfile({ actor: handle });

            // Encrypt tokens before storing
            const encryptedAccessToken = encrypt(agent.session.accessJwt);
            const encryptedRefreshToken = encrypt(agent.session.refreshJwt);

            // Check if account already connected
            const existing = await query(
                `SELECT id FROM social_accounts 
                 WHERE user_id = ? AND platform = 'bluesky' AND account_id = ?`,
                [userId, response.data.did]
            );

            if (existing.length > 0) {
                // Update existing account
                await query(
                    `UPDATE social_accounts SET 
                     account_name = ?, account_username = ?, account_avatar = ?,
                     access_token = ?, refresh_token = ?, is_active = 1, updated_at = NOW()
                     WHERE id = ?`,
                    [
                        profile.data.displayName || handle,
                        handle,
                        profile.data.avatar || null,
                        encryptedAccessToken,
                        encryptedRefreshToken,
                        existing[0].id
                    ]
                );
                return { id: existing[0].id, reconnected: true };
            }

            // Insert new account
            const result = await query(
                `INSERT INTO social_accounts 
                 (user_id, platform, account_id, account_name, account_username, 
                  account_avatar, access_token, refresh_token, is_active, connected_at)
                 VALUES (?, 'bluesky', ?, ?, ?, ?, ?, ?, 1, NOW())`,
                [
                    userId,
                    response.data.did,
                    profile.data.displayName || handle,
                    handle,
                    profile.data.avatar || null,
                    encryptedAccessToken,
                    encryptedRefreshToken
                ]
            );

            logger.info(`Bluesky account connected: ${handle} for user ${userId}`);

            return {
                id: result.insertId,
                did: response.data.did,
                handle: handle,
                displayName: profile.data.displayName,
                avatar: profile.data.avatar,
                reconnected: false
            };

        } catch (error) {
            logger.error('Bluesky connection failed:', error.message);

            if (error.message.includes('Invalid identifier or password')) {
                throw new Error('Invalid handle or app password. Make sure you\'re using an App Password, not your main password.');
            }

            throw new Error(`Failed to connect Bluesky: ${error.message}`);
        }
    }

    /**
     * Get authenticated agent for an account
     */
    async getAgent(accountId, userId) {
        // Check cache first
        if (this.agents.has(accountId)) {
            return this.agents.get(accountId);
        }

        // Get account from database
        const accounts = await query(
            `SELECT * FROM social_accounts 
             WHERE id = ? AND user_id = ? AND platform = 'bluesky' AND is_active = 1`,
            [accountId, userId]
        );

        if (!accounts.length) {
            throw new Error('Bluesky account not found');
        }

        const account = accounts[0];
        const agent = this.createAgent();

        try {
            // Decrypt tokens
            const accessToken = decrypt(account.access_token);
            const refreshToken = decrypt(account.refresh_token);

            if (!accessToken || !refreshToken) {
                throw new Error('Failed to decrypt tokens');
            }

            // Resume session
            await agent.resumeSession({
                did: account.account_id,
                handle: account.account_username,
                accessJwt: accessToken,
                refreshJwt: refreshToken
            });

            // Cache the agent
            this.agents.set(accountId, agent);

            return agent;

        } catch (error) {
            logger.error('Failed to resume Bluesky session:', error.message);

            // Try to refresh session
            try {
                const refreshToken = decrypt(account.refresh_token);
                await agent.resumeSession({
                    did: account.account_id,
                    handle: account.account_username,
                    accessJwt: '',
                    refreshJwt: refreshToken
                });

                // Update tokens in database
                const newAccessToken = encrypt(agent.session.accessJwt);
                const newRefreshToken = encrypt(agent.session.refreshJwt);

                await query(
                    `UPDATE social_accounts SET access_token = ?, refresh_token = ?, updated_at = NOW() 
                     WHERE id = ?`,
                    [newAccessToken, newRefreshToken, accountId]
                );

                this.agents.set(accountId, agent);
                return agent;

            } catch (refreshError) {
                logger.error('Session refresh failed:', refreshError.message);
                throw new Error('Session expired. Please reconnect your Bluesky account.');
            }
        }
    }

    /**
     * Create a post on Bluesky
     */
    async createPost(accountId, userId, text, images = []) {
        const agent = await this.getAgent(accountId, userId);

        try {
            // Process rich text (handles mentions, links, etc.)
            const rt = new RichText({ text });
            await rt.detectFacets(agent);

            // Upload images if provided
            let embed = undefined;
            if (images.length > 0) {
                const uploadedImages = await Promise.all(
                    images.slice(0, 4).map(async (img) => {
                        const response = await agent.uploadBlob(img.data, {
                            encoding: img.mimeType
                        });
                        return {
                            alt: img.alt || '',
                            image: response.data.blob
                        };
                    })
                );

                embed = {
                    $type: 'app.bsky.embed.images',
                    images: uploadedImages
                };
            }

            // Create the post
            const response = await agent.post({
                text: rt.text,
                facets: rt.facets,
                embed: embed,
                createdAt: new Date().toISOString()
            });

            logger.info(`Bluesky post created: ${response.uri}`);

            return {
                uri: response.uri,
                cid: response.cid,
                success: true
            };

        } catch (error) {
            logger.error('Bluesky post failed:', error.message);
            throw new Error(`Failed to post to Bluesky: ${error.message}`);
        }
    }

    /**
     * Delete a post from Bluesky
     */
    async deletePost(accountId, userId, postUri) {
        const agent = await this.getAgent(accountId, userId);

        try {
            await agent.deletePost(postUri);
            logger.info(`Bluesky post deleted: ${postUri}`);
            return { success: true };
        } catch (error) {
            logger.error('Bluesky delete failed:', error.message);
            throw new Error(`Failed to delete post: ${error.message}`);
        }
    }

    /**
     * Get user profile
     */
    async getProfile(accountId, userId) {
        const agent = await this.getAgent(accountId, userId);

        try {
            const account = await query(
                'SELECT account_username FROM social_accounts WHERE id = ?',
                [accountId]
            );

            const profile = await agent.getProfile({ actor: account[0].account_username });

            return {
                did: profile.data.did,
                handle: profile.data.handle,
                displayName: profile.data.displayName,
                avatar: profile.data.avatar,
                description: profile.data.description,
                followersCount: profile.data.followersCount,
                followsCount: profile.data.followsCount,
                postsCount: profile.data.postsCount
            };

        } catch (error) {
            logger.error('Failed to get Bluesky profile:', error.message);
            throw new Error(`Failed to get profile: ${error.message}`);
        }
    }

    /**
     * Disconnect a Bluesky account
     */
    async disconnect(accountId, userId) {
        await query(
            `UPDATE social_accounts SET is_active = 0, updated_at = NOW() 
             WHERE id = ? AND user_id = ? AND platform = 'bluesky'`,
            [accountId, userId]
        );

        // Remove from cache
        this.agents.delete(accountId);

        logger.info(`Bluesky account ${accountId} disconnected for user ${userId}`);
        return { success: true };
    }
}

module.exports = new BlueskyService();
