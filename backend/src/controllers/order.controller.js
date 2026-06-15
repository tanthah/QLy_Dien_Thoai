const OrderService = require('../services/order.service');
const AddressModel = require('../models/address.model');
const response = require('../utils/response');

class OrderController {
  static async placeOrder(req, res, next) {
    try {
      const userID = req.user.userID;
      const orderInfo = req.body;
      const orderID = await OrderService.placeOrder(userID, orderInfo);
      return response.success(res, 'Đặt hàng thành công', { orderID }, 201);
    } catch (err) {
      next(err);
    }
  }

  static async getMyOrders(req, res, next) {
    try {
      const userID = req.user.userID;
      const orders = await OrderService.getUserOrders(userID);
      return response.success(res, 'Lấy lịch sử đơn hàng thành công', orders);
    } catch (err) {
      next(err);
    }
  }

  static async getMyAddresses(req, res, next) {
    try {
      const userID = req.user.userID;
      const addresses = await AddressModel.getByUserId(userID);
      return response.success(res, 'Lấy danh sách địa chỉ thành công', addresses);
    } catch (err) {
      next(err);
    }
  }

  // ── Admin handlers ──────────────────────────────────────

  static async getAllOrders(req, res, next) {
    try {
      const orders = await OrderService.getAllOrders();
      return response.success(res, 'Lấy tất cả đơn hàng thành công', orders);
    } catch (err) {
      next(err);
    }
  }

  static async updateOrderStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      if (!status) {
        return response.error(res, 'Thiếu trạng thái mới', 400);
      }
      await OrderService.updateOrderStatus(id, status);
      return response.success(res, 'Cập nhật trạng thái đơn hàng thành công');
    } catch (err) {
      next(err);
    }
  }
}

module.exports = OrderController;
