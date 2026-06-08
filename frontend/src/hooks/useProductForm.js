import { useCallback, useState } from 'react';
import { createEmptyPhoneForm } from '../constants/phones';
import { phoneApi } from '../services/phoneApi';
import { mergeImageUrls, parseImageUrlInput } from '../utils/imageUrls';
import { buildPhonePayload, validatePhoneForm } from '../utils/phoneForm';

export const useProductForm = ({ onSaved, showToast }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentPhoneId, setCurrentPhoneId] = useState(null);
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [formData, setFormData] = useState(createEmptyPhoneForm);

  const closeModal = useCallback(() => {
    setIsOpen(false);
    setImageUrlInput('');
  }, []);

  const openAddModal = useCallback(() => {
    setFormData(createEmptyPhoneForm());
    setCurrentPhoneId(null);
    setImageUrlInput('');
    setIsEditing(false);
    setIsOpen(true);
  }, []);

  const openEditModal = useCallback(
    async (phone) => {
      try {
        const details = await phoneApi.getPhoneById(phone.productID);
        setFormData({
          productName: details.productName || '',
          brand: details.brand || '',
          price: details.price || '',
          stock_quantity: details.stock_quantity || '',
          description: details.description || '',
          images: details.images || [],
        });
        setCurrentPhoneId(phone.productID);
        setImageUrlInput('');
        setIsEditing(true);
        setIsOpen(true);
      } catch (err) {
        showToast('Không thể tải thông tin sản phẩm: ' + err.message, 'error');
      }
    },
    [showToast],
  );

  const handleInputChange = useCallback((event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }, []);

  const buildImagesForSubmit = useCallback(() => {
    const { urls, invalidUrls } = parseImageUrlInput(imageUrlInput);
    if (invalidUrls.length > 0) {
      return {
        images: [],
        error: 'Danh sách ảnh chứa URL không hợp lệ',
      };
    }

    return {
      images: mergeImageUrls(formData.images, urls),
      error: null,
    };
  }, [formData.images, imageUrlInput]);

  const handleAddImageUrl = useCallback(
    (event) => {
      event.preventDefault();
      const { urls, invalidUrls } = parseImageUrlInput(imageUrlInput);

      if (invalidUrls.length > 0) {
        showToast('Link ảnh không hợp lệ', 'error');
        return;
      }

      if (urls.length === 0) return;

      setFormData((prev) => ({
        ...prev,
        images: mergeImageUrls(prev.images, urls),
      }));
      setImageUrlInput('');
    },
    [imageUrlInput, showToast],
  );

  const handleImageUrlInputKeyDown = useCallback(
    (event) => {
      if (event.key === 'Enter') {
        handleAddImageUrl(event);
      }
    },
    [handleAddImageUrl],
  );

  const handleRemoveImageUrl = useCallback((index) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, imageIndex) => imageIndex !== index),
    }));
  }, []);

  const handleSubmit = useCallback(
    async (event) => {
      event.preventDefault();

      const validationMessage = validatePhoneForm(formData);
      if (validationMessage) {
        showToast(validationMessage, 'error');
        return;
      }

      const { images, error } = buildImagesForSubmit();
      if (error) {
        showToast(error, 'error');
        return;
      }

      try {
        const payload = buildPhonePayload(formData);

        if (isEditing) {
          await phoneApi.updatePhone(currentPhoneId, payload, images);
          showToast('Cập nhật điện thoại thành công!');
        } else {
          await phoneApi.createPhone(payload, images);
          showToast('Thêm điện thoại mới thành công!');
        }

        closeModal();
        onSaved();
      } catch (err) {
        showToast('Lỗi: ' + err.message, 'error');
      }
    },
    [buildImagesForSubmit, closeModal, currentPhoneId, formData, isEditing, onSaved, showToast],
  );

  return {
    openAddModal,
    openEditModal,
    modalProps: {
      isOpen,
      isEditing,
      formData,
      imageUrlInput,
      onClose: closeModal,
      onSubmit: handleSubmit,
      onInputChange: handleInputChange,
      onImageUrlInputChange: setImageUrlInput,
      onImageUrlInputKeyDown: handleImageUrlInputKeyDown,
      onAddImageUrl: handleAddImageUrl,
      onRemoveImageUrl: handleRemoveImageUrl,
    },
  };
};
