export const PHONE_BRANDS = ['Apple', 'Samsung', 'Xiaomi', 'Oppo', 'Vivo', 'Realme'];

export const PHONE_FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3';

export const PHONE_FALLBACK_THUMBNAIL =
  'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=100&auto=format&fit=crop&q=60';

export const createEmptyPhoneForm = () => ({
  productName: '',
  brand: '',
  price: '',
  stock_quantity: '',
  description: '',
  images: [],
});
