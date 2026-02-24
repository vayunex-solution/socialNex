require('dotenv').config({ path: '.env.production' });
const emailService = require('./src/services/emailService');

// Mock the query function BEFORE requiring emailAlertService
const dbConfig = require('./src/config/database');
dbConfig.query = async (sql, params) => {
    // Return a fake user with all toggles ON
    return [{
        id: 1,
        full_name: 'Yash',
        email: 'yashyr0725@gmail.com',
        alert_email: 'yashyr0725@gmail.com',
        master_toggle: 1,
        email_on_login_success: 1,
        email_on_login_fail: 1,
        email_on_post_fail: 1,
        email_marketing_reminders: 1
    }];
};

const emailAlertService = require('./src/services/emailAlertService');

async function sendAllTemplates() {
    console.log('Sending test emails to yashyr0725@gmail.com...');

    const fakeUser = { id: 1, fullName: 'Yash', email: 'yashyr0725@gmail.com' };

    try {
        // --- 1. Auth Emails ---
        console.log('1. Sending Verify Email...');
        await emailService.sendVerificationEmail(fakeUser, 'fake-token-123', '474825');

        console.log('2. Sending Welcome Email...');
        await emailService.sendWelcomeEmail(fakeUser);

        console.log('3. Sending Reset Password...');
        await emailService.sendPasswordResetEmail(fakeUser, 'fake-reset-token-456');

        // --- 2. Alert Emails ---
        console.log('4. Sending Login Success...');
        await emailAlertService.sendLoginSuccessAlert(1, '192.168.1.10', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36');

        console.log('5. Sending Login Failed...');
        await emailAlertService.sendLoginFailAlert('yashyr0725@gmail.com');

        console.log('6. Sending Post Failed...');
        await emailAlertService.sendPostFailAlert(1, 'Bluesky', 'Excited for the new launch! 🚀 Check out our latest features...', 'Access token expired');

        console.log('7. Sending Holiday Reminder...');
        await emailAlertService.sendHolidayReminder(1, 'Diwali', new Date('2025-10-20').toISOString());

        console.log('✅ ALL TEST EMAILS SENT SUCCESSFULLY!');
    } catch (err) {
        console.error('❌ Failed to send emails:', err);
    }
}

sendAllTemplates();
