const mysql = require('mysql2/promise');

const connectDB = async () => {
  try {
    const pool = await mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'timesync',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });

    // Test connection
    await pool.getConnection();
    console.log("MySQL Database connected successfully");
    return pool;

  } catch (err) {
    console.error("MySQL connection failed:", err);
    process.exit(1);
  }
};

module.exports = connectDB;
