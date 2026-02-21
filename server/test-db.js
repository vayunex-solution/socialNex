// Quick Database Connection Test
require('dotenv').config();
const mysql = require('mysql2/promise');

async function testConnection() {
    console.log('🔌 Testing Database Connection...');
    console.log('Host:', process.env.DB_HOST);
    console.log('Database:', process.env.DB_NAME);
    console.log('User:', process.env.DB_USER);

    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            port: parseInt(process.env.DB_PORT) || 3306,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            connectTimeout: 30000
        });

        console.log('✅ Connected Successfully!');

        // Check tables
        const [tables] = await connection.execute('SHOW TABLES');
        console.log('\n📋 Tables in database:', tables.length);

        if (tables.length === 0) {
            console.log('⚠️  No tables found. Schema needs to be imported.');
        } else {
            tables.forEach(t => {
                const tableName = Object.values(t)[0];
                console.log('  -', tableName);
            });
        }

        await connection.end();
        console.log('\n✅ Connection closed.');

    } catch (error) {
        console.error('❌ Connection Error:', error.message);
        if (error.code) console.error('   Error Code:', error.code);
    }
}

testConnection();
