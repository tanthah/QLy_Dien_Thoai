const fs = require('fs');
const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config();

async function importDatabase() {
  try {
    console.log('⏳ Đang kết nối trực tiếp đến Cloud Aiven để nạp dữ liệu...');
    
    // Cấu hình cứng theo thông số chuẩn trên trang Aiven của bạn
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '3306'),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      ssl: { rejectUnauthorized: false },
      multipleStatements: true
    });

    // Tìm file database.sql ngay trong thư mục backend của bạn
    const sqlFilePath = path.join(__dirname, '..', 'database.sql'); 
    
    if (!fs.existsSync(sqlFilePath)) {
      throw new Error('Không tìm thấy file database.sql trong thư mục backend. Hãy kiểm tra lại tên file!');
    }

    const sql = fs.readFileSync(sqlFilePath, 'utf8');
    
    console.log('🚀 Đang đọc file SQL và đẩy cấu trúc bảng lên Cloud...');
    await connection.query(sql);
    
    console.log('✅ XUẤT SẮC! Toàn bộ bảng và dữ liệu đồ án đã online trên Aiven 100%!');
    await connection.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Lỗi nạp dữ liệu:', error.message);
    process.exit(1);
  }
}

importDatabase();