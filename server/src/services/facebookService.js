/**
 * Facebook Service
 * Handles Facebook Graph API integration for publishing to Pages.
 */

const { logger } = require('../utils/logger');
const { query } = require('../config/database');
const crypto = require('crypto');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

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
        const scopes = 'pages_manage_posts,pages_read_engagement,pages_show_list,public_profile,business_management,instagram_basic,instagram_content_publish,instagram_manage_insights';
        const params = new URLSearchParams({
            client_id: this.appId,
            redirect_uri: redirectUri,
            state: state,
            response_type: 'code',
            scope: scopes,
            auth_type: 'rerequest'
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
        } catch (err) {
            throw new Error('Failed to fetch Facebook user profile.');
        }

        // 4. Debug: Check what permissions were actually granted
        let grantedPerms = [];
        try {
            const permRes = await axios.get(`${FB_GRAPH_URL}/${userProfile.id}/permissions`, {
                params: { access_token: longLivedToken }
            });
            grantedPerms = permRes.data.data || [];
            console.error('[FB DEBUG] Granted permissions:', JSON.stringify(grantedPerms));
        } catch (e) {
            console.error('[FB DEBUG] Could not fetch permissions:', e.message);
        }

        // 5. Get Pages managed by user (with Page Access Tokens)
        let pagesData;
        try {
            const pagesRes = await axios.get(`${FB_GRAPH_URL}/${userProfile.id}/accounts`, {
                params: { access_token: longLivedToken }
            });
            console.error(`[FB DEBUG] Pages response: ${JSON.stringify(pagesRes.data)}`);
            pagesData = pagesRes.data.data;
        } catch (err) {
            console.error('[FB DEBUG] Fetch pages FAILED:', err.response?.data || err.message);
            throw new Error('Failed to fetch Facebook pages: ' + JSON.stringify(err.response?.data || err.message));
        }

        if (!pagesData || pagesData.length === 0) {
            // Fallback: Try to find pages through Business Portfolio
            console.error('[FB DEBUG] Direct accounts empty, trying business pages fallback...');
            try {
                const bizRes = await axios.get(`${FB_GRAPH_URL}/${userProfile.id}/businesses`, {
                    params: { access_token: longLivedToken }
                });
                console.error(`[FB DEBUG] Businesses: ${JSON.stringify(bizRes.data)}`);

                if (bizRes.data.data && bizRes.data.data.length > 0) {
                    for (const biz of bizRes.data.data) {
                        const bizPagesRes = await axios.get(`${FB_GRAPH_URL}/${biz.id}/owned_pages`, {
                            params: { access_token: longLivedToken, fields: 'id,name,access_token,category' }
                        });
                        console.error(`[FB DEBUG] Business ${biz.name} pages: ${JSON.stringify(bizPagesRes.data)}`);
                        if (bizPagesRes.data.data && bizPagesRes.data.data.length > 0) {
                            pagesData = bizPagesRes.data.data;
                            break;
                        }
                    }
                }
            } catch (bizErr) {
                console.error('[FB DEBUG] Business pages fallback failed:', bizErr.response?.data || bizErr.message);
            }
        }

        if (!pagesData || pagesData.length === 0) {
            const permList = grantedPerms.map(p => `${p.permission}:${p.status}`).join(', ');
            const debugMsg = `Permissions=[${permList}] User=${userProfile.name}(${userProfile.id})`;
            console.error(`[FB DEBUG] No pages found even after business fallback. ${debugMsg}`);
            throw new Error(`No Facebook Pages found. Debug: ${debugMsg}`);
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

        let fbAccountId;
        let reconnected = false;

        if (existing.length > 0) {
            await query(
                `UPDATE social_accounts SET 
                 account_name = ?, account_avatar = ?, access_token = ?, 
                 token_expires_at = ?, is_active = 1, updated_at = NOW()
                 WHERE id = ?`,
                [pageName, pageAvatar, encryptedToken, tokenExpiresAt, existing[0].id]
            );
            logger.info(`Facebook page reconnected: ${pageName} for user ${userId}`);
            fbAccountId = existing[0].id;
            reconnected = true;
        } else {
            // Insert new
            const result = await query(
                `INSERT INTO social_accounts 
                 (user_id, platform, account_id, account_name, account_avatar, access_token, token_expires_at, is_active, connected_at)
                 VALUES (?, 'facebook', ?, ?, ?, ?, ?, 1, NOW())`,
                [userId, pageId, pageName, pageAvatar, encryptedToken, tokenExpiresAt]
            );
            logger.info(`Facebook page connected: ${pageName} for user ${userId}`);
            fbAccountId = result.insertId;
        }

        // 7. Auto-detect linked Instagram Business Account (runs on BOTH connect AND reconnect)
        let instagramAccount = null;
        try {
            instagramAccount = await this._detectInstagramAccount(pageId, pageAccessToken, pageAvatar, userId);
            console.error('[FB DEBUG] Instagram auto-detected:', JSON.stringify(instagramAccount));
        } catch (igErr) {
            console.error('[FB DEBUG] Instagram auto-detect FAILED:', igErr.message);
        }

        return {
            id: fbAccountId,
            pageId,
            pageName,
            pageAvatar,
            reconnected,
            instagram: instagramAccount
        };
    }

    /**
     * Create a post, story, or reel to the Facebook Page
     */
    async createPost(accountId, userId, text, images = [], postType = 'post', publicUrls = []) {
        const account = await this._getAccount(accountId, userId);
        const accessToken = decrypt(account.access_token);

        if (!accessToken) {
            throw new Error('Failed to decrypt Facebook Page token. Please reconnect.');
        }

        const pageId = account.account_id;

        try {
            let response;

            // Post Type: REEL
            if (postType === 'reel') {
                if (!publicUrls || publicUrls.length === 0) {
                    throw new Error('Reels require a video URL.');
                }

                // Step 1: Initialize upload
                const initRes = await axios.post(`${FB_GRAPH_URL}/${pageId}/video_reels?access_token=${accessToken}`, {
                    upload_phase: 'start'
                });

                const videoId = initRes.data.video_id;

                // Step 2: Upload video using public URL
                await axios.post(`${FB_GRAPH_URL}/${pageId}/video_reels?access_token=${accessToken}`, {
                    upload_phase: 'transfer',
                    video_id: videoId,
                    file_url: publicUrls[0]
                });

                // Step 3: Publish Reel
                response = await axios.post(`${FB_GRAPH_URL}/${pageId}/video_reels?access_token=${accessToken}`, {
                    upload_phase: 'finish',
                    video_id: videoId,
                    video_state: 'PUBLISHED',
                    description: text || ''
                });

                // Wait for Facebook to process the reel, otherwise it can silently fail on their end
                await this._waitForReelProcessing(videoId, accessToken);

                logger.info(`Facebook Reel published by user ${userId} on page ${pageId}. Reel ID: ${videoId}`);
                return { postId: videoId, success: true };
            }

            // Post Type: STORY
            if (postType === 'story') {
                if (!publicUrls || publicUrls.length === 0) {
                    throw new Error('Stories require a media URL.');
                }

                const isVideo = publicUrls[0].match(/\.(mp4|mov|webm)$/i);

                // Single step publish for Stories via photo or video URL
                const endpoint = isVideo ? `${FB_GRAPH_URL}/${pageId}/video_stories` : `${FB_GRAPH_URL}/${pageId}/photo_stories`;
                const payload = isVideo ? { video_url: publicUrls[0] } : { photo_url: publicUrls[0] };

                response = await axios.post(`${endpoint}?access_token=${accessToken}`, payload);

                logger.info(`Facebook Story published by user ${userId} on page ${pageId}. Story ID: ${response.data.id}`);
                return { postId: response.data.id, success: true };
            }

            // Post Type: STANDARD POST
            if (images && images.length > 0) {
                const img = images[0];
                const isVideo = img.mimeType?.startsWith('video/') || img.mimetype?.startsWith('video/');
                const endpoint = isVideo ? `${FB_GRAPH_URL}/${pageId}/videos` : `${FB_GRAPH_URL}/${pageId}/photos`;

                const formData = new FormData();
                formData.append(isVideo ? 'description' : 'message', text || '');
                formData.append('source', img.data, {
                    filename: isVideo ? 'upload.mp4' : 'upload.jpg',
                    contentType: img.mimeType || (isVideo ? 'video/mp4' : 'image/jpeg')
                });

                response = await axios.post(`${endpoint}?access_token=${accessToken}`, formData, {
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

    /**
     * Internal: Polling for Facebook Video Processing
     */
    async _waitForReelProcessing(videoId, accessToken, maxWaitSeconds = 60) {
        const startTime = Date.now();
        const pollInterval = 3000;

        while ((Date.now() - startTime) < maxWaitSeconds * 1000) {
            try {
                // Check video status
                const res = await axios.get(`${FB_GRAPH_URL}/${videoId}?fields=status&access_token=${accessToken}`);
                const statusObj = res.data?.status;

                if (!statusObj) {
                    await new Promise(resolve => setTimeout(resolve, pollInterval));
                    continue;
                }

                const videoStatus = statusObj.video_status;
                const processingPhase = statusObj.processing_phase?.status;

                // 'ready' means processing is complete
                if (videoStatus === 'ready' || processingPhase === 'complete') {
                    return true;
                }

                if (videoStatus === 'error' || processingPhase === 'error') {
                    throw new Error('Facebook media processing failed on their servers.');
                }
            } catch (err) {
                if (err.response && err.response.data && err.response.data.error) {
                    logger.warn(`Polling FB Reel status error: ${err.response.data.error.message}`);
                }
            }
            await new Promise(resolve => setTimeout(resolve, pollInterval));
        }

        throw new Error('Facebook Reel processing timed out. Video may be too large or invalid format.');
    }

    /**
     * Auto-detect Instagram Business Account linked to a Facebook Page
     * Saves it as a separate 'instagram' platform entry
     */
    async _detectInstagramAccount(pageId, pageAccessToken, pageAvatar, userId) {
        // Fetch Instagram Business Account ID linked to the Page
        const igRes = await axios.get(`${FB_GRAPH_URL}/${pageId}`, {
            params: {
                fields: 'instagram_business_account',
                access_token: pageAccessToken
            }
        });

        const igAccountId = igRes.data?.instagram_business_account?.id;
        if (!igAccountId) {
            console.error('[FB DEBUG] Instagram check result: no instagram_business_account on page', JSON.stringify(igRes.data));
            throw new Error('No Instagram Business Account linked to this Page.');
        }
        console.error(`[FB DEBUG] Found Instagram Business Account ID: ${igAccountId}`);

        // Fetch Instagram profile info
        const igProfileRes = await axios.get(`${FB_GRAPH_URL}/${igAccountId}`, {
            params: {
                fields: 'id,username,name,profile_picture_url,followers_count',
                access_token: pageAccessToken
            }
        });

        const igProfile = igProfileRes.data;
        const igUsername = igProfile.username || igProfile.name || igAccountId;
        const igAvatar = igProfile.profile_picture_url || pageAvatar;
        const encryptedToken = encrypt(pageAccessToken);

        // Check if this Instagram account already exists
        const existing = await query(
            `SELECT id FROM social_accounts WHERE user_id = ? AND platform = 'instagram' AND account_id = ?`,
            [userId, String(igAccountId)]
        );

        if (existing.length > 0) {
            await query(
                `UPDATE social_accounts SET
                 account_name = ?, account_username = ?, account_avatar = ?,
                 access_token = ?, is_active = 1, updated_at = NOW()
                 WHERE id = ?`,
                [igProfile.name || igUsername, `@${igUsername}`, igAvatar, encryptedToken, existing[0].id]
            );
            logger.info(`Instagram reconnected: @${igUsername} for user ${userId}`);
            return { id: existing[0].id, reconnected: true, username: igUsername, avatar: igAvatar };
        }

        // Insert new Instagram account
        const result = await query(
            `INSERT INTO social_accounts
             (user_id, platform, account_id, account_name, account_username, account_avatar,
              access_token, is_active, connected_at)
             VALUES (?, 'instagram', ?, ?, ?, ?, ?, 1, NOW())`,
            [userId, String(igAccountId), igProfile.name || igUsername, `@${igUsername}`, igAvatar, encryptedToken]
        );

        logger.info(`Instagram connected: @${igUsername} for user ${userId}`);
        return {
            id: result.insertId,
            igAccountId,
            username: igUsername,
            avatar: igAvatar,
            reconnected: false
        };
    }
}

module.exports = new FacebookService();
