import { API_BASE_URL } from './apiConfig';
const API_URL = `${API_BASE_URL}/api/users`;

const cleanText = (value = '') => (typeof value === 'string' ? value : '').trim();
const normalizePhoneNumber = (phoneNumber = '') => cleanText(phoneNumber).replace(/[\s.-]/g, '');

const normalizeAuthData = (data = {}) => ({
  username: cleanText(data.username),
  password: cleanText(data.password),
  fullName: cleanText(data.fullName),
  email: cleanText(data.email).toLowerCase(),
  phoneNumber: normalizePhoneNumber(data.phoneNumber)
});

const normalizeProfileData = (data = {}) => ({
  fullName: cleanText(data.fullName),
  email: cleanText(data.email).toLowerCase(),
  phoneNumber: normalizePhoneNumber(data.phoneNumber)
});

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

export const userApi = {
  // Auth
  async register(data) {
    const response = await fetch(`${API_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(normalizeAuthData(data)),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || 'Lỗi đăng ký');
    return result.data;
  },

  async login(username, password) {
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: cleanText(username), password: cleanText(password) }),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || 'Lỗi đăng nhập');
    
    // Save token
    localStorage.setItem('token', result.data.token);
    localStorage.setItem('user', JSON.stringify(result.data.user));
    
    return result.data;
  },

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  // Profile
  async getProfile() {
    const response = await fetch(`${API_URL}/me`, {
      headers: getAuthHeaders(),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || 'Lỗi lấy thông tin');
    return result.data;
  },

  async updateProfile(data) {
    const response = await fetch(`${API_URL}/me`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(normalizeProfileData(data)),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || 'Lỗi cập nhật thông tin');
    return result.data;
  },

  async changePassword(oldPassword, newPassword) {
    const response = await fetch(`${API_URL}/me/password`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ oldPassword: cleanText(oldPassword), newPassword: cleanText(newPassword) }),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || 'Lỗi đổi mật khẩu');
    return result.data;
  },

  // Addresses
  async getAddresses() {
    const response = await fetch(`${API_URL}/me/addresses`, {
      headers: getAuthHeaders(),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || 'Lỗi lấy địa chỉ');
    return result.data;
  },

  async addAddress(data) {
    const response = await fetch(`${API_URL}/me/addresses`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || 'Lỗi thêm địa chỉ');
    return result.data;
  },

  async updateAddress(id, data) {
    const response = await fetch(`${API_URL}/me/addresses/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || 'Lỗi cập nhật địa chỉ');
    return result.data;
  },

  async deleteAddress(id) {
    const response = await fetch(`${API_URL}/me/addresses/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || 'Lỗi xóa địa chỉ');
    return result.data;
  },

  // Admin
  async getAllUsers() {
    const response = await fetch(`${API_URL}`, {
      headers: getAuthHeaders(),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || 'Lỗi lấy danh sách user');
    return result.data;
  },

  async deleteUser(id) {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || 'Lỗi xóa user');
    return result.data;
  }
};
