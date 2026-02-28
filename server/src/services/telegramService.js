/**
 * Telegram Service
 * Handles Telegram Bot API integration for channel/group posting
 * 
 * How it works:
 * 1. User creates a bot via @BotFather on Telegram
 * 2. User adds the bot as admin to their channel/group
 * 3. User provides bot token + chat_id to connect
 * 4. We use the bot to post messages to the channel/group
 */

const TelegramBot = require('node-telegram-bot-api');
const { logger } = require('../utils/logger');
const { query } = require('../config/database');
const crypto = require('crypto');

// Encryption
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
        logger.error('Decryption failed:', error.message);
        return null;
    }
}

class TelegramService {

    /**
     * Connect a Telegram bot + channel
     * @param {string} botToken - Bot token from @BotFather
     * @param {string} chatId - Channel/group chat ID (e.g., @channelname or -1001234567890)
     * @param {number} userId - SocialNex user ID
     */
    async connect(botToken, chatId, userId) {
        try {
            // Validate bot token by getting bot info
            const bot = new TelegramBot(botToken, { polling: false });
            const botInfo = await bot.getMe();

            // Auto-detect if no chatId provided
            if (!chatId) {
                const updates = await bot.getUpdates({ limit: 100 });
                for (const update of updates) {
                    const chat = update.channel_post?.chat || update.message?.chat || update.my_chat_member?.chat;
                    if (chat && (chat.type === 'channel' || chat.type === 'supergroup' || chat.type === 'group')) {
                        chatId = chat.id;
                        break;
                    }
                }
                if (!chatId) {
                    throw new Error('Channel/Group not found. Please add the bot as Admin to your channel/group AND send a test message (e.g. "hello") in it, then click Connect again.');
                }
            }

            // Validate chat by getting chat info
            let chatInfo;
            try {
                chatInfo = await bot.getChat(chatId);
            } catch (chatError) {
                throw new Error('Bot cannot access this chat. Make sure the bot is added as admin to the channel/group.');
            }

            const chatTitle = chatInfo.title || chatInfo.username || chatId;
            const chatType = chatInfo.type; // 'channel', 'group', 'supergroup'

            // Encrypt bot token
            const encryptedToken = encrypt(botToken);

            // Check if already connected
            const existing = await query(
                `SELECT id FROM social_accounts 
                 WHERE user_id = ? AND platform = 'telegram' AND account_id = ?`,
                [userId, String(chatId)]
            );

            if (existing.length > 0) {
                await query(
                    `UPDATE social_accounts SET 
                     account_name = ?, account_username = ?, 
                     access_token = ?, is_active = 1, updated_at = NOW()
                     WHERE id = ?`,
                    [chatTitle, `@${botInfo.username}`, encryptedToken, existing[0].id]
                );
                return {
                    id: existing[0].id,
                    reconnected: true,
                    botName: botInfo.first_name,
                    chatTitle,
                    chatType
                };
            }

            // Insert new account
            const result = await query(
                `INSERT INTO social_accounts 
                 (user_id, platform, account_id, account_name, account_username, 
                  access_token, refresh_token, is_active, connected_at)
                 VALUES (?, 'telegram', ?, ?, ?, ?, ?, 1, NOW())`,
                [
                    userId,
                    String(chatId),
                    chatTitle,
                    `@${botInfo.username}`,
                    encryptedToken,
                    encrypt(chatType) // Store chat type in refresh_token field
                ]
            );

            logger.info(`Telegram connected: ${chatTitle} via bot @${botInfo.username} for user ${userId}`);

            return {
                id: result.insertId,
                botName: botInfo.first_name,
                botUsername: botInfo.username,
                chatTitle,
                chatType,
                reconnected: false
            };

        } catch (error) {
            logger.error('Telegram connection failed:', error.message);

            if (error.message.includes('401') || error.message.includes('Unauthorized')) {
                throw new Error('Invalid bot token. Please check your token from @BotFather.');
            }
            if (error.message.includes('chat not found') || error.message.includes('403')) {
                throw new Error('Bot cannot access this chat. Make sure the bot is added as admin to the channel/group.');
            }

            throw new Error(`Failed to connect Telegram: ${error.message}`);
        }
    }

    /**
     * Send a message to a Telegram channel/group
     */
    async sendMessage(accountId, userId, text, options = {}) {
        const account = await this._getAccount(accountId, userId);
        const botToken = decrypt(account.access_token);

        if (!botToken) {
            throw new Error('Failed to decrypt bot token. Please reconnect.');
        }

        const bot = new TelegramBot(botToken, { polling: false });

        try {
            const msgOptions = {
                parse_mode: options.parseMode || 'HTML',
                disable_web_page_preview: options.disablePreview || false
            };

            const result = await bot.sendMessage(account.account_id, text, msgOptions);

            logger.info(`Telegram message sent to ${account.account_name}`);

            return {
                messageId: result.message_id,
                chatId: result.chat.id,
                success: true
            };

        } catch (error) {
            logger.error('Telegram send failed:', error.message);
            throw new Error(`Failed to send message: ${error.message}`);
        }
    }

    /**
 * Send a photo with caption
 * @param {number} accountId 
 * @param {number} userId 
 * @param {Buffer|string} photo - Buffer from multer upload or URL string
 * @param {string} caption 
 */
    async sendPhoto(accountId, userId, photo, caption = '') {
        const account = await this._getAccount(accountId, userId);
        const botToken = decrypt(account.access_token);
        const bot = new TelegramBot(botToken, { polling: false });

        try {
            let result;

            if (Buffer.isBuffer(photo)) {
                // Send Buffer as a stream upload
                result = await bot.sendPhoto(account.account_id, photo, {
                    caption,
                    parse_mode: 'HTML'
                }, {
                    filename: 'image.jpg',
                    contentType: 'image/jpeg'
                });
            } else {
                // Send URL directly
                result = await bot.sendPhoto(account.account_id, photo, {
                    caption,
                    parse_mode: 'HTML'
                });
            }

            return { messageId: result.message_id, success: true };
        } catch (error) {
            throw new Error(`Failed to send photo: ${error.message}`);
        }
    }
    /**
     * Delete a message
     */
    async deleteMessage(accountId, userId, messageId) {
        const account = await this._getAccount(accountId, userId);
        const botToken = decrypt(account.access_token);
        const bot = new TelegramBot(botToken, { polling: false });

        try {
            await bot.deleteMessage(account.account_id, messageId);
            return { success: true };
        } catch (error) {
            throw new Error(`Failed to delete message: ${error.message}`);
        }
    }

    /**
     * Get chat/channel info
     */
    async getChatInfo(accountId, userId) {
        const account = await this._getAccount(accountId, userId);
        const botToken = decrypt(account.access_token);
        const bot = new TelegramBot(botToken, { polling: false });

        try {
            const chat = await bot.getChat(account.account_id);
            const memberCount = await bot.getChatMemberCount(account.account_id);

            return {
                id: chat.id,
                title: chat.title,
                type: chat.type,
                description: chat.description || '',
                memberCount,
                username: chat.username || null
            };
        } catch (error) {
            throw new Error(`Failed to get chat info: ${error.message}`);
        }
    }

    /**
     * Disconnect Telegram account
     */
    async disconnect(accountId, userId) {
        await query(
            `UPDATE social_accounts SET is_active = 0, updated_at = NOW() 
             WHERE id = ? AND user_id = ? AND platform = 'telegram'`,
            [accountId, userId]
        );
        logger.info(`Telegram account ${accountId} disconnected for user ${userId}`);
        return { success: true };
    }

    /**
     * Get account from DB
     */
    async _getAccount(accountId, userId) {
        const accounts = await query(
            `SELECT * FROM social_accounts 
             WHERE id = ? AND user_id = ? AND platform = 'telegram' AND is_active = 1`,
            [accountId, userId]
        );

        if (!accounts.length) {
            throw new Error('Telegram account not found or disconnected.');
        }

        return accounts[0];
    }
}

module.exports = new TelegramService();
