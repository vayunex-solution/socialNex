/**
 * Email Alert Service
 * Sends themed HTML alerts using the existing Nodemailer transporter.
 * All methods check notification_settings before sending anything.
 */

const { query } = require('../config/database');
const emailService = require('./emailService');
const { logger } = require('../utils/logger');

/**
 * Get the effective email to send alerts to for a user.
 * Uses alert_email if set, otherwise falls back to the user's registration email.
 */
async function getAlertEmail(userId) {
    const rows = await query(
        `SELECT u.email AS regEmail, ns.alert_email, ns.master_toggle
         FROM users u
         LEFT JOIN notification_settings ns ON ns.user_id = u.id
         WHERE u.id = ?`,
        [userId]
    );
    if (!rows.length) return null;
    const row = rows[0];
    if (!row.master_toggle) return null; // Master switch OFF
    return row.alert_email || row.regEmail;
}

/**
 * Bootstrap HTML email with SocialNex branding (dark theme)
 */
function buildHtml(title, bodyContent) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background:#0F0F1A;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="min-height:100vh;">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <table width="600" cellpadding="0" cellspacing="0" role="presentation"
               style="max-width:600px;width:100%;background:#1A1A2E;border-radius:16px;overflow:hidden;border:1px solid rgba(99,102,241,0.2);box-shadow:0 20px 60px rgba(0,0,0,0.4);">
          
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#6366F1 0%,#8B5CF6 50%,#EC4899 100%);padding:32px 40px;">
              <h1 style="margin:0;font-size:24px;font-weight:700;color:#fff;letter-spacing:-0.5px;">⚡ SocialNex</h1>
              <p style="margin:6px 0 0;font-size:14px;color:rgba(255,255,255,0.75);">Your Social Media Command Centre</p>
            </td>
          </tr>
          
          <!-- Body -->
          <tr>
            <td style="padding:36px 40px;color:#B8B8D1;font-size:15px;line-height:1.7;">
              ${bodyContent}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 40px 32px;border-top:1px solid rgba(255,255,255,0.05);">
              <p style="margin:0;font-size:12px;color:#6B6B80;text-align:center;">
                You're receiving this because you enabled notifications on SocialNex.<br>
                <a href="${process.env.FRONTEND_URL}/settings" style="color:#818CF8;text-decoration:none;">Manage Notification Preferences</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/**
 * Send a Login Success alert email
 */
async function sendLoginSuccessAlert(userId, ip, userAgent) {
    try {
        const rows = await query(
            `SELECT u.full_name, u.email AS regEmail, ns.alert_email, ns.master_toggle, ns.email_on_login_success
             FROM users u LEFT JOIN notification_settings ns ON ns.user_id = u.id
             WHERE u.id = ?`, [userId]
        );
        if (!rows.length || !rows[0].master_toggle || !rows[0].email_on_login_success) return;
        const { full_name, regEmail, alert_email } = rows[0];
        const to = alert_email || regEmail;
        const time = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

        const html = buildHtml('Login Alert - SocialNex', `
            <p style="color:#FFFFFF;font-size:20px;font-weight:600;margin:0 0 16px;">🔐 New Login Detected</p>
            <p>Hi <strong style="color:#fff;">${full_name}</strong>,</p>
            <p>Your SocialNex account was just logged into. If this was you, no action is needed.</p>
            <table style="width:100%;margin:24px 0;background:rgba(99,102,241,0.08);border-radius:12px;border:1px solid rgba(99,102,241,0.2);border-collapse:collapse;">
              <tr><td style="padding:14px 20px;border-bottom:1px solid rgba(255,255,255,0.05);color:#818CF8;font-weight:600;font-size:12px;text-transform:uppercase;letter-spacing:0.08em;width:120px;">Time</td><td style="padding:14px 20px;border-bottom:1px solid rgba(255,255,255,0.05);color:#fff;">${time} IST</td></tr>
              <tr><td style="padding:14px 20px;border-bottom:1px solid rgba(255,255,255,0.05);color:#818CF8;font-weight:600;font-size:12px;text-transform:uppercase;letter-spacing:0.08em;">IP Address</td><td style="padding:14px 20px;border-bottom:1px solid rgba(255,255,255,0.05);color:#fff;">${ip || 'Unknown'}</td></tr>
              <tr><td style="padding:14px 20px;color:#818CF8;font-weight:600;font-size:12px;text-transform:uppercase;letter-spacing:0.08em;">Device</td><td style="padding:14px 20px;color:#fff;">${userAgent ? userAgent.substring(0, 80) : 'Unknown'}</td></tr>
            </table>
            <p>If this wasn't you, please <a href="${process.env.FRONTEND_URL}/settings" style="color:#EC4899;text-decoration:none;">change your password immediately</a>.</p>
        `);

        await emailService.sendMail({ to, subject: '🔐 New Login Detected - SocialNex', html });
        logger.info(`Login success alert sent to ${to}`);
    } catch (err) {
        logger.warn('emailAlertService.sendLoginSuccessAlert failed:', err.message);
    }
}

/**
 * Send a Login Failed alert email
 */
async function sendLoginFailAlert(email) {
    try {
        const rows = await query(
            `SELECT u.id, u.full_name, ns.alert_email, ns.master_toggle, ns.email_on_login_fail
             FROM users u LEFT JOIN notification_settings ns ON ns.user_id = u.id
             WHERE u.email = ?`, [email]
        );
        if (!rows.length || !rows[0].master_toggle || !rows[0].email_on_login_fail) return;
        const { full_name, alert_email } = rows[0];
        const to = alert_email || email;
        const time = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

        const html = buildHtml('Failed Login Attempt - SocialNex', `
            <p style="color:#FFFFFF;font-size:20px;font-weight:600;margin:0 0 16px;">⚠️ Failed Login Attempt</p>
            <p>Hi <strong style="color:#fff;">${full_name}</strong>,</p>
            <p>Someone tried to log into your SocialNex account with an <strong style="color:#F87171;">incorrect password</strong> at <strong style="color:#fff;">${time} IST</strong>.</p>
            <p style="margin:24px 0;">If this was you, just ignore this email. If not, we recommend:</p>
            <ul style="padding-left:20px;color:#B8B8D1;">
              <li style="margin-bottom:8px;">Change your password immediately</li>
              <li style="margin-bottom:8px;">Enable two-factor authentication</li>
              <li>Check your connected accounts</li>
            </ul>
            <a href="${process.env.FRONTEND_URL}/settings" style="display:inline-block;margin-top:16px;padding:12px 28px;background:linear-gradient(135deg,#6366F1,#EC4899);color:#fff;text-decoration:none;border-radius:10px;font-weight:700;font-size:14px;">Secure My Account →</a>
        `);

        await emailService.sendMail({ to, subject: '⚠️ Failed Login Attempt - SocialNex', html });
        logger.info(`Login fail alert sent to ${to}`);
    } catch (err) {
        logger.warn('emailAlertService.sendLoginFailAlert failed:', err.message);
    }
}

/**
 * Send a Post Published Failed alert email
 */
async function sendPostFailAlert(userId, platform, postContent, errorMsg) {
    try {
        const rows = await query(
            `SELECT u.full_name, u.email AS regEmail, ns.alert_email, ns.master_toggle, ns.email_on_post_fail
             FROM users u LEFT JOIN notification_settings ns ON ns.user_id = u.id
             WHERE u.id = ?`, [userId]
        );
        if (!rows.length || !rows[0].master_toggle || !rows[0].email_on_post_fail) return;
        const { full_name, regEmail, alert_email } = rows[0];
        const to = alert_email || regEmail;
        const preview = postContent ? postContent.substring(0, 120) + (postContent.length > 120 ? '...' : '') : '(no content)';

        const html = buildHtml('Post Failed - SocialNex', `
            <p style="color:#FFFFFF;font-size:20px;font-weight:600;margin:0 0 16px;">❌ Scheduled Post Failed</p>
            <p>Hi <strong style="color:#fff;">${full_name}</strong>,</p>
            <p>One of your scheduled posts failed to publish on <strong style="color:#F87171;">${platform}</strong>.</p>
            <div style="margin:24px 0;padding:20px;background:rgba(239,68,68,0.08);border:1px solid rgba(239,68,68,0.2);border-radius:12px;">
              <p style="margin:0 0 8px;font-size:12px;color:#F87171;text-transform:uppercase;letter-spacing:0.08em;font-weight:700;">Post Preview</p>
              <p style="margin:0;color:#B8B8D1;font-style:italic;">"${preview}"</p>
              ${errorMsg ? `<p style="margin:12px 0 0;font-size:12px;color:#9CA3AF;"><strong>Error:</strong> ${errorMsg}</p>` : ''}
            </div>
            <p>This might be because your <strong style="color:#fff;">${platform}</strong> access token has expired. Please reconnect your account.</p>
            <a href="${process.env.FRONTEND_URL}/dashboard" style="display:inline-block;margin-top:8px;padding:12px 28px;background:linear-gradient(135deg,#6366F1,#EC4899);color:#fff;text-decoration:none;border-radius:10px;font-weight:700;font-size:14px;">Go to Dashboard →</a>
        `);

        await emailService.sendMail({ to, subject: `❌ Post Failed on ${platform} - SocialNex`, html });
        logger.info(`Post fail alert sent to ${to}`);
    } catch (err) {
        logger.warn('emailAlertService.sendPostFailAlert failed:', err.message);
    }
}

/**
 * Send a Holiday Reminder email
 */
async function sendHolidayReminder(userId, holidayName, date) {
    try {
        const rows = await query(
            `SELECT u.full_name, u.email AS regEmail, ns.alert_email, ns.master_toggle, ns.email_marketing_reminders
             FROM users u LEFT JOIN notification_settings ns ON ns.user_id = u.id
             WHERE u.id = ?`, [userId]
        );
        if (!rows.length || !rows[0].master_toggle || !rows[0].email_marketing_reminders) return;
        const { full_name, regEmail, alert_email } = rows[0];
        const to = alert_email || regEmail;
        const dateStr = new Date(date).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' });

        const html = buildHtml(`${holidayName} Reminder - SocialNex`, `
            <p style="color:#FFFFFF;font-size:20px;font-weight:600;margin:0 0 16px;">🎊 ${holidayName} is 3 Days Away!</p>
            <p>Hi <strong style="color:#fff;">${full_name}</strong>,</p>
            <p>Don't miss the chance to connect with your audience this <strong style="color:#A78BFA;">${holidayName}</strong> on <strong style="color:#fff;">${dateStr}</strong>!</p>
            <div style="margin:28px 0;padding:24px;background:linear-gradient(135deg,rgba(99,102,241,0.1),rgba(236,72,153,0.1));border:1px solid rgba(139,92,246,0.3);border-radius:16px;text-align:center;">
              <p style="margin:0 0 8px;font-size:40px;">🗓️</p>
              <p style="margin:0;font-size:22px;font-weight:700;color:#fff;">${holidayName}</p>
              <p style="margin:4px 0 0;font-size:14px;color:#A78BFA;">${dateStr}</p>
            </div>
            <p>Holiday posts get <strong style="color:#34D399;">3x more engagement</strong> than regular posts. Schedule yours now and stand out!</p>
            <a href="${process.env.FRONTEND_URL}/scheduler" style="display:inline-block;margin-top:16px;padding:14px 32px;background:linear-gradient(135deg,#6366F1,#8B5CF6,#EC4899);color:#fff;text-decoration:none;border-radius:12px;font-weight:700;font-size:15px;letter-spacing:0.02em;">Schedule a Post Now →</a>
            <p style="margin-top:28px;font-size:12px;color:#6B6B80;">You won't receive this reminder again if you've already scheduled a post for this date.</p>
        `);

        await emailService.sendMail({ to, subject: `🎊 ${holidayName} is in 3 days! Schedule your post now`, html });
        logger.info(`Holiday reminder (${holidayName}) sent to ${to}`);
    } catch (err) {
        logger.warn('emailAlertService.sendHolidayReminder failed:', err.message);
    }
}

module.exports = {
    sendLoginSuccessAlert,
    sendLoginFailAlert,
    sendPostFailAlert,
    sendHolidayReminder,
};
