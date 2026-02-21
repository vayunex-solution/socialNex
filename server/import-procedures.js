// Import Stored Procedures to Remote Database
require('dotenv').config();
const mysql = require('mysql2/promise');
const fs = require('fs');

async function importProcedures() {
    console.log('🚀 Importing Stored Procedures...\n');

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

        // Read stored procedures file
        const spPath = 'D:/Social-mrt/database/stored_procedures.sql';
        let spSQL = fs.readFileSync(spPath, 'utf8');

        // Clean up the SQL for Node.js mysql2 driver
        // Remove USE statement
        spSQL = spSQL.replace(/USE\s+\w+;/gi, '');

        // Remove DELIMITER commands (mysql2 handles this differently)
        spSQL = spSQL.replace(/DELIMITER\s+\/\//gi, '');
        spSQL = spSQL.replace(/DELIMITER\s+;/gi, '');

        // Replace // with ; for procedure endings
        spSQL = spSQL.replace(/END\s*\/\//g, 'END;');

        // Extract individual CREATE PROCEDURE statements
        const procedureRegex = /CREATE\s+PROCEDURE\s+[\s\S]*?END\s*;/gi;
        const procedures = spSQL.match(procedureRegex) || [];

        console.log(`📋 Found ${procedures.length} stored procedures\n`);

        // Drop and recreate each procedure
        let successCount = 0;
        let errorCount = 0;

        for (const proc of procedures) {
            // Extract procedure name
            const nameMatch = proc.match(/CREATE\s+PROCEDURE\s+(\w+)/i);
            const procName = nameMatch ? nameMatch[1] : 'unknown';

            try {
                // Drop if exists
                await connection.execute(`DROP PROCEDURE IF EXISTS ${procName}`);

                // Create procedure
                await connection.execute(proc);
                console.log(`  ✅ ${procName}`);
                successCount++;
            } catch (err) {
                console.log(`  ❌ ${procName}: ${err.message.substring(0, 50)}...`);
                errorCount++;
            }
        }

        console.log(`\n📊 Import Complete!`);
        console.log(`   Success: ${successCount} | Failed: ${errorCount}`);

        // Verify by listing procedures
        const [procs] = await connection.execute(
            `SELECT ROUTINE_NAME FROM INFORMATION_SCHEMA.ROUTINES 
       WHERE ROUTINE_SCHEMA = ? AND ROUTINE_TYPE = 'PROCEDURE'`,
            [process.env.DB_NAME]
        );

        console.log(`\n📋 Procedures in database: ${procs.length}`);

        if (procs.length > 0) {
            console.log('\n🎉 Stored procedures imported successfully!');
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
        if (error.sqlMessage) console.error('   SQL:', error.sqlMessage);
    } finally {
        if (connection) await connection.end();
    }
}

importProcedures();
