/**
 * Migration: Activity Logs & Notification Settings
 * Run once: node setup-logs-alerts.js
 */

require('dotenv').config({ path: '.env.production' });
const mysql = require('mysql2/promise');

async function runMigration() {
    const conn = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: parseInt(process.env.DB_PORT) || 3306,
        ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
    });

    console.log('✅ Connected to database');

    try {
        // 1. Activity Logs table
        await conn.execute(`
            CREATE TABLE IF NOT EXISTS activity_logs (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                action VARCHAR(100) NOT NULL,
                entity_type VARCHAR(50) DEFAULT NULL,
                entity_id INT DEFAULT NULL,
                details JSON DEFAULT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                INDEX idx_user_action (user_id, action),
                INDEX idx_user_created (user_id, created_at)
            ) ENGINE=InnoDB CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
        `);
        console.log('✅ activity_logs table created');

        // 2. Notification Settings table
        await conn.execute(`
            CREATE TABLE IF NOT EXISTS notification_settings (
                user_id INT PRIMARY KEY,
                alert_email VARCHAR(255) DEFAULT NULL,
                master_toggle TINYINT(1) DEFAULT 1,
                email_on_login_success TINYINT(1) DEFAULT 0,
                email_on_login_fail TINYINT(1) DEFAULT 1,
                email_on_post_fail TINYINT(1) DEFAULT 1,
                email_on_account_disconnect TINYINT(1) DEFAULT 1,
                email_marketing_reminders TINYINT(1) DEFAULT 1,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            ) ENGINE=InnoDB CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
        `);
        console.log('✅ notification_settings table created');

        // 3. Back-fill default settings for all existing users
        await conn.execute(`
            INSERT IGNORE INTO notification_settings (user_id)
            SELECT id FROM users
        `);
        console.log('✅ Default notification settings created for existing users');

        console.log('\n🎉 Migration complete!');
    } catch (err) {
        console.error('❌ Migration failed:', err.message);
        process.exit(1);
    } finally {
        await conn.end();
    }
}

runMigration();
