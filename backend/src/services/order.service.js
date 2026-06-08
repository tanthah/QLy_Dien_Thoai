const OrderModel = require('../models/order.model');
const AddressModel = require('../models/address.model');
const PhoneModel = require('../models/phone.model');

class OrderService {
  /**
   * Place a new order
   * @param {string} userID 
   * @param {Object} orderInfo - { receiver, phoneNumber, shippingAddress, items }
   */
  static async placeOrder(userID, orderInfo) {
    const { receiver, phoneNumber, shippingAddress, items } = orderInfo;

    if (!items || items.length === 0) {
      throw new Error('Giỏ hàng trống');
    }

    // 1. Verify and prepare order details
    const orderItems = [];
    for (const item of items) {
      const product = await PhoneModel.getById(item.productID);
      if (!product) {
        throw new Error(`Sản phẩm ${item.productID} không tồn tại`);
      }
      if (product.stock_quantity < item.quantity) {
        throw new Error(`Sản phẩm ${product.productName} không đủ hàng (còn ${product.stock_quantity})`);
      }

      orderItems.push({
        productID: item.productID,
        quantity: item.quantity,
        unitPrice: product.price,
        totalPrice: product.price * item.quantity
      });
    }

    // 2. Check if we should save the address to the user's addresses
    // For simplicity, we check if the user has any address. If not, we could save this one.
    // However, the requirements say "nếu trước đó chưa nhập địa chỉ nào thì lưu địa chỉ mới nhập".
    const existingAddresses = await AddressModel.getByUserId(userID);
    if (existingAddresses.length === 0) {
      const { addressDetails } = orderInfo;
      if (addressDetails) {
        await AddressModel.create(userID, {
          city: addressDetails.city,
          ward: addressDetails.ward,
          street: addressDetails.street,
          houseNumber: addressDetails.houseNumber
        });
      } else {
        await AddressModel.create(userID, {
          street: shippingAddress
        });
      }
    }

    // 3. Create the order
    const orderData = {
      userID,
      shippingAddress,
      receiver,
      phoneNumber,
      status: 'PENDING'
    };

    const orderID = await OrderModel.create(orderData, orderItems);
    return orderID;
  }

  /**
   * Get purchase history for a user
   * @param {string} userID 
   */
  static async getUserOrders(userID) {
    return await OrderModel.getByUserId(userID);
  }
}

module.exports = OrderService;
