const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const { DB } = require('./env');

const pool = mysql.createPool({
  host: DB.host,
  user: DB.user,
  password: DB.password,
  database: DB.database,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

const ensureImagePositionColumn = async () => {
  const [columns] = await pool.query(
    `SELECT COLUMN_NAME
     FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'Image' AND COLUMN_NAME = 'imagePosition'`,
    [DB.database]
  );

  if (columns.length === 0) {
    await pool.query('ALTER TABLE Image ADD COLUMN imagePosition INT NOT NULL DEFAULT 0 AFTER imageSource');
    console.log('Added Image.imagePosition column for ordered product images.');
  }
};

// Setup and auto-initialize database schema on startup
const setupTables = async () => {
  try {
    let tablesExist = false;
    
    // 1. Try querying the 'Product' table to see if it already exists
    try {
      const tempConn = await mysql.createConnection({
        host: DB.host,
        user: DB.user,
        password: DB.password,
        database: DB.database
      });
      await tempConn.query('SELECT 1 FROM Product LIMIT 1');
      await tempConn.end();
      tablesExist = true;
    } catch (err) {
      // Table doesn't exist or database doesn't exist
      tablesExist = false;
    }

    // 2. If tables do not exist, run the database.sql script
    if (!tablesExist) {
      console.log('Database or Product table does not exist. Initializing schema from database.sql...');
      
      // Connect to MySQL server without database first (multipleStatements enabled to run the whole file)
      const connection = await mysql.createConnection({
        host: DB.host,
        user: DB.user,
        password: DB.password,
        multipleStatements: true
      });
      
      const sqlPath = path.join(__dirname, '../../../database.sql');
      if (fs.existsSync(sqlPath)) {
        const sqlContent = fs.readFileSync(sqlPath, 'utf8');
        // Execute the entire database.sql file (handles CREATE DATABASE, USE, and all CREATE TABLE commands)
        await connection.query(sqlContent);
        console.log('Database and all tables initialized successfully!');
      } else {
        console.warn('database.sql file was not found at: ' + sqlPath);
      }
      
      await connection.end();
    } else {
      console.log('Database and tables already exist. Skipping schema initialization.');
    }

    await ensureImagePositionColumn();
  } catch (err) {
    console.error('Error during database auto-initialization:', err.message);
  }
};

// Execute initialization
setupTables();

module.exports = pool;


