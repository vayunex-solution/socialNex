/**
 * LinkedIn Service
 * Handles LinkedIn OAuth 2.0 and Community Management API
 * Uses OpenID Connect for sign-in + Share on LinkedIn for posting
 */

const { logger } = require('../utils/logger');
const { query } = require('../config/database');
const crypto = require('crypto');
const axios = require('axios');

// Encryption (same pattern as blueskyService)
const ALGORITHM = 'aes-256-gcm';
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'SocialNex-encryption-key-32char';

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
        logger.error('LinkedIn decrypt failed:', error.message);
        return null;
    }
}

class LinkedInService {
    constructor() {
        this.clientId = process.env.LINKEDIN_CLIENT_ID;
        this.clientSecret = process.env.LINKEDIN_CLIENT_SECRET;
    }

    /**
     * Generate the LinkedIn OAuth authorization URL
     * @param {string} redirectUri - Frontend callback URL
     * @param {string} state - CSRF state param
     */
    getAuthUrl(redirectUri, state) {
        const scopes = 'openid profile email w_member_social';
        const params = new URLSearchParams({
            response_type: 'code',
            client_id: this.clientId,
            redirect_uri: redirectUri,
            state: state,
            scope: scopes
        });
        return `https://www.linkedin.com/oauth/v2/authorization?${params.toString()}`;
    }

    /**
     * Exchange authorization code for access token
     * @param {string} code - Auth code from LinkedIn callback
     * @param {string} redirectUri - Same redirect URI used in auth URL
     * @param {number} userId - SocialNex user ID
     */
    async connect(code, redirectUri, userId) {
        // 1. Exchange code for access token
        let tokenData;
        try {
            const tokenResponse = await axios.post('https://www.linkedin.com/oauth/v2/accessToken',
                new URLSearchParams({
                    grant_type: 'authorization_code',
                    code: code,
                    redirect_uri: redirectUri,
                    client_id: this.clientId,
                    client_secret: this.clientSecret
                }).toString(),
                {
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
                }
            );
            tokenData = tokenResponse.data;
        } catch (err) {
            logger.error('LinkedIn token exchange failed:', err.response?.data || err.message);
            throw new Error(err.response?.data?.error_description || 'Failed to get LinkedIn access token');
        }

        const accessToken = tokenData.access_token;
        const expiresIn = tokenData.expires_in; // seconds (usually 5184000 = 60 days)

        // 2. Fetch user profile using /v2/userinfo (OpenID Connect)
        let profile;
        try {
            const profileResponse = await axios.get('https://api.linkedin.com/v2/userinfo', {
                headers: { 'Authorization': `Bearer ${accessToken}` }
            });
            profile = profileResponse.data;
        } catch (err) {
            logger.error('LinkedIn profile fetch failed:', err.response?.data || err.message);
            throw new Error('Failed to fetch LinkedIn profile');
        }
        // profile has: sub, name, given_name, family_name, email, picture, email_verified

        const linkedinId = profile.sub; // Unique LinkedIn member ID
        const displayName = profile.name || `${profile.given_name || ''} ${profile.family_name || ''}`.trim();
        const avatar = profile.picture || null;
        const email = profile.email || null;

        // 3. Encrypt and store
        const encryptedToken = encrypt(accessToken);
        const tokenExpiresAt = new Date(Date.now() + expiresIn * 1000);

        // Check if already connected
        const existing = await query(
            `SELECT id FROM social_accounts 
             WHERE user_id = ? AND platform = 'linkedin' AND account_id = ?`,
            [userId, linkedinId]
        );

        if (existing.length > 0) {
            await query(
                `UPDATE social_accounts SET 
                 account_name = ?, account_username = ?, account_avatar = ?,
                 access_token = ?, token_expires_at = ?, is_active = 1, updated_at = NOW()
                 WHERE id = ?`,
                [displayName, email || linkedinId, avatar, encryptedToken, tokenExpiresAt, existing[0].id]
            );
            logger.info(`LinkedIn account reconnected: ${displayName} for user ${userId}`);
            return { id: existing[0].id, reconnected: true, displayName, avatar };
        }

        // Insert new
        const result = await query(
            `INSERT INTO social_accounts 
             (user_id, platform, account_id, account_name, account_username, 
              account_avatar, access_token, token_expires_at, is_active, connected_at)
             VALUES (?, 'linkedin', ?, ?, ?, ?, ?, ?, 1, NOW())`,
            [userId, linkedinId, displayName, email || linkedinId, avatar, encryptedToken, tokenExpiresAt]
        );

        logger.info(`LinkedIn account connected: ${displayName} for user ${userId}`);

        return {
            id: result.insertId,
            linkedinId,
            displayName,
            avatar,
            email,
            reconnected: false
        };
    }

    /**
     * Create a text post on LinkedIn
     * @param {number} accountId - social_accounts ID
     * @param {number} userId - SocialNex user ID
     * @param {string} text - Post content
     */
    async createPost(accountId, userId, text) {
        const account = await this._getAccount(accountId, userId);
        const accessToken = decrypt(account.access_token);

        if (!accessToken) {
            throw new Error('Failed to decrypt LinkedIn token. Please reconnect.');
        }

        // Check token expiry
        if (account.token_expires_at && new Date(account.token_expires_at) < new Date()) {
            throw new Error('LinkedIn token expired. Please reconnect your account.');
        }

        // LinkedIn API v2 - Create a share (UGC Post)
        const postBody = {
            author: `urn:li:person:${account.account_id}`,
            lifecycleState: 'PUBLISHED',
            specificContent: {
                'com.linkedin.ugc.ShareContent': {
                    shareCommentary: {
                        text: text
                    },
                    shareMediaCategory: 'NONE'
                }
            },
            visibility: {
                'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
            }
        };

        let result;
        try {
            const response = await axios.post('https://api.linkedin.com/v2/ugcPosts', postBody, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                    'X-Restli-Protocol-Version': '2.0.0'
                }
            });
            result = response.data;
        } catch (err) {
            logger.error('LinkedIn post failed:', err.response?.data || err.message);
            throw new Error(err.response?.data?.message || `LinkedIn post failed (HTTP ${err.response?.status || 500})`);
        }

        logger.info(`LinkedIn post created: ${result.id}`);

        return {
            postId: result.id,
            success: true
        };
    }

    /**
     * Disconnect a LinkedIn account
     */
    async disconnect(accountId, userId) {
        await query(
            `UPDATE social_accounts SET is_active = 0, updated_at = NOW() 
             WHERE id = ? AND user_id = ? AND platform = 'linkedin'`,
            [accountId, userId]
        );
        logger.info(`LinkedIn account ${accountId} disconnected for user ${userId}`);
        return { success: true };
    }

    /**
     * Internal helper: get account record
     */
    async _getAccount(accountId, userId) {
        const accounts = await query(
            `SELECT * FROM social_accounts 
             WHERE id = ? AND user_id = ? AND platform = 'linkedin' AND is_active = 1`,
            [accountId, userId]
        );

        if (!accounts.length) {
            throw new Error('LinkedIn account not found or inactive');
        }
        return accounts[0];
    }
}

module.exports = new LinkedInService();
