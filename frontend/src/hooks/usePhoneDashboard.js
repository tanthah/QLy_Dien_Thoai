import { usePhones } from './usePhones';
import { useProductForm } from './useProductForm';

export const usePhoneDashboard = ({ enabled, showToast }) => {
  const phones = usePhones({ enabled, showToast });
  const productForm = useProductForm({
    onSaved: phones.refreshPhones,
    showToast,
  });

  return {
    dashboardProps: {
      phones: phones.phones,
      loading: phones.loading,
      search: phones.search,
      brandFilter: phones.brandFilter,
      onSearchChange: phones.setSearch,
      onBrandFilterChange: phones.setBrandFilter,
      onAddPhone: productForm.openAddModal,
      onEditPhone: productForm.openEditModal,
      onDeletePhone: phones.deletePhone,
    },
    productModalProps: productForm.modalProps,
  };
};
