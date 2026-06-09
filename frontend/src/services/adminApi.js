import { API_BASE_URL } from './apiConfig';
const API_URL = `${API_BASE_URL}/api/users`;

const getAdminHeaders = () => {
  const token = sessionStorage.getItem('adminToken');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const saveAdminSession = (data) => {
  sessionStorage.setItem('adminToken', data.token);
  sessionStorage.setItem('adminUser', JSON.stringify(data.user));
};

const readApiResult = async (response, fallbackMessage) => {
  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    throw new Error(`${fallbackMessage}. Backend chưa sẵn sàng hoặc chưa restart đúng code mới.`);
  }

  const result = await response.json();
  if (!response.ok) throw new Error(result.message || fallbackMessage);
  return result.data;
};

export const adminApi = {
  async login(username, password) {
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    const data = await readApiResult(response, 'Đăng nhập admin thất bại');

    if (data.user.role !== 'ADMIN') {
      throw new Error('Tài khoản này không có quyền quản trị');
    }

    saveAdminSession(data);
    return data;
  },

  logout() {
    sessionStorage.removeItem('adminToken');
    sessionStorage.removeItem('adminUser');
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
  },

  async getAllUsers() {
    const response = await fetch(`${API_URL}`, {
      headers: getAdminHeaders(),
    });
    return readApiResult(response, 'Lỗi lấy danh sách user');
  },

  async deleteUser(id) {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
      headers: getAdminHeaders(),
    });
    return readApiResult(response, 'Lỗi xóa user');
  },
};
