const UserService = require('../services/user.service');
const response = require('../utils/response');

class UserController {
  // POST /api/users/register
  static async register(req, res, next) {
    try {
      const { username, password, fullName, email, phoneNumber } = req.body;
      const result = await UserService.register({ username, password, fullName, email, phoneNumber });
      return response.success(res, 'Đăng ký tài khoản thành công!', result, 201);
    } catch (err) {
      next(err);
    }
  }

  // POST /api/users/login
  static async login(req, res, next) {
    try {
      const { username, password } = req.body;
      const result = await UserService.login(username, password);
      return response.success(res, 'Đăng nhập thành công!', result);
    } catch (err) {
      next(err);
    }
  }

  // GET /api/users/me
  static async getProfile(req, res, next) {
    try {
      const user = await UserService.getProfile(req.user.userID);
      return response.success(res, 'Lấy thông tin thành công', user);
    } catch (err) {
      next(err);
    }
  }

  // PUT /api/users/me
  static async updateProfile(req, res, next) {
    try {
      const { fullName, email, phoneNumber } = req.body;
      const updated = await UserService.updateProfile(req.user.userID, { fullName, email, phoneNumber });
      return response.success(res, 'Cập nhật thông tin thành công!', updated);
    } catch (err) {
      next(err);
    }
  }

  // PUT /api/users/me/password
  static async changePassword(req, res, next) {
    try {
      const { oldPassword, newPassword } = req.body;
      await UserService.changePassword(req.user.userID, oldPassword, newPassword);
      return response.success(res, 'Đổi mật khẩu thành công!', null);
    } catch (err) {
      next(err);
    }
  }

  // GET /api/users/me/addresses
  static async getAddresses(req, res, next) {
    try {
      const addresses = await UserService.getAddresses(req.user.userID);
      return response.success(res, 'Lấy danh sách địa chỉ thành công', addresses);
    } catch (err) {
      next(err);
    }
  }

  // POST /api/users/me/addresses
  static async addAddress(req, res, next) {
    try {
      const { city, ward, street, houseNumber } = req.body;
      const address = await UserService.addAddress(req.user.userID, { city, ward, street, houseNumber });
      return response.success(res, 'Thêm địa chỉ thành công!', address, 201);
    } catch (err) {
      next(err);
    }
  }

  // PUT /api/users/me/addresses/:id
  static async updateAddress(req, res, next) {
    try {
      const { id } = req.params;
      const { city, ward, street, houseNumber } = req.body;
      await UserService.updateAddress(id, req.user.userID, { city, ward, street, houseNumber });
      return response.success(res, 'Cập nhật địa chỉ thành công!', null);
    } catch (err) {
      next(err);
    }
  }

  // DELETE /api/users/me/addresses/:id
  static async deleteAddress(req, res, next) {
    try {
      const { id } = req.params;
      await UserService.deleteAddress(id, req.user.userID);
      return response.success(res, 'Xóa địa chỉ thành công!', null);
    } catch (err) {
      next(err);
    }
  }

  // GET /api/users  (Admin only)
  static async getAllUsers(req, res, next) {
    try {
      const users = await UserService.getAllUsers();
      return response.success(res, 'Lấy danh sách người dùng thành công', users);
    } catch (err) {
      next(err);
    }
  }

  // DELETE /api/users/:id  (Admin only)
  static async deleteUser(req, res, next) {
    try {
      const { id } = req.params;
      await UserService.deleteUser(id, req.user.userID);
      return response.success(res, 'Xóa người dùng thành công!', null);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = UserController;
