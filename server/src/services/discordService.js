/**
 * Discord Service
 * Handles Discord Webhook integration for channel posting
 * 
 * How it works:
 * 1. User creates a Webhook in their Discord channel settings
 * 2. User provides the webhook URL to SocialMRT
 * 3. We use the webhook to post messages, embeds, and images
 * 
 * No bot needed, no OAuth - just a simple webhook URL!
 */

const { logger } = require('../utils/logger');
const { query } = require('../config/database');
const crypto = require('crypto');

// Encryption (same as telegramService)
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

class DiscordService {

    /**
     * Connect a Discord webhook
     * @param {string} webhookUrl - Discord webhook URL
     * @param {string} channelName - Friendly name for the channel
     * @param {number} userId - SocialMRT user ID
     */
    async connect(webhookUrl, channelName, userId) {
        try {
            // Validate webhook URL format
            const webhookRegex = /^https:\/\/(discord\.com|discordapp\.com)\/api\/webhooks\/\d+\/.+$/;
            if (!webhookRegex.test(webhookUrl)) {
                throw new Error('Invalid Discord webhook URL format.');
            }

            // Validate by fetching webhook info
            const response = await fetch(webhookUrl);
            if (!response.ok) {
                throw new Error('Invalid webhook URL. Please check and try again.');
            }
            const webhookInfo = await response.json();

            const serverName = webhookInfo.guild_id ? `Server ${webhookInfo.guild_id}` : 'Discord';
            const webhookName = webhookInfo.name || 'Webhook';
            const displayName = channelName || webhookName;

            // Extract webhook ID for unique identification
            const webhookId = webhookUrl.split('/webhooks/')[1].split('/')[0];

            // Encrypt the webhook URL
            const encryptedUrl = encrypt(webhookUrl);

            // Check if already connected
            const existing = await query(
                `SELECT id FROM social_accounts 
                 WHERE user_id = ? AND platform = 'discord' AND account_id = ?`,
                [userId, webhookId]
            );

            if (existing.length > 0) {
                await query(
                    `UPDATE social_accounts SET 
                     account_name = ?, access_token = ?, is_active = 1, updated_at = NOW()
                     WHERE id = ?`,
                    [displayName, encryptedUrl, existing[0].id]
                );
                return {
                    id: existing[0].id,
                    reconnected: true,
                    name: displayName,
                    webhookName
                };
            }

            // Insert new account
            const result = await query(
                `INSERT INTO social_accounts 
                 (user_id, platform, account_id, account_name, account_username, 
                  access_token, is_active, connected_at)
                 VALUES (?, 'discord', ?, ?, ?, ?, 1, NOW())`,
                [userId, webhookId, displayName, webhookName, encryptedUrl]
            );

            logger.info(`Discord connected: ${displayName} for user ${userId}`);

            return {
                id: result.insertId,
                name: displayName,
                webhookName,
                reconnected: false
            };

        } catch (error) {
            logger.error('Discord connection failed:', error.message);
            throw new Error(`Failed to connect Discord: ${error.message}`);
        }
    }

    /**
     * Send a message to Discord via webhook
     */
    async sendMessage(accountId, userId, content, options = {}) {
        const account = await this._getAccount(accountId, userId);
        const webhookUrl = decrypt(account.access_token);

        if (!webhookUrl) {
            throw new Error('Failed to decrypt webhook URL. Please reconnect.');
        }

        try {
            const payload = {
                content: content.substring(0, 2000), // Discord 2000 char limit
                username: options.username || 'SocialMRT',
                avatar_url: options.avatarUrl || undefined
            };

            // Add embed if provided
            if (options.embed) {
                payload.embeds = [options.embed];
            }

            const response = await fetch(webhookUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `HTTP ${response.status}`);
            }

            logger.info(`Discord message sent to ${account.account_name}`);
            return { success: true };

        } catch (error) {
            logger.error('Discord send failed:', error.message);
            throw new Error(`Failed to send Discord message: ${error.message}`);
        }
    }

    /**
     * Send a rich embed message
     */
    async sendEmbed(accountId, userId, embedData) {
        const account = await this._getAccount(accountId, userId);
        const webhookUrl = decrypt(account.access_token);

        const payload = {
            username: 'SocialMRT',
            embeds: [{
                title: embedData.title || '',
                description: embedData.description || '',
                color: embedData.color || 5814783, // Purple default
                thumbnail: embedData.thumbnail ? { url: embedData.thumbnail } : undefined,
                image: embedData.image ? { url: embedData.image } : undefined,
                footer: { text: 'Posted via SocialMRT' },
                timestamp: new Date().toISOString()
            }]
        };

        const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error(`Discord embed failed: HTTP ${response.status}`);
        }

        return { success: true };
    }

    /**
     * Send image via webhook using multipart/form-data
     */
    async sendImage(accountId, userId, imageBuffer, caption = '') {
        const account = await this._getAccount(accountId, userId);
        const webhookUrl = decrypt(account.access_token);

        try {
            const FormData = (await import('node-fetch')).FormData || globalThis.FormData;

            // Use built-in FormData (Node 18+)
            const formData = new FormData();

            // Create a Blob from the buffer
            const blob = new Blob([imageBuffer], { type: 'image/png' });
            formData.append('file', blob, 'image.png');

            if (caption) {
                formData.append('payload_json', JSON.stringify({
                    content: caption.substring(0, 2000),
                    username: 'SocialMRT'
                }));
            }

            const response = await fetch(webhookUrl, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            return { success: true };
        } catch (error) {
            throw new Error(`Failed to send image: ${error.message}`);
        }
    }

    /**
     * Disconnect Discord webhook
     */
    async disconnect(accountId, userId) {
        await query(
            `UPDATE social_accounts SET is_active = 0, updated_at = NOW() 
             WHERE id = ? AND user_id = ? AND platform = 'discord'`,
            [accountId, userId]
        );
        logger.info(`Discord account ${accountId} disconnected for user ${userId}`);
        return { success: true };
    }

    /**
     * Get account from DB
     */
    async _getAccount(accountId, userId) {
        const accounts = await query(
            `SELECT * FROM social_accounts 
             WHERE id = ? AND user_id = ? AND platform = 'discord' AND is_active = 1`,
            [accountId, userId]
        );

        if (!accounts.length) {
            throw new Error('Discord account not found or disconnected.');
        }

        return accounts[0];
    }
}

module.exports = new DiscordService();
