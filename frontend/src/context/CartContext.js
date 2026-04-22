import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    try { return JSON.parse(localStorage.getItem('farmspice_cart')) || []; } catch { return []; }
  });

  useEffect(() => {
    localStorage.setItem('farmspice_cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product, qty = 1) => {
    setCart(prev => {
      const existing = prev.find(item => item._id === product._id);
      if (existing) {
        return prev.map(item =>
          item._id === product._id ? { ...item, qty: Math.min(item.qty + qty, 10) } : item
        );
      }
      return [...prev, { ...product, qty }];
    });
  };

  const removeFromCart = (productId) => {
    setCart(prev => prev.filter(item => item._id !== productId));
  };

  const updateQty = (productId, qty) => {
    if (qty < 1) return removeFromCart(productId);
    setCart(prev => prev.map(item => item._id === productId ? { ...item, qty } : item));
  };

  const clearCart = () => setCart([]);

  const cartCount = cart.reduce((sum, item) => sum + item.qty, 0);
  const cartSubtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const cartShipping = cartSubtotal >= 500 ? 0 : 49;
  const cartTotal = cartSubtotal + cartShipping;

  return (
    <CartContext.Provider value={{
      cart, addToCart, removeFromCart, updateQty, clearCart,
      cartCount, cartSubtotal, cartShipping, cartTotal
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};
