const mysql = require('mysql2/promise');
const { DB } = require('../src/config/env');
const crypto = require('crypto');

async function seed() {
  const connection = await mysql.createConnection({
    host: DB.host,
    port: DB.port,
    user: DB.user,
    password: DB.password,
    database: DB.database,
  });

  try {
    console.log('Cleaning existing data...');
    await connection.query('DELETE FROM OrderDetail');
    await connection.query('DELETE FROM `Order`');
    await connection.query('DELETE FROM CartItem');
    await connection.query('DELETE FROM Image');
    await connection.query('DELETE FROM Product');
    console.log('Cleaned database tables.');

    console.log('Seeding products...');
    const iphoneId = crypto.randomUUID();
    const samsungId = crypto.randomUUID();
    const xiaomiId = crypto.randomUUID();

    await connection.query(
      `INSERT INTO Product (productID, productName, brand, price, stock_quantity, description) VALUES
      (?, 'iPhone 15 Pro Max', 'Apple', 29990000, 10, 'Thiết kế Titan bền bỉ, chip A17 Pro mạnh mẽ, nút Action thông minh, camera Zoom quang học 5x.'),
      (?, 'Samsung Galaxy S24 Ultra', 'Samsung', 27990000, 15, 'Tích hợp bút S Pen thế hệ mới, camera 200MP đột phá zoom 100x và Galaxy AI thông minh vượt trội.'),
      (?, 'Xiaomi 14 Ultra', 'Xiaomi', 21990000, 8, 'Hệ thống camera kết hợp cùng Leica, chip Snapdragon 8 Gen 3 đỉnh cao, sạc siêu tốc 90W.')`,
      [iphoneId, samsungId, xiaomiId]
    );

    await connection.query(
      `INSERT INTO Image (imageID, productID, imageSource, imagePosition) VALUES
      (?, ?, 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?q=80&w=600', 0),
      (?, ?, 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?q=80&w=600', 0),
      (?, ?, 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?q=80&w=600', 0)`,
      [crypto.randomUUID(), iphoneId, crypto.randomUUID(), samsungId, crypto.randomUUID(), xiaomiId]
    );

    console.log('Successfully seeded 3 premium products!');
  } catch (err) {
    console.error('Seeding failed:', err);
  } finally {
    await connection.end();
  }
}

seed();
