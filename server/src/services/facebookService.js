/**
 * Facebook Service
 * Handles Facebook Graph API integration for publishing to Pages.
 */

const { logger } = require('../utils/logger');
const { query } = require('../config/database');
const crypto = require('crypto');
const axios = require('axios');
const FormData = require('form-data');

const FB_GRAPH_URL = 'https://graph.facebook.com/v20.0';

// Encryption Setup (Matching existing patterns in blueskyService/linkedinService)
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
        logger.error('Facebook decrypt failed:', error.message);
        return null;
    }
}

class FacebookService {
    constructor() {
        this.appId = process.env.FACEBOOK_APP_ID;
        this.appSecret = process.env.FACEBOOK_APP_SECRET;
    }

    /**
     * Generate OAuth URL for Facebook Login
     */
    getAuthUrl(redirectUri, state) {
        const scopes = 'pages_manage_posts,pages_read_engagement,pages_show_list,public_profile';
        const params = new URLSearchParams({
            client_id: this.appId,
            redirect_uri: redirectUri,
            state: state,
            response_type: 'code',
            scope: scopes
        });
        return `https://www.facebook.com/v20.0/dialog/oauth?${params.toString()}`;
    }

    /**
     * Connect Facebook account and fetch pages
     */
    async connect(code, redirectUri, userId) {
        // 1. Exchange code for short-lived access token
        let tokenData;
        try {
            const tokenRes = await axios.get(`${FB_GRAPH_URL}/oauth/access_token`, {
                params: {
                    client_id: this.appId,
                    redirect_uri: redirectUri,
                    client_secret: this.appSecret,
                    code: code
                }
            });
            tokenData = tokenRes.data;
        } catch (err) {
            logger.error('Facebook token exchange failed:', err.response?.data || err.message);
            throw new Error('Failed to exchange Facebook authorization code.');
        }

        const shortLivedToken = tokenData.access_token;

        // 2. Exchange short-lived token for long-lived user access token
        let longLivedTokenData;
        try {
            const llTokenRes = await axios.get(`${FB_GRAPH_URL}/oauth/access_token`, {
                params: {
                    grant_type: 'fb_exchange_token',
                    client_id: this.appId,
                    client_secret: this.appSecret,
                    fb_exchange_token: shortLivedToken
                }
            });
            longLivedTokenData = llTokenRes.data;
        } catch (err) {
            logger.error('Facebook long-lived token generation failed:', err.response?.data || err.message);
            throw new Error('Failed to generate Facebook long-lived access token.');
        }

        const longLivedToken = longLivedTokenData.access_token;
        const expiresInUser = longLivedTokenData.expires_in || (60 * 24 * 60 * 60); // Default to 60 days

        // 3. Get user id
        let userProfile;
        try {
            const profileRes = await axios.get(`${FB_GRAPH_URL}/me`, {
                params: { access_token: longLivedToken, fields: 'id,name' }
            });
            userProfile = profileRes.data;
        } catch(err) {
            throw new Error('Failed to fetch Facebook user profile.');
        }

        // 4. Get Pages managed by user (with Page Access Tokens)
        let pagesData;
        try {
            const pagesRes = await axios.get(`${FB_GRAPH_URL}/${userProfile.id}/accounts`, {
                params: { access_token: longLivedToken }
            });
            pagesData = pagesRes.data.data;
        } catch (err) {
            logger.error('Facebook fetch pages failed:', err.response?.data || err.message);
            throw new Error('Failed to fetch Facebook pages.');
        }

        if (!pagesData || pagesData.length === 0) {
            throw new Error('No Facebook Pages found for this account. You must manage a Facebook Page to connect.');
        }

        // We'll automatically connect the first page for simplicity in this flow,
        // or we could save all pages. Saving the first page as default.
        // A better approach in V2 would return the list to UI to select, but let's connect the primary one.
        const primaryPage = pagesData[0];
        
        // Page access tokens bound to a long-lived user token are permanent 
        // (unless permissions revoked or password changed). They don't have an expiry field often.
        const pageAccessToken = primaryPage.access_token;
        const pageId = primaryPage.id;
        const pageName = primaryPage.name;

        // 5. Fetch Page Avatar
        let pageAvatar = null;
        try {
            const avatarRes = await axios.get(`${FB_GRAPH_URL}/${pageId}/picture`, {
                params: { redirect: 0, type: 'normal', access_token: pageAccessToken }
            });
            if (avatarRes.data && avatarRes.data.data && avatarRes.data.data.url) {
                pageAvatar = avatarRes.data.data.url;
            }
        } catch (err) {
            logger.warn(`Could not fetch Facebook page avatar: ${err.message}`);
        }

        const encryptedToken = encrypt(pageAccessToken);
        const tokenExpiresAt = null; // Page tokens from long-lived user tokens don't expire typically.

        // Check if page already connected
        const existing = await query(
            `SELECT id FROM social_accounts WHERE user_id = ? AND platform = 'facebook' AND account_id = ?`,
            [userId, pageId]
        );

        if (existing.length > 0) {
            await query(
                `UPDATE social_accounts SET 
                 account_name = ?, account_avatar = ?, access_token = ?, 
                 token_expires_at = ?, is_active = 1, updated_at = NOW()
                 WHERE id = ?`,
                [pageName, pageAvatar, encryptedToken, tokenExpiresAt, existing[0].id]
            );
            logger.info(`Facebook page reconnected: ${pageName} for user ${userId}`);
            return { id: existing[0].id, reconnected: true, pageName, pageAvatar, pageId };
        }

        // Insert new
        const result = await query(
            `INSERT INTO social_accounts 
             (user_id, platform, account_id, account_name, account_avatar, access_token, token_expires_at, is_active, connected_at)
             VALUES (?, 'facebook', ?, ?, ?, ?, ?, 1, NOW())`,
            [userId, pageId, pageName, pageAvatar, encryptedToken, tokenExpiresAt]
        );

        logger.info(`Facebook page connected: ${pageName} for user ${userId}`);

        return {
            id: result.insertId,
            pageId,
            pageName,
            pageAvatar,
            reconnected: false
        };
    }

    /**
     * Create a post to the Facebook Page
     */
    async createPost(accountId, userId, text, images = []) {
        const account = await this._getAccount(accountId, userId);
        const accessToken = decrypt(account.access_token);

        if (!accessToken) {
            throw new Error('Failed to decrypt Facebook Page token. Please reconnect.');
        }

        const pageId = account.account_id;

        try {
            let response;
            
            // If images exist, use the /photos endpoint for the first image
            // Note: For multiple images, FB Graph API requires bulk publishing which is complex.
            // We'll handle a single image post here as the standard flow.
            if (images && images.length > 0) {
                const img = images[0];
                const formData = new FormData();
                formData.append('message', text || '');
                // FormData needs a buffer and filename
                formData.append('source', img.data, {
                    filename: 'upload.jpg',
                    contentType: img.mimeType || 'image/jpeg'
                });

                response = await axios.post(`${FB_GRAPH_URL}/${pageId}/photos?access_token=${accessToken}`, formData, {
                    headers: formData.getHeaders()
                });
            } else {
                // Text-only post
                response = await axios.post(`${FB_GRAPH_URL}/${pageId}/feed`, {
                    message: text,
                    access_token: accessToken
                });
            }

            logger.info(`Facebook post created successfully by user ${userId} on page ${pageId}. Post ID: ${response.data.id}`);

            return {
                postId: response.data.id,
                success: true
            };

        } catch (err) {
            logger.error(`Facebook post failed: ${JSON.stringify(err.response?.data || err.message)}`);
            throw new Error(err.response?.data?.error?.message || 'Failed to post to Facebook Page.');
        }
    }

    /**
     * Disconnect a Facebook account
     */
    async disconnect(accountId, userId) {
        await query(
            `UPDATE social_accounts SET is_active = 0, updated_at = NOW() 
             WHERE id = ? AND user_id = ? AND platform = 'facebook'`,
            [accountId, userId]
        );
        logger.info(`Facebook account ${accountId} disconnected for user ${userId}`);
        return { success: true };
    }

    /**
     * Internal helper: get account record
     */
    async _getAccount(accountId, userId) {
        const accounts = await query(
            `SELECT * FROM social_accounts 
             WHERE id = ? AND user_id = ? AND platform = 'facebook' AND is_active = 1`,
            [accountId, userId]
        );

        if (!accounts.length) {
            throw new Error('Facebook account not found or inactive');
        }
        return accounts[0];
    }
}

module.exports = new FacebookService();
