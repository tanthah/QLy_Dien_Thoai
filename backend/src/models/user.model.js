const db = require('../config/db');
const crypto = require('crypto');

class UserModel {
  /**
   * Tìm user theo username
   * @param {string} username
   */
  static async findByUsername(username) {
    const [rows] = await db.query(
      'SELECT * FROM User WHERE username = ?',
      [username]
    );
    return rows[0] || null;
  }

  static async findFirstByRole(role) {
    const [rows] = await db.query(
      'SELECT * FROM User WHERE role = ? ORDER BY username ASC LIMIT 1',
      [role]
    );
    return rows[0] || null;
  }

  /**
   * Tìm user theo userID
   * @param {string} userID
   */
  static async findById(userID) {
    const [rows] = await db.query(
      'SELECT userID, username, fullName, email, phoneNumber, role FROM User WHERE userID = ?',
      [userID]
    );
    return rows[0] || null;
  }

  /**
   * Tìm user theo email (để kiểm tra trùng lặp)
   * @param {string} email
   */
  static async findByEmail(email) {
    const [rows] = await db.query(
      'SELECT userID FROM User WHERE email = ?',
      [email]
    );
    return rows[0] || null;
  }

  /**
   * Tạo user mới
   * @param {Object} userData - { username, password (hashed), fullName, email, phoneNumber, role }
   */
  static async create(userData) {
    const userID = crypto.randomUUID();
    await db.query(
      `INSERT INTO User (userID, username, password, fullName, email, phoneNumber, role)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        userID,
        userData.username,
        userData.password,
        userData.fullName || null,
        userData.email || null,
        userData.phoneNumber || null,
        userData.role || 'CUSTOMER'
      ]
    );
    return userID;
  }

  /**
   * Cập nhật thông tin cá nhân
   * @param {string} userID
   * @param {Object} data - { fullName, email, phoneNumber }
   */
  static async updateProfile(userID, data) {
    const [result] = await db.query(
      `UPDATE User SET fullName = ?, email = ?, phoneNumber = ? WHERE userID = ?`,
      [data.fullName || null, data.email || null, data.phoneNumber || null, userID]
    );
    return result.affectedRows > 0;
  }

  /**
   * Cập nhật mật khẩu (đã hash)
   * @param {string} userID
   * @param {string} hashedPassword
   */
  static async updatePassword(userID, hashedPassword) {
    const [result] = await db.query(
      'UPDATE User SET password = ? WHERE userID = ?',
      [hashedPassword, userID]
    );
    return result.affectedRows > 0;
  }

  /**
   * Lấy tất cả user (Admin)
   */
  static async getAll() {
    const [rows] = await db.query(
      'SELECT userID, username, fullName, email, phoneNumber, role FROM User ORDER BY role DESC, username ASC'
    );
    return rows;
  }

  /**
   * Xóa user theo ID
   * @param {string} userID
   */
  static async deleteById(userID) {
    const [result] = await db.query(
      'DELETE FROM User WHERE userID = ?',
      [userID]
    );
    return result.affectedRows > 0;
  }
}

module.exports = UserModel;
