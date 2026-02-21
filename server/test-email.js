/**
 * Email Test Script
 * Tests the email service by sending emails to given addresses
 */

require('dotenv').config();
const nodemailer = require('nodemailer');
const fs = require('fs').promises;
const path = require('path');
const handlebars = require('handlebars');

// Create transporter
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    },
    tls: {
        rejectUnauthorized: false
    }
});

// Test emails
const testEmails = [
    { email: 'yashkr4748@gmail.com', name: 'Yash' },
    { email: 'palakrajput327@gmail.com', name: 'Palak' }
];

// Load and compile template
async function loadTemplate(templateName) {
    try {
        const templatePath = path.join(__dirname, 'src/templates/emails', `${templateName}.html`);
        const template = await fs.readFile(templatePath, 'utf-8');
        return handlebars.compile(template);
    } catch (error) {
        console.log('Template not found, using inline template');
        return null;
    }
}

// Send welcome email
async function sendWelcomeEmail(user) {
    const template = await loadTemplate('welcome');

    let html;
    if (template) {
        html = template({
            userName: user.name,
            dashboardLink: 'http://localhost:5173/dashboard',
            loginLink: 'http://localhost:5173/login',
            year: new Date().getFullYear()
        });
    } else {
        // Fallback inline template
        html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #1A1A2E; padding: 40px; border-radius: 16px;">
        <div style="background: linear-gradient(135deg, #6366F1, #8B5CF6, #EC4899); padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 30px;">
          <h1 style="color: white; margin: 0; font-size: 28px;">🚀 SocialMRT</h1>
        </div>
        <h2 style="color: #FFFFFF; margin-bottom: 20px;">Welcome ${user.name}! 🎉</h2>
        <p style="color: #B8B8D1; font-size: 16px; line-height: 1.6;">
          Your account is ready! You can now start managing all your social media accounts from one powerful dashboard.
        </p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="http://localhost:5173" style="display: inline-block; background: linear-gradient(135deg, #6366F1, #8B5CF6); color: white; padding: 15px 40px; border-radius: 50px; text-decoration: none; font-weight: bold;">
            Get Started 🚀
          </a>
        </div>
        <p style="color: #6B6B80; font-size: 14px; text-align: center;">
          © ${new Date().getFullYear()} SocialMRT. Made with 💜
        </p>
      </div>
    `;
    }

    const info = await transporter.sendMail({
        from: process.env.FROM_EMAIL || `"SocialMRT" <${process.env.SMTP_USER}>`,
        to: user.email,
        subject: '🎉 Welcome to SocialMRT - Your Social Media Command Center!',
        html: html
    });

    return info;
}

// Send verification email
async function sendVerificationEmail(user) {
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const template = await loadTemplate('verify-email');

    let html;
    if (template) {
        html = template({
            userName: user.name,
            otpCode: otpCode,
            verificationLink: `http://localhost:5173/verify?token=test-token-${Date.now()}`,
            expiresIn: '24 hours',
            year: new Date().getFullYear()
        });
    } else {
        html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #1A1A2E; padding: 40px; border-radius: 16px;">
        <div style="background: linear-gradient(135deg, #6366F1, #8B5CF6, #EC4899); padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 30px;">
          <h1 style="color: white; margin: 0; font-size: 28px;">🚀 SocialMRT</h1>
        </div>
        <h2 style="color: #FFFFFF; margin-bottom: 20px;">Verify Your Email 🔐</h2>
        <p style="color: #B8B8D1; font-size: 16px; line-height: 1.6;">
          Hello ${user.name}, use this code to verify your email:
        </p>
        <div style="background: rgba(99, 102, 241, 0.1); border: 2px dashed #6366F1; border-radius: 12px; padding: 30px; text-align: center; margin: 20px 0;">
          <p style="color: #6366F1; font-size: 12px; text-transform: uppercase; margin: 0 0 10px;">Your Code</p>
          <p style="color: #FFFFFF; font-size: 36px; font-weight: bold; letter-spacing: 8px; margin: 0; font-family: monospace;">${otpCode}</p>
        </div>
        <p style="color: #6B6B80; font-size: 14px; text-align: center;">
          © ${new Date().getFullYear()} SocialMRT. Made with 💜
        </p>
      </div>
    `;
    }

    const info = await transporter.sendMail({
        from: process.env.FROM_EMAIL || `"SocialMRT" <${process.env.SMTP_USER}>`,
        to: user.email,
        subject: '🔐 Verify Your Email - SocialMRT',
        html: html
    });

    return info;
}

// Main test function
async function runTests() {
    console.log('\n🚀 SocialMRT Email Test\n');
    console.log('━'.repeat(50));
    console.log(`SMTP Host: ${process.env.SMTP_HOST}`);
    console.log(`SMTP Port: ${process.env.SMTP_PORT}`);
    console.log(`From: ${process.env.FROM_EMAIL || process.env.SMTP_USER}`);
    console.log('━'.repeat(50));

    // Verify connection
    try {
        await transporter.verify();
        console.log('\n✅ SMTP Connection Successful!\n');
    } catch (error) {
        console.error('\n❌ SMTP Connection Failed:', error.message);
        return;
    }

    // Send emails
    for (const user of testEmails) {
        console.log(`\n📧 Sending emails to ${user.name} (${user.email})...`);

        try {
            // Send welcome email
            const welcomeResult = await sendWelcomeEmail(user);
            console.log(`   ✅ Welcome email sent! Message ID: ${welcomeResult.messageId}`);

            // Wait a bit
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Send verification email
            const verifyResult = await sendVerificationEmail(user);
            console.log(`   ✅ Verification email sent! Message ID: ${verifyResult.messageId}`);

        } catch (error) {
            console.error(`   ❌ Failed to send to ${user.email}:`, error.message);
        }
    }

    console.log('\n' + '━'.repeat(50));
    console.log('🎉 Email test complete! Check inboxes.');
    console.log('━'.repeat(50) + '\n');
}

// Run tests
runTests().catch(console.error);
