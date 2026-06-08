const UserModel = require('../models/user.model');
const AddressModel = require('../models/address.model');
const { createSaltedHash, verifyPassword } = require('../utils/password');

const USERNAME_PATTERN = /^[A-Za-z0-9_]+$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^[0-9]{9,15}$/;

const createValidationError = (message) => {
  const err = new Error(message);
  err.statusCode = 400;
  return err;
};

const requiredString = (value, fieldName) => {
  if (typeof value !== 'string' || !value.trim()) {
    throw createValidationError(`${fieldName} không được để trống`);
  }
  return value.trim();
};

const normalizePhoneNumber = (phoneNumber) => {
  return phoneNumber.replace(/[\s.-]/g, '');
};

const validateUsername = (value) => {
  const username = requiredString(value, 'Tên đăng nhập');
  if (username.length < 3 || username.length > 50) {
    throw createValidationError('Tên đăng nhập phải có từ 3 đến 50 ký tự');
  }
  if (!USERNAME_PATTERN.test(username)) {
    throw createValidationError('Tên đăng nhập chỉ được gồm chữ, số và dấu gạch dưới');
  }
  return username;
};

const validatePassword = (value, fieldName = 'Mật khẩu') => {
  const password = requiredString(value, fieldName);
  if (password.length < 6) {
    throw createValidationError(`${fieldName} phải có ít nhất 6 ký tự`);
  }
  if (password.length > 128) {
    throw createValidationError(`${fieldName} không được vượt quá 128 ký tự`);
  }
  return password;
};

const validateFullName = (value) => {
  const fullName = requiredString(value, 'Họ và tên');
  if (fullName.length > 100) {
    throw createValidationError('Họ và tên không được vượt quá 100 ký tự');
  }
  return fullName;
};

const validateEmail = (value) => {
  const email = requiredString(value, 'Email').toLowerCase();
  if (email.length > 100 || !EMAIL_PATTERN.test(email)) {
    throw createValidationError('Email không hợp lệ');
  }
  return email;
};

const validatePhoneNumber = (value) => {
  const phoneNumber = normalizePhoneNumber(requiredString(value, 'Số điện thoại'));
  if (!PHONE_PATTERN.test(phoneNumber)) {
    throw createValidationError('Số điện thoại phải gồm 9 đến 15 chữ số');
  }
  return phoneNumber;
};

// ───────────────────────────────────────────────
//  Utility: tạo token đơn giản (Base64 JSON)
// ───────────────────────────────────────────────
const generateToken = (user) => {
  const payload = {
    userID: user.userID,
    username: user.username,
    role: user.role,
    iat: Date.now()
  };
  return Buffer.from(JSON.stringify(payload)).toString('base64');
};

// ───────────────────────────────────────────────
//  Auth Services
// ───────────────────────────────────────────────
class UserService {
  /**
   * Đăng ký tài khoản mới (role mặc định: CUSTOMER)
   */
  static async register(data = {}) {
    const { username, password, fullName, email, phoneNumber } = data;
    const safeUsername = validateUsername(username);
    const safePassword = validatePassword(password);
    const safeFullName = validateFullName(fullName);
    const safeEmail = validateEmail(email);
    const safePhoneNumber = validatePhoneNumber(phoneNumber);

    // Kiểm tra username đã tồn tại
    const existing = await UserModel.findByUsername(safeUsername);
    if (existing) {
      const err = new Error('Tên đăng nhập đã tồn tại, vui lòng chọn tên khác');
      err.statusCode = 409;
      throw err;
    }

    // Kiểm tra email đã tồn tại
    const emailUsed = await UserModel.findByEmail(safeEmail);
    if (emailUsed) {
      const err = new Error('Email này đã được sử dụng cho tài khoản khác');
      err.statusCode = 409;
      throw err;
    }

    const hashedPassword = createSaltedHash(safePassword);

    const userID = await UserModel.create({
      username: safeUsername,
      password: hashedPassword,
      fullName: safeFullName,
      email: safeEmail,
      phoneNumber: safePhoneNumber,
      role: 'CUSTOMER'
    });

    return { userID, username: safeUsername };
  }

  /**
   * Đăng nhập — trả về token + thông tin user
   */
  static async login(username, password) {
    const safeUsername = requiredString(username, 'Tên đăng nhập');
    const safePassword = requiredString(password, 'Mật khẩu');

    const user = await UserModel.findByUsername(safeUsername);
    if (!user) {
      const err = new Error('Tên đăng nhập hoặc mật khẩu không đúng');
      err.statusCode = 401;
      throw err;
    }

    const isValid = verifyPassword(safePassword, user.password);
    if (!isValid) {
      const err = new Error('Tên đăng nhập hoặc mật khẩu không đúng');
      err.statusCode = 401;
      throw err;
    }

    const token = generateToken(user);
    return {
      token,
      user: {
        userID: user.userID,
        username: user.username,
        fullName: user.fullName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: user.role
      }
    };
  }

  // ───────────────────────────────────────────────
  //  Profile Services (Customer)
  // ───────────────────────────────────────────────

  static async getProfile(userID) {
    const user = await UserModel.findById(userID);
    if (!user) {
      const err = new Error('Người dùng không tồn tại');
      err.statusCode = 404;
      throw err;
    }
    return user;
  }

  static async updateProfile(userID, data = {}) {
    const { fullName, email, phoneNumber } = data;
    const safeFullName = validateFullName(fullName);
    const safeEmail = validateEmail(email);
    const safePhoneNumber = validatePhoneNumber(phoneNumber);

    // Kiểm tra email có bị trùng với user khác không
    const emailUsed = await UserModel.findByEmail(safeEmail);
    if (emailUsed && emailUsed.userID !== userID) {
      const err = new Error('Email này đã được sử dụng cho tài khoản khác');
      err.statusCode = 409;
      throw err;
    }

    await UserModel.updateProfile(userID, {
      fullName: safeFullName,
      email: safeEmail,
      phoneNumber: safePhoneNumber
    });

    return await UserModel.findById(userID);
  }

  static async changePassword(userID, oldPassword, newPassword) {
    const safeOldPassword = requiredString(oldPassword, 'Mật khẩu cũ');
    const safeNewPassword = validatePassword(newPassword, 'Mật khẩu mới');

    // Lấy user với password (findByUsername cần userId)
    const [rows] = await require('../config/db').query(
      'SELECT * FROM User WHERE userID = ?', [userID]
    );
    const user = rows[0];
    if (!user) {
      const err = new Error('Người dùng không tồn tại'); err.statusCode = 404; throw err;
    }

    const isValid = verifyPassword(safeOldPassword, user.password);
    if (!isValid) {
      const err = new Error('Mật khẩu cũ không đúng');
      err.statusCode = 400;
      throw err;
    }

    const newHashed = createSaltedHash(safeNewPassword);
    await UserModel.updatePassword(userID, newHashed);
  }

  // ───────────────────────────────────────────────
  //  Address Services (Customer)
  // ───────────────────────────────────────────────

  static async getAddresses(userID) {
    return await AddressModel.getByUserId(userID);
  }

  static async addAddress(userID, data) {
    if (!data.city && !data.street) {
      const err = new Error('Vui lòng nhập ít nhất Tỉnh/Thành phố hoặc Đường');
      err.statusCode = 400;
      throw err;
    }
    const addressID = await AddressModel.create(userID, data);
    return { addressID, ...data };
  }

  static async updateAddress(addressID, userID, data) {
    const updated = await AddressModel.update(addressID, userID, data);
    if (!updated) {
      const err = new Error('Không tìm thấy địa chỉ hoặc bạn không có quyền sửa');
      err.statusCode = 404;
      throw err;
    }
    return updated;
  }

  static async deleteAddress(addressID, userID) {
    const deleted = await AddressModel.delete(addressID, userID);
    if (!deleted) {
      const err = new Error('Không tìm thấy địa chỉ hoặc bạn không có quyền xóa');
      err.statusCode = 404;
      throw err;
    }
    return deleted;
  }

  // ───────────────────────────────────────────────
  //  Admin Services
  // ───────────────────────────────────────────────

  static async getAllUsers() {
    return await UserModel.getAll();
  }

  static async deleteUser(targetID, adminID) {
    if (targetID === adminID) {
      const err = new Error('Bạn không thể tự xóa tài khoản của chính mình');
      err.statusCode = 400;
      throw err;
    }
    const target = await UserModel.findById(targetID);
    if (!target) {
      const err = new Error('Người dùng cần xóa không tồn tại');
      err.statusCode = 404;
      throw err;
    }
    await UserModel.deleteById(targetID);
  }
}

module.exports = UserService;
