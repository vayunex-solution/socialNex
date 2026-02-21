/**
 * Check social accounts directly from database
 */
require('dotenv').config();
const { query, closePool } = require('./src/config/database');

async function checkAccounts() {
    console.log('\n📋 Checking social_accounts table...\n');

    try {
        const accounts = await query('SELECT id, user_id, platform, account_name, account_username, is_active, connected_at FROM social_accounts ORDER BY id');

        if (accounts.length === 0) {
            console.log('❌ No accounts found in social_accounts table');
        } else {
            console.log(`✅ Found ${accounts.length} account(s):\n`);
            accounts.forEach(acc => {
                console.log(`  ID: ${acc.id} | User: ${acc.user_id} | Platform: ${acc.platform}`);
                console.log(`  Name: ${acc.account_name} | Username: ${acc.account_username}`);
                console.log(`  Active: ${acc.is_active} | Connected: ${acc.connected_at}`);
                console.log('  ---');
            });
        }

        // Also check users
        console.log('\n👤 Users in database:\n');
        const users = await query('SELECT id, email, full_name FROM users');
        users.forEach(u => {
            console.log(`  ID: ${u.id} | Email: ${u.email} | Name: ${u.full_name}`);
        });

    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await closePool();
    }
}

checkAccounts();
