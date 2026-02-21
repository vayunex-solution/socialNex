/**
 * MySQL Database Configuration
 * Using mysql2 with connection pool for better performance
 */

const mysql = require('mysql2/promise');

// Connection Pool Configuration
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'SocialNex_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0
});

/**
 * Execute a query with parameters
 * @param {string} sql - SQL query or stored procedure call
 * @param {Array} params - Query parameters
 * @returns {Promise} Query result
 */
const query = async (sql, params = []) => {
    try {
        const [results] = await pool.execute(sql, params);
        return results;
    } catch (error) {
        console.error('Database Query Error:', error);
        throw error;
    }
};

/**
 * Call a stored procedure
 * @param {string} procedureName - Name of stored procedure
 * @param {Array} params - Procedure parameters
 * @returns {Promise} Procedure result
 */
const callProcedure = async (procedureName, params = []) => {
    const placeholders = params.map(() => '?').join(', ');
    const sql = `CALL ${procedureName}(${placeholders})`;

    try {
        const [results] = await pool.execute(sql, params);
        // Stored procedures return nested array, first element is data
        return results[0] || results;
    } catch (error) {
        console.error(`Stored Procedure Error [${procedureName}]:`, error);
        throw error;
    }
};

/**
 * Test database connection
 */
const testConnection = async () => {
    try {
        const connection = await pool.getConnection();
        console.log('✅ Database connected successfully!');
        connection.release();
        return true;
    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
        return false;
    }
};

/**
 * Close pool connections (for graceful shutdown)
 */
const closePool = async () => {
    await pool.end();
    console.log('Database pool closed');
};

module.exports = {
    pool,
    query,
    callProcedure,
    testConnection,
    closePool
};
