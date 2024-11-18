const mysql = require('mysql2/promise'); // Use the promise-based MySQL2
require('dotenv').config(); // Load environment variables from the .env file

// Create a connection pool using environment variables
const pool = mysql.createPool({
    host: process.env.DB_HOST,  // Use the environment variable for the host
    user: process.env.DB_USER,  // Use the environment variable for the username
    password: process.env.DB_PASSWORD,  // Use the environment variable for the password
    database: process.env.DB_NAME,  // Use the environment variable for the database name
    port: process.env.DB_PORT,  // Use the environment variable for the port
    ssl: {
        rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED === 'true' 
    }
});

// Export the pool
module.exports = pool;
