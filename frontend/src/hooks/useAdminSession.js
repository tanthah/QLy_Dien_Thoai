import { useCallback, useEffect, useState } from 'react';
import { adminApi } from '../services/adminApi';

export const useAdminSession = (showToast) => {
  const [adminUser, setAdminUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    adminApi.logout();
  }, []);

  const login = useCallback(async (username, password) => {
    try {
      setLoading(true);
      setError('');
      const data = await adminApi.login(username, password);
      setAdminUser(data.user);
      showToast('Đăng nhập quản trị thành công');
      return data;
    } catch (err) {
      setError(err.message);
      setAdminUser(null);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  const logout = useCallback(() => {
    adminApi.logout();
    setAdminUser(null);
    setError('');
    showToast('Đã đăng xuất admin');
  }, [showToast]);

  return {
    adminUser,
    loading,
    error,
    login,
    logout,
  };
};
