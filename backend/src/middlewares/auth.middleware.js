const response = require('../utils/response');

/**
 * Middleware: Xác thực token từ header Authorization
 * Token là Base64-encoded JSON chứa: { userID, username, role, iat }
 * Sau khi xác thực thành công → gắn req.user để các handler sau dùng
 */
const authenticate = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return response.error(res, 'Bạn cần đăng nhập để thực hiện thao tác này', 401);
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = JSON.parse(Buffer.from(token, 'base64').toString('utf8'));

    if (!decoded.userID || !decoded.role) {
      return response.error(res, 'Token không hợp lệ', 401);
    }

    req.user = decoded;
    next();
  } catch (err) {
    return response.error(res, 'Token không hợp lệ hoặc đã hết hạn', 401);
  }
};

/**
 * Middleware: Kiểm tra quyền Admin
 * Phải dùng sau middleware `authenticate`
 */
const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'ADMIN') {
    return response.error(res, 'Bạn không có quyền truy cập chức năng này', 403);
  }
  next();
};

module.exports = { authenticate, requireAdmin };
