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
    ...(process.env.NODE_ENV === 'production' && {
      ssl: { rejectUnauthorized: false }
    })
  });

  try {
    console.log('🧹 Đang xóa dữ liệu cũ...');
    await connection.query('DELETE FROM OrderDetail');
    await connection.query('DELETE FROM `Order`');
    await connection.query('DELETE FROM CartItem');
    await connection.query('DELETE FROM Image');
    await connection.query('DELETE FROM Product');
    console.log('✅ Đã xóa dữ liệu cũ.');

    // ──────────────────────────────────────────────
    // DANH SÁCH SẢN PHẨM MẪU
    // ──────────────────────────────────────────────
    const products = [
      // Apple
      {
        name: 'iPhone 16 Pro Max',
        brand: 'Apple',
        price: 34990000,
        stock: 12,
        desc: 'Chip A18 Pro, màn hình 6.9" Super Retina XDR, camera 48MP với Zoom quang học 5x, titan cao cấp.',
        images: [
          'https://images.unsplash.com/photo-1695048133142-1a20484d2569?q=80&w=600',
          'https://images.unsplash.com/photo-1710218919690-2c7f4e7e2df5?q=80&w=600',
        ]
      },
      {
        name: 'iPhone 15',
        brand: 'Apple',
        price: 22990000,
        stock: 20,
        desc: 'Chip A16 Bionic, Dynamic Island, cổng USB-C tiện lợi, camera chính 48MP sắc nét.',
        images: [
          'https://images.unsplash.com/photo-1664478546384-d57ffe74a78c?q=80&w=600',
        ]
      },
      {
        name: 'iPhone 14',
        brand: 'Apple',
        price: 17990000,
        stock: 15,
        desc: 'Chip A15 Bionic mạnh mẽ, camera TrueDepth cải tiến, thiết kế nhôm và kính sang trọng.',
        images: [
          'https://images.unsplash.com/photo-1678685888221-cda773a3dcdb?q=80&w=600',
        ]
      },

      // Samsung
      {
        name: 'Samsung Galaxy S25 Ultra',
        brand: 'Samsung',
        price: 32990000,
        stock: 10,
        desc: 'Bút S Pen tích hợp, camera 200MP zoom 100x, chip Snapdragon 8 Elite, Galaxy AI thế hệ mới.',
        images: [
          'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?q=80&w=600',
          'https://images.unsplash.com/photo-1598327105666-5b89351aff97?q=80&w=600',
        ]
      },
      {
        name: 'Samsung Galaxy S24 FE',
        brand: 'Samsung',
        price: 14990000,
        stock: 25,
        desc: 'Màn hình Dynamic AMOLED 6.7", chip Exynos 2500, pin 4700mAh, sạc nhanh 45W.',
        images: [
          'https://images.unsplash.com/photo-1592890288564-76628a30a657?q=80&w=600',
        ]
      },
      {
        name: 'Samsung Galaxy A55 5G',
        brand: 'Samsung',
        price: 9990000,
        stock: 30,
        desc: 'Khung nhôm bền bỉ, màn hình Super AMOLED 120Hz, camera 50MP OIS, pin 5000mAh.',
        images: [
          'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=600',
        ]
      },

      // Xiaomi
      {
        name: 'Xiaomi 14 Ultra',
        brand: 'Xiaomi',
        price: 25990000,
        stock: 8,
        desc: 'Hệ thống camera Leica 4 ống kính, chip Snapdragon 8 Gen 3, sạc siêu tốc 90W, pin 5000mAh.',
        images: [
          'https://images.unsplash.com/photo-1598327105666-5b89351aff97?q=80&w=600',
        ]
      },
      {
        name: 'Xiaomi Redmi Note 13 Pro',
        brand: 'Xiaomi',
        price: 7490000,
        stock: 35,
        desc: 'Camera 200MP sắc nét, màn hình AMOLED 120Hz, pin 5100mAh, sạc nhanh 67W.',
        images: [
          'https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?q=80&w=600',
        ]
      },

      // OPPO
      {
        name: 'OPPO Find X8 Pro',
        brand: 'OPPO',
        price: 28990000,
        stock: 7,
        desc: 'Camera Hasselblad 50MP, chip Dimensity 9400, màn hình LTPO AMOLED 6.78", sạc SUPERVOOC 80W.',
        images: [
          'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?q=80&w=600',
        ]
      },
      {
        name: 'OPPO Reno12 F',
        brand: 'OPPO',
        price: 8990000,
        stock: 20,
        desc: 'Thiết kế mỏng nhẹ thời trang, camera AI 50MP, pin 5000mAh, sạc SUPERVOOC 45W.',
        images: [
          'https://images.unsplash.com/photo-1585060544812-6b45742d762f?q=80&w=600',
        ]
      },

      // Vivo
      {
        name: 'Vivo X200 Pro',
        brand: 'Vivo',
        price: 26990000,
        stock: 6,
        desc: 'Camera Zeiss 200MP, chip Dimensity 9400, pin 6000mAh sạc nhanh 90W, chống nước IP68.',
        images: [
          'https://images.unsplash.com/photo-1551355738-1875b4a1a2ee?q=80&w=600',
        ]
      },
      {
        name: 'Vivo V40',
        brand: 'Vivo',
        price: 10990000,
        stock: 18,
        desc: 'Thiết kế siêu mỏng 7.58mm, camera Zeiss 50MP, màn hình AMOLED 120Hz, pin 5500mAh.',
        images: [
          'https://images.unsplash.com/photo-1523206489230-c012c64b2b48?q=80&w=600',
        ]
      },
    ];

    console.log(`🚀 Đang thêm ${products.length} sản phẩm...`);

    for (const p of products) {
      const productID = crypto.randomUUID();

      await connection.query(
        `INSERT INTO Product (productID, productName, brand, price, stock_quantity, description)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [productID, p.name, p.brand, p.price, p.stock, p.desc]
      );

      for (let i = 0; i < p.images.length; i++) {
        await connection.query(
          `INSERT INTO Image (imageID, productID, imageSource, imagePosition)
           VALUES (?, ?, ?, ?)`,
          [crypto.randomUUID(), productID, p.images[i], i]
        );
      }

      console.log(`  ✔ ${p.brand} - ${p.name}`);
    }

    console.log(`\n🎉 Đã seed thành công ${products.length} sản phẩm lên Cloud!`);
  } catch (err) {
    console.error('❌ Lỗi seed:', err.message);
  } finally {
    await connection.end();
  }
}

seed();
