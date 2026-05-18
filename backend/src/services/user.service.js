const crypto = require('crypto');
const UserModel = require('../models/user.model');
const AddressModel = require('../models/address.model');

// ───────────────────────────────────────────────
//  Utility: hash password với SHA-256 + salt
// ───────────────────────────────────────────────
const hashPassword = (password, salt) => {
  return crypto.createHmac('sha256', salt).update(password).digest('hex');
};

const createSaltedHash = (password) => {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = hashPassword(password, salt);
  return `${salt}:${hash}`;
};

const verifyPassword = (password, storedHash) => {
  const [salt, hash] = storedHash.split(':');
  const inputHash = hashPassword(password, salt);
  return inputHash === hash;
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
  static async register(data) {
    const { username, password, fullName, email, phoneNumber } = data;

    if (!username || username.trim().length < 3) {
      const err = new Error('Tên đăng nhập phải có ít nhất 3 ký tự');
      err.statusCode = 400;
      throw err;
    }
    if (!password || password.length < 6) {
      const err = new Error('Mật khẩu phải có ít nhất 6 ký tự');
      err.statusCode = 400;
      throw err;
    }

    // Kiểm tra username đã tồn tại
    const existing = await UserModel.findByUsername(username.trim());
    if (existing) {
      const err = new Error('Tên đăng nhập đã tồn tại, vui lòng chọn tên khác');
      err.statusCode = 409;
      throw err;
    }

    // Kiểm tra email đã tồn tại
    if (email && email.trim()) {
      const emailUsed = await UserModel.findByEmail(email.trim());
      if (emailUsed) {
        const err = new Error('Email này đã được sử dụng cho tài khoản khác');
        err.statusCode = 409;
        throw err;
      }
    }

    const hashedPassword = createSaltedHash(password);
    // Tài khoản có username là 'admin' mặc định được cấp quyền ADMIN
    const assignedRole = username.trim() === 'admin' ? 'ADMIN' : 'CUSTOMER';

    const userID = await UserModel.create({
      username: username.trim(),
      password: hashedPassword,
      fullName: fullName ? fullName.trim() : null,
      email: email ? email.trim() : null,
      phoneNumber: phoneNumber ? phoneNumber.trim() : null,
      role: assignedRole
    });

    return { userID, username: username.trim() };
  }

  /**
   * Đăng nhập — trả về token + thông tin user
   */
  static async login(username, password) {
    if (!username || !password) {
      const err = new Error('Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu');
      err.statusCode = 400;
      throw err;
    }

    const user = await UserModel.findByUsername(username.trim());
    if (!user) {
      const err = new Error('Tên đăng nhập hoặc mật khẩu không đúng');
      err.statusCode = 401;
      throw err;
    }

    const isValid = verifyPassword(password, user.password);
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

  static async updateProfile(userID, data) {
    const { fullName, email, phoneNumber } = data;

    // Kiểm tra email có bị trùng với user khác không
    if (email && email.trim()) {
      const emailUsed = await UserModel.findByEmail(email.trim());
      if (emailUsed && emailUsed.userID !== userID) {
        const err = new Error('Email này đã được sử dụng cho tài khoản khác');
        err.statusCode = 409;
        throw err;
      }
    }

    await UserModel.updateProfile(userID, {
      fullName: fullName ? fullName.trim() : null,
      email: email ? email.trim() : null,
      phoneNumber: phoneNumber ? phoneNumber.trim() : null
    });

    return await UserModel.findById(userID);
  }

  static async changePassword(userID, oldPassword, newPassword) {
    if (!oldPassword || !newPassword) {
      const err = new Error('Vui lòng nhập đầy đủ mật khẩu cũ và mật khẩu mới');
      err.statusCode = 400;
      throw err;
    }
    if (newPassword.length < 6) {
      const err = new Error('Mật khẩu mới phải có ít nhất 6 ký tự');
      err.statusCode = 400;
      throw err;
    }

    // Lấy user với password (findByUsername cần userId)
    const [rows] = await require('../config/db').query(
      'SELECT * FROM User WHERE userID = ?', [userID]
    );
    const user = rows[0];
    if (!user) {
      const err = new Error('Người dùng không tồn tại'); err.statusCode = 404; throw err;
    }

    const isValid = verifyPassword(oldPassword, user.password);
    if (!isValid) {
      const err = new Error('Mật khẩu cũ không đúng');
      err.statusCode = 400;
      throw err;
    }

    const newHashed = createSaltedHash(newPassword);
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
