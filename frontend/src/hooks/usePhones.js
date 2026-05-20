import { useCallback, useEffect, useState } from 'react';
import { phoneApi } from '../services/phoneApi';

export const usePhones = ({ enabled, showToast }) => {
  const [phones, setPhones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [brandFilter, setBrandFilter] = useState('');

  const fetchPhones = useCallback(
    async (filters = {}) => {
      try {
        setLoading(true);
        const data = await phoneApi.getAllPhones(filters);
        setPhones(data);
      } catch (err) {
        showToast(err.message, 'error');
      } finally {
        setLoading(false);
      }
    },
    [showToast],
  );

  const refreshPhones = useCallback(() => {
    fetchPhones({ search, brand: brandFilter });
  }, [brandFilter, fetchPhones, search]);

  useEffect(() => {
    if (!enabled) return undefined;

    const delayDebounce = setTimeout(refreshPhones, 300);
    return () => clearTimeout(delayDebounce);
  }, [enabled, refreshPhones]);

  const deletePhone = useCallback(
    async (id) => {
      if (!window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này không?')) {
        return;
      }

      try {
        await phoneApi.deletePhone(id);
        showToast('Xóa điện thoại thành công!');
        refreshPhones();
      } catch (err) {
        showToast('Lỗi khi xóa: ' + err.message, 'error');
      }
    },
    [refreshPhones, showToast],
  );

  return {
    phones,
    loading,
    search,
    brandFilter,
    setSearch,
    setBrandFilter,
    refreshPhones,
    deletePhone,
  };
};
