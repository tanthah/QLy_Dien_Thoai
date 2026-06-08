const PhoneModel = require('../models/phone.model');
const { normalizeImageUrls } = require('../utils/imageUrls');

const createValidationError = (message) => {
  const error = new Error(message);
  error.statusCode = 400;
  return error;
};

const sanitizeImages = (images) => {
  if (images !== undefined && images !== null && !Array.isArray(images)) {
    throw createValidationError('Danh sách ảnh không hợp lệ');
  }

  const submittedImages = Array.isArray(images)
    ? images.filter((image) => typeof image === 'string' && image.trim())
    : [];
  const normalizedImages = normalizeImageUrls(submittedImages);

  if (submittedImages.length !== normalizedImages.length) {
    throw createValidationError('Danh sách ảnh chứa URL không hợp lệ');
  }

  return normalizedImages;
};

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
      throw createValidationError('Product name is required');
    }

    const normalizedImages = sanitizeImages(images);
    return await PhoneModel.create(phoneData, normalizedImages);
  }

  static async updatePhone(id, phoneData, images) {
    if (!phoneData.productName || phoneData.productName.trim() === '') {
      throw createValidationError('Product name is required');
    }

    const normalizedImages = sanitizeImages(images);
    const updated = await PhoneModel.update(id, phoneData, normalizedImages);
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
