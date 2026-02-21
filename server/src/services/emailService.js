/**
 * Email Service
 * Handles sending emails using Nodemailer and Handlebars templates
 */

const nodemailer = require('nodemailer');
const handlebars = require('handlebars');
const fs = require('fs').promises;
const path = require('path');
const { logger } = require('../utils/logger');

class EmailService {
    constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || 'smtp.gmail.com',
            port: parseInt(process.env.SMTP_PORT) || 587,
            secure: process.env.SMTP_SECURE === 'true',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            },
            tls: {
                rejectUnauthorized: false // Allow self-signed certificates
            }
        });

        // Verify connection on startup
        if (process.env.SMTP_USER && process.env.SMTP_PASS) {
            this.transporter.verify()
                .then(() => logger.success('📧 Email service connected'))
                .catch(err => logger.warn('📧 Email service not configured:', err.message));
        } else {
            logger.warn('📧 Email service not configured - SMTP credentials missing');
        }
    }

    /**
     * Load and compile Handlebars template
     */
    async loadTemplate(templateName) {
        try {
            const templatePath = path.join(__dirname, '../templates/emails', `${templateName}.html`);
            const template = await fs.readFile(templatePath, 'utf-8');
            return handlebars.compile(template);
        } catch (error) {
            // Return a simple fallback template if file not found
            logger.warn(`Template ${templateName}.html not found, using fallback`);
            return handlebars.compile(`
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #6366F1;">SocialMRT</h1>
          {{#if userName}}<p>Hello {{userName}},</p>{{/if}}
          {{#if otpCode}}<p>Your verification code: <strong>{{otpCode}}</strong></p>{{/if}}
          {{#if verificationLink}}<p><a href="{{verificationLink}}">Click here to verify</a></p>{{/if}}
          {{#if resetLink}}<p><a href="{{resetLink}}">Click here to reset password</a></p>{{/if}}
          <p>Thanks,<br>SocialMRT Team</p>
        </div>
      `);
        }
    }

    /**
     * Send verification email
     */
    async sendVerificationEmail(user, verificationToken, otpCode) {
        const template = await this.loadTemplate('verify-email');
        const verificationLink = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;

        const html = template({
            userName: user.fullName,
            otpCode: otpCode,
            verificationLink: verificationLink,
            expiresIn: '24 hours',
            year: new Date().getFullYear()
        });

        await this.sendMail({
            to: user.email,
            subject: '🔐 Verify Your Email - SocialMRT',
            html: html
        });

        logger.info(`Verification email sent to ${user.email}`);
    }

    /**
     * Send welcome email after verification
     */
    async sendWelcomeEmail(user) {
        const template = await this.loadTemplate('welcome');

        const html = template({
            userName: user.fullName,
            loginLink: `${process.env.FRONTEND_URL}/login`,
            dashboardLink: `${process.env.FRONTEND_URL}/dashboard`,
            year: new Date().getFullYear()
        });

        await this.sendMail({
            to: user.email,
            subject: '🎉 Welcome to SocialMRT!',
            html: html
        });

        logger.info(`Welcome email sent to ${user.email}`);
    }

    /**
     * Send password reset email
     */
    async sendPasswordResetEmail(user, resetToken) {
        const template = await this.loadTemplate('reset-password');
        const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

        const html = template({
            userName: user.fullName,
            resetLink: resetLink,
            expiresIn: '1 hour',
            year: new Date().getFullYear()
        });

        await this.sendMail({
            to: user.email,
            subject: '🔑 Reset Your Password - SocialMRT',
            html: html
        });

        logger.info(`Password reset email sent to ${user.email}`);
    }

    /**
     * Base send mail function
     */
    async sendMail({ to, subject, html, text }) {
        try {
            const info = await this.transporter.sendMail({
                from: `"SocialMRT" <${process.env.SMTP_USER}>`,
                to,
                subject,
                html,
                text: text || html.replace(/<[^>]*>/g, '') // Strip HTML for text version
            });

            return info;
        } catch (error) {
            logger.error('Email sending failed:', error);
            throw error;
        }
    }
}

module.exports = new EmailService();
