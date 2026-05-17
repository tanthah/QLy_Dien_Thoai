require('dotenv').config();

module.exports = {
  PORT: process.env.PORT || 5000,
  DB: {
    host: process.env.DB_HOST || '127.0.0.1',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'PhoneStoreDB'
  }
};
