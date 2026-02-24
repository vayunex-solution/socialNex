'use strict';
const emailService = require('./emailService');
const { query } = require('../config/database');
const logger = require('../utils/logger');

/**
 * Helper – resolve alert email from DB, respecting master_toggle
 */
async function resolveAlertEmail(userId, toggleColumn) {
  const rows = await query(
    `SELECT u.full_name, u.email AS regEmail,
                ns.alert_email, ns.master_toggle, ns.${toggleColumn}
         FROM users u
         LEFT JOIN notification_settings ns ON ns.user_id = u.id
         WHERE u.id = ?`,
    [userId]
  );
  if (!rows.length) return null;
  const row = rows[0];
  if (!row.master_toggle) return null;
  if (!row[toggleColumn]) return null;
  return {
    to: row.alert_email || row.regEmail,
    name: row.full_name || 'there',
  };
}

/* ─────────────────────────────────────────────────────────────────
   Base HTML Builder – World-Class Premium Dark Email
   ──────────────────────────────────────────────────────────────── */
function buildHtml({ title, preheader, accentColor = '#6366F1', body }) {
  const APP_URL = process.env.FRONTEND_URL || 'https://socialnex.vayunexsolution.com';

  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta charset="UTF-8">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="format-detection" content="telephone=no">
<title>${title}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
  /* Reset */
  * { box-sizing: border-box; }
  body { margin: 0 !important; padding: 0 !important; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
  img { border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
  table { border-collapse: collapse !important; }
  /* Utility */
  .wrap { max-width: 600px; margin: 0 auto; }
  /* Mobile */
  @media only screen and (max-width: 620px) {
    .wrap { width: 100% !important; }
    .pad { padding: 28px 20px !important; }
    .pad-sm { padding: 20px !important; }
    .hero-icon { width: 64px !important; height: 64px !important; font-size: 28px !important; }
    .hero-title { font-size: 24px !important; line-height: 1.3 !important; }
    .btn { padding: 14px 28px !important; font-size: 15px !important; }
    .stat-wrap td { display: block !important; width: 100% !important; border-right: none !important; padding: 12px 16px !important; border-bottom: 1px solid rgba(255,255,255,0.06) !important; }
    .stat-wrap td:last-child { border-bottom: none !important; }
    .feat-col { display: block !important; width: 100% !important; padding: 16px !important; margin-bottom: 10px !important; }
    .feat-spacer { display: none !important; width: 0 !important; }
  }
</style>
</head>
<body style="background-color:#08080F;font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;margin:0;padding:0;">

<!-- Preheader (hidden) -->
<div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">${preheader || title}&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;</div>

<!-- Background wrapper -->
<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color:#08080F;background-image:radial-gradient(ellipse 80% 50% at 50% -20%, rgba(99,102,241,0.18), transparent);min-height:100vh;">
<tr><td align="center" style="padding:48px 12px 60px;">

  <!-- Logo area -->
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" class="wrap" style="margin-bottom:24px;">
    <tr>
      <td align="center">
        <a href="${APP_URL}" style="text-decoration:none;display:inline-block;">
          <table role="presentation" cellspacing="0" cellpadding="0" border="0">
            <tr>
              <td style="padding:10px 18px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:12px;">
                <span style="font-size:15px;font-weight:700;color:#fff;letter-spacing:-0.3px;">
                  &#9889;&nbsp;Social<span style="color:${accentColor};">Nex</span>
                </span>
              </td>
            </tr>
          </table>
        </a>
      </td>
    </tr>
  </table>

  <!-- Main card -->
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" class="wrap" style="background:#0E0E1A;border-radius:20px;border:1px solid rgba(255,255,255,0.07);overflow:hidden;">

    <!-- Body content -->
    <tr>
      <td class="pad" style="padding:40px 44px;">
        ${body}
      </td>
    </tr>

    <!-- Divider -->
    <tr><td><table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%"><tr><td style="font-size:0;line-height:0;border-top:1px solid rgba(255,255,255,0.05);">&nbsp;</td></tr></table></td></tr>

    <!-- Footer -->
    <tr>
      <td align="center" class="pad-sm" style="padding:24px 44px 32px;">
        <p style="margin:0 0 10px;font-size:13px;color:#4B4B63;line-height:1.6;">
          You received this because it is related to your SocialNex account.
        </p>
        <p style="margin:0;font-size:12px;color:#33333F;">
          <a href="${APP_URL}/settings/notifications" style="color:#6366F1;text-decoration:none;font-weight:500;">Manage notifications</a>
          &nbsp;&bull;&nbsp;
          <a href="${APP_URL}" style="color:#4B4B63;text-decoration:none;">SocialNex</a>
          &nbsp;&bull;&nbsp;
          <span>&copy; ${new Date().getFullYear()} Vayunex Solution</span>
        </p>
      </td>
    </tr>

  </table>
</td></tr>
</table>
</body>
</html>`;
}

/* ─────────────────────────────────────────────────────────────────
   SHARED UI COMPONENTS
   ──────────────────────────────────────────────────────────────── */
function heroBlock({ icon, title, subtitle, accentColor = '#6366F1', bgColor = 'rgba(99,102,241,0.08)', borderColor = 'rgba(99,102,241,0.2)' }) {
  return `
<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom:32px;">
  <tr>
    <td align="center">
      <div class="hero-icon" style="width:72px;height:72px;background:${bgColor};border:1px solid ${borderColor};border-radius:18px;font-size:32px;line-height:72px;text-align:center;display:inline-block;margin-bottom:20px;">${icon}</div>
      <h1 class="hero-title" style="margin:0 0 10px;font-size:28px;font-weight:800;color:#FFFFFF;letter-spacing:-0.7px;line-height:1.2;">${title}</h1>
      ${subtitle ? `<p style="margin:0;font-size:16px;color:#8B8BA7;line-height:1.5;">${subtitle}</p>` : ''}
    </td>
  </tr>
</table>`;
}

function primaryButton({ href, text, color = '#6366F1', glow = 'rgba(99,102,241,0.35)' }) {
  return `
<table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" style="margin:32px auto 0;">
  <tr>
    <td align="center" style="border-radius:100px;background:${color};box-shadow:0 8px 32px -8px ${glow};">
      <a href="${href}" class="btn" style="display:inline-block;padding:16px 40px;font-size:16px;font-weight:700;color:#fff;text-decoration:none;letter-spacing:0.2px;border-radius:100px;">
        ${text}
      </a>
    </td>
  </tr>
</table>`;
}

function infoCard({ rows, accentColor = '#6366F1' }) {
  const cells = rows.map(({ label, value }) => `
      <td valign="top" style="padding:0 0 0 20px;border-right:1px solid rgba(255,255,255,0.05);">
        <p style="margin:0 0 4px;font-size:11px;font-weight:600;letter-spacing:1px;text-transform:uppercase;color:#5B5B78;">${label}</p>
        <p style="margin:0;font-size:14px;font-weight:500;color:#C0C0D8;line-height:1.4;">${value}</p>
      </td>`).join('');

  return `
<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" class="stat-wrap" style="margin:28px 0;background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.05);border-radius:14px;overflow:hidden;">
  <tr>
    <td style="padding:0;border-right:4px solid ${accentColor};width:4px;">&nbsp;</td>
    ${cells}
    <td style="padding:0;width:16px;">&nbsp;</td>
  </tr>
  <tr><td colspan="${rows.length + 2}" height="16"></td></tr>
</table>`;
}

function alertBox({ icon, text, type = 'info' }) {
  const colors = {
    info: { bg: 'rgba(99,102,241,0.08)', border: 'rgba(99,102,241,0.25)', text: '#A5B4FC' },
    warning: { bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.25)', text: '#FCD34D' },
    danger: { bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.25)', text: '#FCA5A5' },
    success: { bg: 'rgba(52,211,153,0.08)', border: 'rgba(52,211,153,0.25)', text: '#6EE7B7' },
  };
  const c = colors[type] || colors.info;
  return `
<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin:24px 0;">
  <tr>
    <td style="padding:16px 20px;background:${c.bg};border:1px solid ${c.border};border-radius:12px;font-size:14px;color:${c.text};line-height:1.5;">
      ${icon ? `<span>${icon}&nbsp;&nbsp;</span>` : ''}${text}
    </td>
  </tr>
</table>`;
}

/* ─────────────────────────────────────────────────────────────────
   LOGIN SUCCESS ALERT
   ──────────────────────────────────────────────────────────────── */
async function sendLoginSuccessAlert(userId, ip, userAgent) {
  try {
    const r = await resolveAlertEmail(userId, 'email_on_login_success');
    if (!r) return;
    const time = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', hour12: true });
    const device = userAgent ? userAgent.replace(/\(.*?\)/g, '').trim().split(' ').slice(0, 5).join(' ') : 'Unknown browser';

    const html = buildHtml({
      title: 'New Login – SocialNex',
      preheader: 'A new sign-in was detected on your account.',
      accentColor: '#34D399',
      body: `
${heroBlock({ icon: '🔐', title: 'New Login Detected', subtitle: `Hi <strong style="color:#fff;">${r.name}</strong>, your account was just accessed.`, accentColor: '#34D399', bgColor: 'rgba(52,211,153,0.08)', borderColor: 'rgba(52,211,153,0.25)' })}

<p style="margin:0 0 6px;font-size:15px;color:#8B8BA7;line-height:1.6;">If this was you, sit back and relax — no action needed. If something looks off, secure your account right away.</p>

${infoCard({
        accentColor: '#34D399', rows: [
          { label: 'Time', value: time + ' IST' },
          { label: 'IP Address', value: ip || 'Unknown' },
          { label: 'Device', value: device.substring(0, 55) || 'Unknown' },
        ]
      })}

${alertBox({ icon: '💡', text: 'Tip: Enable two-factor authentication for an extra layer of protection.', type: 'success' })}

${primaryButton({ href: `${process.env.FRONTEND_URL || 'https://socialnex.vayunexsolution.com'}/settings`, text: 'Review Account Security →', color: '#059669', glow: 'rgba(5,150,105,0.4)' })}
`});

    await emailService.sendMail({ to: r.to, subject: '🔐 New login to your SocialNex account', html });
    logger.info(`Login success alert sent to ${r.to}`);
  } catch (err) {
    logger.warn('sendLoginSuccessAlert error:', err.message);
  }
}

/* ─────────────────────────────────────────────────────────────────
   LOGIN FAIL ALERT
   ──────────────────────────────────────────────────────────────── */
async function sendLoginFailAlert(email) {
  try {
    const rows = await query(
      `SELECT u.full_name, ns.alert_email, ns.master_toggle, ns.email_on_login_fail
             FROM users u LEFT JOIN notification_settings ns ON ns.user_id = u.id
             WHERE u.email = ?`, [email]
    );
    if (!rows.length || !rows[0].master_toggle || !rows[0].email_on_login_fail) return;
    const { full_name, alert_email } = rows[0];
    const to = alert_email || email;
    const time = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', hour12: true });

    const html = buildHtml({
      title: 'Failed Login Attempt – SocialNex',
      preheader: 'Someone tried to sign in with an incorrect password.',
      accentColor: '#EF4444',
      body: `
${heroBlock({ icon: '⚠️', title: 'Failed Login Attempt', subtitle: `Hi <strong style="color:#fff;">${full_name || 'there'}</strong>, we blocked a suspicious sign-in.`, accentColor: '#EF4444', bgColor: 'rgba(239,68,68,0.08)', borderColor: 'rgba(239,68,68,0.25)' })}

<p style="margin:0 0 24px;font-size:15px;color:#8B8BA7;line-height:1.6;">
  Someone tried to log into your account at <strong style="color:#E4E4E7;">${time} IST</strong> using an incorrect password. <strong style="color:#FCA5A5;">This was not you?</strong> Act now.
</p>

<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin:0 0 24px;">
  <tr>
    <td style="padding:20px;background:rgba(239,68,68,0.05);border:1px solid rgba(239,68,68,0.15);border-left:3px solid #EF4444;border-radius:0 12px 12px 0;">
      <p style="margin:0 0 10px;font-size:14px;font-weight:700;color:#fff;">Recommended actions:</p>
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
        <tr><td style="padding:4px 0;font-size:14px;color:#C0C0D8;line-height:1.5;">&#10003;&nbsp; Change your password immediately</td></tr>
        <tr><td style="padding:4px 0;font-size:14px;color:#C0C0D8;line-height:1.5;">&#10003;&nbsp; Review recent account activity</td></tr>
        <tr><td style="padding:4px 0;font-size:14px;color:#C0C0D8;line-height:1.5;">&#10003;&nbsp; Enable notification alerts for future logins</td></tr>
      </table>
    </td>
  </tr>
</table>

${primaryButton({ href: `${process.env.FRONTEND_URL || 'https://socialnex.vayunexsolution.com'}/settings`, text: 'Secure My Account →', color: 'linear-gradient(135deg,#EF4444,#DC2626)', glow: 'rgba(239,68,68,0.4)' })}
`});

    await emailService.sendMail({ to, subject: '⚠️ Failed login attempt on your account', html });
    logger.info(`Login fail alert sent to ${to}`);
  } catch (err) {
    logger.warn('sendLoginFailAlert error:', err.message);
  }
}

/* ─────────────────────────────────────────────────────────────────
   POST FAIL ALERT
   ──────────────────────────────────────────────────────────────── */
async function sendPostFailAlert(userId, platform, postContent, errorMsg) {
  try {
    const r = await resolveAlertEmail(userId, 'email_on_post_fail');
    if (!r) return;
    const preview = postContent ? (postContent.length > 120 ? postContent.substring(0, 120) + '…' : postContent) : 'No content preview available.';

    const html = buildHtml({
      title: `Post failed on ${platform} – SocialNex`,
      preheader: `Your scheduled post on ${platform} couldn't be published.`,
      accentColor: '#F59E0B',
      body: `
${heroBlock({ icon: '📭', title: 'Publishing Failed', subtitle: `Your scheduled post on <strong style="color:#FCD34D;">${platform}</strong> hit an error.`, accentColor: '#F59E0B', bgColor: 'rgba(245,158,11,0.08)', borderColor: 'rgba(245,158,11,0.25)' })}

<p style="margin:0 0 20px;font-size:15px;color:#8B8BA7;line-height:1.6;">
  Hey <strong style="color:#fff;">${r.name}</strong>, we tried to publish your content automatically but ran into an issue.
</p>

<!-- Content preview card -->
<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin:0 0 16px;">
  <tr>
    <td style="padding:20px 22px;background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.06);border-radius:14px;">
      <p style="margin:0 0 8px;font-size:11px;font-weight:600;letter-spacing:1px;text-transform:uppercase;color:#5B5B78;">Content Preview</p>
      <p style="margin:0;font-size:14px;color:#C0C0D8;line-height:1.6;font-style:italic;">&ldquo;${preview}&rdquo;</p>
    </td>
  </tr>
</table>

${alertBox({ icon: '🔴', text: `<strong>Error:</strong> ${errorMsg || 'API rejected the request. Your access token may be expired or the media format is unsupported.'}`, type: 'danger' })}

<p style="margin:0;font-size:14px;color:#8B8BA7;line-height:1.5;">To fix this, reconnect your <strong style="color:#FCD34D;">${platform}</strong> account from Dashboard Settings and reschedule your post.</p>

${primaryButton({ href: `${process.env.FRONTEND_URL || 'https://socialnex.vayunexsolution.com'}/dashboard`, text: 'View Error & Fix →', color: 'linear-gradient(135deg,#F59E0B,#D97706)', glow: 'rgba(245,158,11,0.35)' })}
`});

    await emailService.sendMail({ to: r.to, subject: `📭 Post failed on ${platform} – action needed`, html });
    logger.info(`Post fail alert sent to ${r.to}`);
  } catch (err) {
    logger.warn('sendPostFailAlert error:', err.message);
  }
}

/* ─────────────────────────────────────────────────────────────────
   HOLIDAY REMINDER
   ──────────────────────────────────────────────────────────────── */
async function sendHolidayReminder(userId, holidayName, date) {
  try {
    const r = await resolveAlertEmail(userId, 'email_marketing_reminders');
    if (!r) return;
    const d = new Date(date);
    const day = d.getDate();
    const month = d.toLocaleString('en-IN', { month: 'long' });
    const weekday = d.toLocaleString('en-IN', { weekday: 'long' });

    const html = buildHtml({
      title: `${holidayName} is in 3 days — Schedule your post!`,
      preheader: `🎊 Don't miss posting on ${holidayName}. Your audience is waiting.`,
      accentColor: '#EC4899',
      body: `
${heroBlock({ icon: '🎊', title: `${holidayName} is<br>3 days away!`, subtitle: `<strong style="color:#fff;">${weekday}, ${day} ${month}</strong>`, accentColor: '#EC4899', bgColor: 'rgba(236,72,153,0.08)', borderColor: 'rgba(236,72,153,0.25)' })}

<p style="margin:0 0 24px;font-size:15px;color:#8B8BA7;line-height:1.6;">
  Hey <strong style="color:#fff;">${r.name}</strong> 👋 — festival season is the biggest opportunity in social media. Brands that post on <strong style="color:#F9A8D4;">${holidayName}</strong> see <strong style="color:#fff;">3–5× higher engagement</strong> than on normal days.
</p>

<!-- Stats row -->
<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin:0 0 24px;border-radius:14px;overflow:hidden;border:1px solid rgba(255,255,255,0.06);">
  <tr style="background:rgba(236,72,153,0.06);">
    <td align="center" style="padding:18px 12px;border-right:1px solid rgba(255,255,255,0.06);">
      <p style="margin:0 0 4px;font-size:26px;font-weight:800;color:#F472B6;">3×</p>
      <p style="margin:0;font-size:12px;color:#8B8BA7;">More Likes</p>
    </td>
    <td align="center" style="padding:18px 12px;border-right:1px solid rgba(255,255,255,0.06);">
      <p style="margin:0 0 4px;font-size:26px;font-weight:800;color:#F472B6;">5×</p>
      <p style="margin:0;font-size:12px;color:#8B8BA7;">More Reach</p>
    </td>
    <td align="center" style="padding:18px 12px;">
      <p style="margin:0 0 4px;font-size:26px;font-weight:800;color:#F472B6;">2×</p>
      <p style="margin:0;font-size:12px;color:#8B8BA7;">More Shares</p>
    </td>
  </tr>
</table>

${alertBox({ icon: '⚡', text: `You haven't scheduled any posts for <strong>${holidayName}</strong> yet. Set it up in 30 seconds — SocialNex will handle the rest while you enjoy the holiday!`, type: 'info' })}

${primaryButton({ href: `${process.env.FRONTEND_URL || 'https://socialnex.vayunexsolution.com'}/scheduler`, text: `Schedule ${holidayName} Post →`, color: 'linear-gradient(135deg,#EC4899,#BE185D)', glow: 'rgba(236,72,153,0.45)' })}

<p style="margin:28px 0 0;text-align:center;font-size:13px;color:#4B4B63;">You won&apos;t receive this reminder again once you schedule a post for this date.</p>
`});

    await emailService.sendMail({ to: r.to, subject: `🎊 ${holidayName} in 3 days — schedule your post now!`, html });
    logger.info(`Holiday reminder (${holidayName}) sent to ${r.to}`);
  } catch (err) {
    logger.warn('sendHolidayReminder error:', err.message);
  }
}

module.exports = { sendLoginSuccessAlert, sendLoginFailAlert, sendPostFailAlert, sendHolidayReminder };
