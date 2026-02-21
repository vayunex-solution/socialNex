require('dotenv').config();
const { query } = require('./src/config/database');

async function createPostsTable() {
    try {
        await query(`
            CREATE TABLE IF NOT EXISTS posts (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                content TEXT,
                platforms JSON,
                status VARCHAR(20) DEFAULT 'draft',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id)
            )
        `);
        console.log('✅ posts table created successfully!');
    } catch (e) {
        console.error('❌ Error:', e.message);
    }
    process.exit(0);
}

createPostsTable();
