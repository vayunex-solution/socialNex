// Import Schema to Remote Database - Cleaned Version
require('dotenv').config();
const mysql = require('mysql2/promise');
const fs = require('fs');

async function importSchema() {
    console.log('🚀 Importing Schema to Remote Database...\n');

    let connection;

    try {
        connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            port: parseInt(process.env.DB_PORT) || 3306,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            multipleStatements: true,
            connectTimeout: 30000
        });

        console.log('✅ Connected to database:', process.env.DB_NAME);

        // Read schema file
        const schemaPath = 'D:/Social-mrt/database/schema.sql';
        let schemaSQL = fs.readFileSync(schemaPath, 'utf8');
        console.log('📄 File size:', schemaSQL.length, 'bytes');

        // Remove CREATE DATABASE and USE statements
        schemaSQL = schemaSQL.replace(/CREATE DATABASE.*?;/gis, '-- Removed CREATE DATABASE');
        schemaSQL = schemaSQL.replace(/USE\s+\w+;/gi, '-- Removed USE statement');

        console.log('\n⏳ Executing schema...');
        await connection.query(schemaSQL);

        console.log('✅ Schema executed!\n');

        // Verify tables created
        const [tables] = await connection.execute('SHOW TABLES');
        console.log(`📋 Tables created: ${tables.length}`);
        tables.forEach(t => {
            console.log('  ✓', Object.values(t)[0]);
        });

        console.log('\n🎉 Schema import completed successfully!');

    } catch (error) {
        console.error('❌ Error:', error.message);
        if (error.sqlMessage) console.error('   SQL:', error.sqlMessage);
    } finally {
        if (connection) await connection.end();
    }
}

importSchema();
