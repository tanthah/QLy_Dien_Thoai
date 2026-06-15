const db = require('../config/db');
const crypto = require('crypto');

class OrderModel {
  /**
   * Create a new order with its details in a transaction
   * @param {Object} orderData - { userID, shippingAddress, receiver, phoneNumber, status }
   * @param {Array<Object>} items - Array of { productID, quantity, unitPrice, totalPrice }
   */
  static async create(orderData, items) {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      const orderID = crypto.randomUUID();
      
      // 1. Insert into Order table
      await connection.query(
        `INSERT INTO \`Order\` (orderID, userID, orderStatus, shippingAddress, receiver, phoneNumber) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          orderID,
          orderData.userID,
          orderData.status || 'PENDING',
          orderData.shippingAddress,
          orderData.receiver,
          orderData.phoneNumber
        ]
      );

      // 2. Insert into OrderDetail table and update stock
      for (const item of items) {
        const orderDetailID = crypto.randomUUID();
        await connection.query(
          `INSERT INTO OrderDetail (orderDetailID, orderID, productID, quantity, unitPrice, totalPrice) 
           VALUES (?, ?, ?, ?, ?, ?)`,
          [
            orderDetailID,
            orderID,
            item.productID,
            item.quantity,
            item.unitPrice,
            item.totalPrice
          ]
        );

        // Update product stock
        await connection.query(
          'UPDATE Product SET stock_quantity = stock_quantity - ? WHERE productID = ?',
          [item.quantity, item.productID]
        );
      }

      await connection.commit();
      return orderID;
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  }

  /**
   * Get all orders for a specific user
   * @param {string} userID
   */
  static async getByUserId(userID) {
    const [orders] = await db.query(
      'SELECT * FROM `Order` WHERE userID = ? ORDER BY orderDate DESC',
      [userID]
    );

    if (orders.length === 0) return [];

    // Fetch details for each order
    const orderIds = orders.map(o => o.orderID);
    const [details] = await db.query(
      `SELECT od.*, p.productName, p.brand
       FROM OrderDetail od
       JOIN Product p ON od.productID = p.productID
       WHERE od.orderID IN (?)`,
      [orderIds]
    );

    const detailsByOrderId = details.reduce((map, detail) => {
      if (!map.has(detail.orderID)) {
        map.set(detail.orderID, []);
      }
      map.get(detail.orderID).push(detail);
      return map;
    }, new Map());

    return orders.map(order => ({
      ...order,
      items: detailsByOrderId.get(order.orderID) || []
    }));
  }

  /**
   * Get total amount of an order
   * @param {string} orderID
   */
  static async getTotalAmount(orderID) {
    const [result] = await db.query(
      'SELECT SUM(totalPrice) as total FROM OrderDetail WHERE orderID = ?',
      [orderID]
    );
    return result[0].total || 0;
  }

  /**
   * [ADMIN] Get all orders from all users, joined with user info
   */
  static async getAllOrders() {
    const [orders] = await db.query(
      `SELECT o.*, u.username, u.fullName, u.email
       FROM \`Order\` o
       LEFT JOIN User u ON o.userID = u.userID
       ORDER BY o.orderDate DESC`
    );

    if (orders.length === 0) return [];

    const orderIds = orders.map(o => o.orderID);
    const [details] = await db.query(
      `SELECT od.*, p.productName, p.brand
       FROM OrderDetail od
       JOIN Product p ON od.productID = p.productID
       WHERE od.orderID IN (?)`,
      [orderIds]
    );

    const detailsByOrderId = details.reduce((map, detail) => {
      if (!map.has(detail.orderID)) map.set(detail.orderID, []);
      map.get(detail.orderID).push(detail);
      return map;
    }, new Map());

    return orders.map(order => ({
      ...order,
      items: detailsByOrderId.get(order.orderID) || []
    }));
  }

  /**
   * [ADMIN] Update the status of an order
   * @param {string} orderID
   * @param {string} newStatus - One of: PENDING, PROCESSING, COMPLETED, FAILED, CANCELLED
   */
  static async updateStatus(orderID, newStatus) {
    const validStatuses = ['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED'];
    if (!validStatuses.includes(newStatus)) {
      throw new Error(`Trạng thái không hợp lệ: ${newStatus}`);
    }
    const [result] = await db.query(
      'UPDATE `Order` SET orderStatus = ? WHERE orderID = ?',
      [newStatus, orderID]
    );
    if (result.affectedRows === 0) {
      throw new Error('Không tìm thấy đơn hàng');
    }
    return true;
  }
}

module.exports = OrderModel;
