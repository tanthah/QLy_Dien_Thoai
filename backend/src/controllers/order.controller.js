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
}

module.exports = OrderController;
