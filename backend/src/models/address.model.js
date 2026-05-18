const db = require('../config/db');
const crypto = require('crypto');

class AddressModel {
  /**
   * Lấy tất cả địa chỉ của một user
   * @param {string} userID
   */
  static async getByUserId(userID) {
    const [rows] = await db.query(
      'SELECT * FROM Address WHERE userID = ? ORDER BY addressID ASC',
      [userID]
    );
    return rows;
  }

  /**
   * Lấy một địa chỉ theo ID
   * @param {string} addressID
   */
  static async getById(addressID) {
    const [rows] = await db.query(
      'SELECT * FROM Address WHERE addressID = ?',
      [addressID]
    );
    return rows[0] || null;
  }

  /**
   * Thêm địa chỉ mới cho user
   * @param {string} userID
   * @param {Object} data - { city, ward, street, houseNumber }
   */
  static async create(userID, data) {
    const addressID = crypto.randomUUID();
    await db.query(
      `INSERT INTO Address (addressID, userID, city, ward, street, houseNumber)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        addressID,
        userID,
        data.city || null,
        data.ward || null,
        data.street || null,
        data.houseNumber || null
      ]
    );
    return addressID;
  }

  /**
   * Cập nhật địa chỉ — kiểm tra quyền sở hữu (userID phải khớp)
   * @param {string} addressID
   * @param {string} userID
   * @param {Object} data - { city, ward, street, houseNumber }
   */
  static async update(addressID, userID, data) {
    const [result] = await db.query(
      `UPDATE Address SET city = ?, ward = ?, street = ?, houseNumber = ?
       WHERE addressID = ? AND userID = ?`,
      [
        data.city || null,
        data.ward || null,
        data.street || null,
        data.houseNumber || null,
        addressID,
        userID
      ]
    );
    return result.affectedRows > 0;
  }

  /**
   * Xóa địa chỉ — kiểm tra quyền sở hữu (userID phải khớp)
   * @param {string} addressID
   * @param {string} userID
   */
  static async delete(addressID, userID) {
    const [result] = await db.query(
      'DELETE FROM Address WHERE addressID = ? AND userID = ?',
      [addressID, userID]
    );
    return result.affectedRows > 0;
  }
}

module.exports = AddressModel;
