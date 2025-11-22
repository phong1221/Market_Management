import { useState, useEffect } from 'react';

// Global cart state
let globalCart = JSON.parse(localStorage.getItem('cart') || '[]');
let listeners = [];

const useCart = () => {
  const [cart, setCart] = useState(globalCart);

  useEffect(() => {
    // Add listener
    listeners.push(setCart);
    // Lắng nghe sự kiện storage để reset khi đăng xuất
    const handleStorage = () => {
      const newCart = JSON.parse(localStorage.getItem('cart') || '[]');
      globalCart = newCart;
      setCart(newCart);
    };
    window.addEventListener('storage', handleStorage);
    // Cleanup
    return () => {
      const index = listeners.indexOf(setCart);
      if (index > -1) {
        listeners.splice(index, 1);
      }
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  const updateCart = (newCart) => {
    globalCart = newCart;
    localStorage.setItem('cart', JSON.stringify(newCart));
    
    // Notify all listeners
    listeners.forEach(listener => listener(newCart));
  };

  const addToCart = (product) => {
    const existingItem = globalCart.find(item => item.idProduct === product.idProduct);
    
    if (existingItem) {
      const newCart = globalCart.map(item => 
        item.idProduct === product.idProduct 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
      updateCart(newCart);
    } else {
      const newCart = [...globalCart, { ...product, quantity: 1 }];
      updateCart(newCart);
    }
  };

  const removeFromCart = (productId) => {
    const newCart = globalCart.filter(item => item.idProduct !== productId);
    updateCart(newCart);
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    
    const newCart = globalCart.map(item => 
      item.idProduct === productId 
        ? { ...item, quantity }
        : item
    );
    updateCart(newCart);
  };

  const clearCart = () => {
    updateCart([]);
  };

  return {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    updateCart
  };
};

export default useCart; 