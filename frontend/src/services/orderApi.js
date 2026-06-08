const API_URL = 'http://localhost:5000/api/orders';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

export const orderApi = {
  async placeOrder(orderData) {
    const response = await fetch(`${API_URL}`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(orderData),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || 'Lỗi đặt hàng');
    return result.data;
  },

  async getMyOrders() {
    const response = await fetch(`${API_URL}/my-orders`, {
      headers: getAuthHeaders(),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || 'Lỗi lấy lịch sử đơn hàng');
    return result.data;
  }
};
