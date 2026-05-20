import { useEffect, useMemo, useState } from 'react';

const CART_STORAGE_KEY = 'customerCart';

const getSavedCart = () => {
  const savedCart = localStorage.getItem(CART_STORAGE_KEY);
  return savedCart ? JSON.parse(savedCart) : [];
};

export const useCart = () => {
  const [items, setItems] = useState(getSavedCart);

  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addToCart = (phone) => {
    setItems((prev) => {
      const existingItem = prev.find((item) => item.productID === phone.productID);
      if (existingItem) {
        return prev.map((item) =>
          item.productID === phone.productID ? { ...item, quantity: item.quantity + 1 } : item,
        );
      }

      return [
        ...prev,
        {
          productID: phone.productID,
          productName: phone.productName,
          brand: phone.brand,
          price: phone.price,
          stock_quantity: phone.stock_quantity,
          image: phone.images?.[0] || '',
          quantity: 1,
        },
      ];
    });
  };

  const updateQuantity = (productID, quantity) => {
    const nextQuantity = Math.max(1, Number(quantity) || 1);
    setItems((prev) =>
      prev.map((item) =>
        item.productID === productID ? { ...item, quantity: nextQuantity } : item,
      ),
    );
  };

  const removeFromCart = (productID) => {
    setItems((prev) => prev.filter((item) => item.productID !== productID));
  };

  const clearCart = () => {
    setItems([]);
  };

  const summary = useMemo(
    () => ({
      totalItems: items.reduce((total, item) => total + item.quantity, 0),
      totalPrice: items.reduce((total, item) => total + item.price * item.quantity, 0),
    }),
    [items],
  );

  return {
    items,
    ...summary,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
  };
};
