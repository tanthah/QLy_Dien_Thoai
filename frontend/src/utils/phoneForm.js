export const validatePhoneForm = (formData) => {
  if (!formData.productName.trim()) {
    return 'Vui lòng nhập tên điện thoại!';
  }

  if (!formData.brand.trim()) {
    return 'Vui lòng nhập thương hiệu!';
  }

  if (formData.price === '' || isNaN(formData.price) || Number(formData.price) < 0) {
    return 'Vui lòng nhập giá bán hợp lệ!';
  }

  if (
    formData.stock_quantity === '' ||
    isNaN(formData.stock_quantity) ||
    Number(formData.stock_quantity) < 0
  ) {
    return 'Vui lòng nhập số lượng hợp lệ!';
  }

  return null;
};

export const buildPhonePayload = (formData) => ({
  productName: formData.productName.trim(),
  brand: formData.brand.trim(),
  price: Number(formData.price),
  stock_quantity: Number(formData.stock_quantity),
  description: formData.description.trim(),
});
