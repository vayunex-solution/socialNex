/**
 * Holiday Reminder Service
 * Runs via cron twice daily (9 AM & 5 PM IST).
 * Checks for holidays in 3 days, then emails users who haven't scheduled a post for that date.
 *
 * Public Holiday API used: https://date.nager.at/api/v3/PublicHolidays/{year}/{countryCode}
 * It's completely free — no API key required.
 */

const cron = require('node-cron');
const https = require('https');
const { query } = require('../config/database');
const { sendHolidayReminder } = require('./emailAlertService');
const { logger } = require('../utils/logger');

// In-memory cache: { "IN-2026": [...holidays] }
const holidayCache = {};

/**
 * Fetch holidays for a country (cached by year)
 * @param {string} countryCode - ISO 3166-1 alpha-2 (e.g., 'IN', 'US')
 * @param {number} year
 */
function fetchHolidays(countryCode, year) {
    const cacheKey = `${countryCode}-${year}`;
    if (holidayCache[cacheKey]) return Promise.resolve(holidayCache[cacheKey]);

    return new Promise((resolve) => {
        const url = `https://date.nager.at/api/v3/PublicHolidays/${year}/${countryCode}`;
        https.get(url, (res) => {
            let data = '';
            res.on('data', (chunk) => (data += chunk));
            res.on('end', () => {
                try {
                    const holidays = JSON.parse(data);
                    holidayCache[cacheKey] = holidays;
                    resolve(holidays);
                } catch {
                    resolve([]);
                }
            });
        }).on('error', () => resolve([]));
    });
}

/**
 * Get holidays 3 days from now for a set of country codes
 */
async function getUpcomingHolidays(targetDate, countryCodes) {
    const year = targetDate.getFullYear();
    const targetStr = targetDate.toISOString().split('T')[0]; // YYYY-MM-DD

    const results = [];
    for (const code of countryCodes) {
        const holidays = await fetchHolidays(code, year);
        for (const h of holidays) {
            if (h.date === targetStr) {
                results.push({ name: h.localName || h.name, date: targetStr, countryCode: code });
            }
        }
    }
    return results;
}

/**
 * Check if a user has already scheduled a post for the given date
 */
async function hasScheduledPostForDate(userId, date) {
    const rows = await query(
        `SELECT id FROM scheduled_posts
         WHERE user_id = ? AND DATE(scheduled_at) = ? AND status IN ('scheduled', 'publishing', 'published')
         LIMIT 1`,
        [userId, date]
    );
    return rows.length > 0;
}

/**
 * Main job logic
 */
async function runHolidayReminderJob() {
    logger.info('🎊 Holiday Reminder Job: Starting...');

    // 3 days from now (IST)
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + 3);
    const targetStr = targetDate.toISOString().split('T')[0];

    try {
        // Fetch holidays for India + Global (USA as global proxy)
        const holidays = await getUpcomingHolidays(targetDate, ['IN', 'US']);

        if (!holidays.length) {
            logger.info(`🎊 Holiday Reminder: No holidays on ${targetStr}. Skipping.`);
            return;
        }

        logger.info(`🎊 Found ${holidays.length} holiday(s) on ${targetStr}: ${holidays.map(h => h.name).join(', ')}`);

        // Get all users who have reminders enabled and have accounts
        const users = await query(
            `SELECT u.id
             FROM users u
             LEFT JOIN notification_settings ns ON ns.user_id = u.id
             WHERE u.is_active = 1
               AND u.is_verified = 1
               AND (ns.master_toggle IS NULL OR ns.master_toggle = 1)
               AND (ns.email_marketing_reminders IS NULL OR ns.email_marketing_reminders = 1)`
        );

        let sent = 0;
        for (const user of users) {
            const alreadyScheduled = await hasScheduledPostForDate(user.id, targetStr);
            if (!alreadyScheduled) {
                // Send for the first holiday found (most relevant)
                const holiday = holidays[0];
                await sendHolidayReminder(user.id, holiday.name, holiday.date);
                sent++;
            }
        }

        logger.info(`🎊 Holiday Reminder Job complete. Sent ${sent} reminders out of ${users.length} users.`);
    } catch (err) {
        logger.error('🎊 Holiday Reminder Job failed:', err.message);
    }
}

/**
 * Start the cron jobs
 * Runs at 9:00 AM and 5:00 PM IST (UTC+5:30 → 03:30 and 11:30 UTC)
 */
function startHolidayReminder() {
    // 9:00 AM IST = 03:30 UTC
    cron.schedule('30 3 * * *', () => {
        runHolidayReminderJob();
    }, { timezone: 'Asia/Kolkata' });

    // 5:00 PM IST = 11:30 UTC
    cron.schedule('30 11 * * *', () => {
        runHolidayReminderJob();
    }, { timezone: 'Asia/Kolkata' });

    logger.info('🎊 Holiday Reminder Cron: scheduled at 9:00 AM and 5:00 PM IST');
}

module.exports = { startHolidayReminder, runHolidayReminderJob };
