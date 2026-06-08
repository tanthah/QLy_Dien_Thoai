const API_URL = 'http://localhost:5000/api/phones';

const getAdminHeaders = () => {
  const token = sessionStorage.getItem('adminToken');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const phoneApi = {
  /**
   * Get all phones with optional search and brand filters
   * @param {Object} filters - { search, brand }
   */
  async getAllPhones(filters = {}) {
    const params = new URLSearchParams();
    if (filters.search) params.append('search', filters.search);
    if (filters.brand) params.append('brand', filters.brand);

    const response = await fetch(`${API_URL}?${params.toString()}`);
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || 'Failed to fetch phones');
    }
    return result.data;
  },

  /**
   * Get detail of a specific phone by ID
   * @param {string} id 
   */
  async getPhoneById(id) {
    const response = await fetch(`${API_URL}/${id}`);
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || 'Failed to fetch phone details');
    }
    return result.data;
  },

  /**
   * Create a new phone with its images
   * @param {Object} phoneData - { productName, brand, price, stock_quantity, description }
   * @param {Array<string>} images - Array of image URL strings
   */
  async createPhone(phoneData, images) {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: getAdminHeaders(),
      body: JSON.stringify({ ...phoneData, images }),
    });
    
    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.message || 'Failed to create phone');
    }
    return result.data;
  },

  /**
   * Update a phone's details and images
   * @param {string} id 
   * @param {Object} phoneData - { productName, brand, price, stock_quantity, description }
   * @param {Array<string>} images - Array of image URL strings
   */
  async updatePhone(id, phoneData, images) {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: getAdminHeaders(),
      body: JSON.stringify({ ...phoneData, images }),
    });

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.message || 'Failed to update phone');
    }
    return result.data;
  },

  /**
   * Delete a phone by its ID
   * @param {string} id 
   */
  async deletePhone(id) {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
      headers: getAdminHeaders(),
    });

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.message || 'Failed to delete phone');
    }
    return result.data;
  }
};
