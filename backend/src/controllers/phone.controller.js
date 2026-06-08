const PhoneService = require('../services/phone.service');
const response = require('../utils/response');

class PhoneController {
  static async getAll(req, res, next) {
    try {
      const { search, brand } = req.query;
      const phones = await PhoneService.getAllPhones({ search, brand });
      return response.success(res, 'Phones retrieved successfully', phones);
    } catch (err) {
      next(err);
    }
  }

  static async getById(req, res, next) {
    try {
      const { id } = req.params;
      const phone = await PhoneService.getPhoneById(id);
      return response.success(res, 'Phone details retrieved successfully', phone);
    } catch (err) {
      next(err);
    }
  }

  static async create(req, res, next) {
    try {
      const { productName, brand, price, stock_quantity, description, images } = req.body;
      const newPhoneId = await PhoneService.createPhone(
        { productName, brand, price, stock_quantity, description },
        images
      );
      return response.success(res, 'Phone created successfully', { id: newPhoneId }, 201);
    } catch (err) {
      next(err);
    }
  }

  static async update(req, res, next) {
    try {
      const { id } = req.params;
      const { productName, brand, price, stock_quantity, description, images } = req.body;
      await PhoneService.updatePhone(
        id,
        { productName, brand, price, stock_quantity, description },
        images
      );
      return response.success(res, 'Phone updated successfully', null);
    } catch (err) {
      next(err);
    }
  }

  static async delete(req, res, next) {
    try {
      const { id } = req.params;
      await PhoneService.deletePhone(id);
      return response.success(res, 'Phone deleted successfully', null);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = PhoneController;
