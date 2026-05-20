const db = require('../config/db');
const crypto = require('crypto');

class PhoneModel {
  /**
   * Get all phones with filters (search name, brand)
   * @param {Object} filters - { search, brand }
   */
  static async getAll(filters = {}) {
    let query = 'SELECT p.* FROM Product p';
    const queryParams = [];
    const conditions = [];

    if (filters.search) {
      conditions.push(`p.productName LIKE ?`);
      queryParams.push(`%${filters.search}%`);
    }

    if (filters.brand) {
      conditions.push(`p.brand = ?`);
      queryParams.push(filters.brand);
    }

    if (conditions.length > 0) {
      query += ` WHERE ` + conditions.join(' AND ');
    }

    const [rows] = await db.query(query, queryParams);
    if (rows.length === 0) return [];

    const productIds = rows.map((row) => row.productID);
    const [images] = await db.query(
      `SELECT productID, imageSource
       FROM Image
       WHERE productID IN (?)
       ORDER BY productID ASC, imagePosition ASC, imageID ASC`,
      [productIds]
    );

    const imagesByProductId = images.reduce((map, image) => {
      if (!map.has(image.productID)) {
        map.set(image.productID, []);
      }
      map.get(image.productID).push(image.imageSource);
      return map;
    }, new Map());
    
    return rows.map(row => ({
      ...row,
      images: imagesByProductId.get(row.productID) || []
    }));
  }

  /**
   * Get a single phone by ID
   * @param {string} id 
   */
  static async getById(id) {
    const [products] = await db.query('SELECT * FROM Product WHERE productID = ?', [id]);
    if (products.length === 0) return null;

    const [images] = await db.query(
      'SELECT imageSource FROM Image WHERE productID = ? ORDER BY imagePosition ASC, imageID ASC',
      [id]
    );
    
    return {
      ...products[0],
      images: images.map(img => img.imageSource)
    };
  }

  /**
   * Create a new phone with its images
   * @param {Object} phoneData - { productName, brand, price, stock_quantity, description }
   * @param {Array<string>} images - Array of image URLs
   */
  static async create(phoneData, images = []) {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      const productID = crypto.randomUUID();
      
      await connection.query(
        `INSERT INTO Product (productID, productName, brand, price, stock_quantity, description) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          productID,
          phoneData.productName,
          phoneData.brand,
          phoneData.price || 0,
          phoneData.stock_quantity || 0,
          phoneData.description || ''
        ]
      );

      if (images && images.length > 0) {
        for (const [index, imgUrl] of images.entries()) {
          if (imgUrl && imgUrl.trim() !== '') {
            const imageID = crypto.randomUUID();
            await connection.query(
              'INSERT INTO Image (imageID, productID, imageSource, imagePosition) VALUES (?, ?, ?, ?)',
              [imageID, productID, imgUrl.trim(), index]
            );
          }
        }
      }

      await connection.commit();
      return productID;
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  }

  /**
   * Update a phone and its images
   * @param {string} id 
   * @param {Object} phoneData 
   * @param {Array<string>} images 
   */
  static async update(id, phoneData, images = []) {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      // Check if product exists first
      const [existing] = await connection.query('SELECT productID FROM Product WHERE productID = ?', [id]);
      if (existing.length === 0) {
        await connection.rollback();
        return false;
      }

      await connection.query(
        `UPDATE Product 
         SET productName = ?, brand = ?, price = ?, stock_quantity = ?, description = ? 
         WHERE productID = ?`,
        [
          phoneData.productName,
          phoneData.brand,
          phoneData.price || 0,
          phoneData.stock_quantity || 0,
          phoneData.description || '',
          id
        ]
      );

      // Clean old images
      await connection.query('DELETE FROM Image WHERE productID = ?', [id]);

      // Insert new images
      if (images && images.length > 0) {
        for (const [index, imgUrl] of images.entries()) {
          if (imgUrl && imgUrl.trim() !== '') {
            const imageID = crypto.randomUUID();
            await connection.query(
              'INSERT INTO Image (imageID, productID, imageSource, imagePosition) VALUES (?, ?, ?, ?)',
              [imageID, id, imgUrl.trim(), index]
            );
          }
        }
      }

      await connection.commit();
      return true;
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  }

  /**
   * Delete a phone
   * @param {string} id 
   */
  static async delete(id) {
    const [result] = await db.query('DELETE FROM Product WHERE productID = ?', [id]);
    return result.affectedRows > 0;
  }
}

module.exports = PhoneModel;
