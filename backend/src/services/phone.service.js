const PhoneModel = require('../models/phone.model');

class PhoneService {
  static async getAllPhones(filters) {
    return await PhoneModel.getAll(filters);
  }

  static async getPhoneById(id) {
    const phone = await PhoneModel.getById(id);
    if (!phone) {
      const error = new Error('Phone not found');
      error.statusCode = 404;
      throw error;
    }
    return phone;
  }

  static async createPhone(phoneData, images) {
    if (!phoneData.productName || phoneData.productName.trim() === '') {
      const error = new Error('Product name is required');
      error.statusCode = 400;
      throw error;
    }
    return await PhoneModel.create(phoneData, images);
  }

  static async updatePhone(id, phoneData, images) {
    if (!phoneData.productName || phoneData.productName.trim() === '') {
      const error = new Error('Product name is required');
      error.statusCode = 400;
      throw error;
    }
    const updated = await PhoneModel.update(id, phoneData, images);
    if (!updated) {
      const error = new Error('Phone not found or update failed');
      error.statusCode = 404;
      throw error;
    }
    return updated;
  }

  static async deletePhone(id) {
    const deleted = await PhoneModel.delete(id);
    if (!deleted) {
      const error = new Error('Phone not found or delete failed');
      error.statusCode = 404;
      throw error;
    }
    return deleted;
  }
}

module.exports = PhoneService;
