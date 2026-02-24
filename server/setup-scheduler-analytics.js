/**
 * Database Migration: Scheduler & Analytics Tables
 * Run: node setup-scheduler-analytics.js
 */

require('dotenv').config();
const { query } = require('./src/config/database');

async function migrate() {
    console.log('🚀 Creating Scheduler & Analytics tables...\n');

    try {
        // 1. Scheduled Posts
        await query(`
            CREATE TABLE IF NOT EXISTS scheduled_posts (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                content TEXT NOT NULL,
                account_ids JSON NOT NULL,
                images JSON DEFAULT NULL,
                scheduled_at DATETIME NOT NULL,
                timezone VARCHAR(50) DEFAULT 'Asia/Kolkata',
                status ENUM('scheduled','publishing','published','failed','cancelled') DEFAULT 'scheduled',
                discord_bot_name VARCHAR(100) DEFAULT 'SocialNex',
                publish_results JSON DEFAULT NULL,
                error_message TEXT DEFAULT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id),
                INDEX idx_status_scheduled (status, scheduled_at),
                INDEX idx_user_status (user_id, status)
            )
        `);
        console.log('✅ scheduled_posts table created');

        // 2. Post Results (individual platform outcomes)
        await query(`
            CREATE TABLE IF NOT EXISTS post_results (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                scheduled_post_id INT DEFAULT NULL,
                platform VARCHAR(30) NOT NULL,
                account_id INT NOT NULL,
                account_name VARCHAR(255),
                content TEXT,
                post_type ENUM('instant','scheduled') DEFAULT 'instant',
                status ENUM('success','failed') NOT NULL,
                platform_post_id VARCHAR(255) DEFAULT NULL,
                error_message TEXT DEFAULT NULL,
                published_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id),
                INDEX idx_user_date (user_id, published_at),
                INDEX idx_platform (platform)
            )
        `);
        console.log('✅ post_results table created');

        // 3. Analytics Daily (aggregated stats)
        await query(`
            CREATE TABLE IF NOT EXISTS analytics_daily (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                date DATE NOT NULL,
                total_posts INT DEFAULT 0,
                successful_posts INT DEFAULT 0,
                failed_posts INT DEFAULT 0,
                platforms_used JSON DEFAULT NULL,
                UNIQUE KEY unique_user_date (user_id, date),
                FOREIGN KEY (user_id) REFERENCES users(id)
            )
        `);
        console.log('✅ analytics_daily table created');

        // 4. Add metadata column to existing posts table if it exists
        try {
            await query(`
                ALTER TABLE posts 
                ADD COLUMN IF NOT EXISTS scheduled_post_id INT DEFAULT NULL,
                ADD COLUMN IF NOT EXISTS metadata JSON DEFAULT NULL
            `);
            console.log('✅ posts table updated with new columns');
        } catch (e) {
            console.log('ℹ️  posts table alteration skipped:', e.message);
        }

        console.log('\n🎉 Migration completed successfully!');

    } catch (error) {
        console.error('❌ Migration failed:', error.message);
    }

    process.exit(0);
}

migrate();
