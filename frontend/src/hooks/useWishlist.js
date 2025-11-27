import { useState, useEffect } from 'react';

// Global wishlist state
let globalWishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
let listeners = [];

const useWishlist = () => {
  const [wishlist, setWishlist] = useState(globalWishlist);

  useEffect(() => {
    // Add listener
    listeners.push(setWishlist);
    // Lắng nghe sự kiện storage để reset khi đăng xuất
    const handleStorage = () => {
      const newWishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
      globalWishlist = newWishlist;
      setWishlist(newWishlist);
    };
    window.addEventListener('storage', handleStorage);
    // Cleanup
    return () => {
      const index = listeners.indexOf(setWishlist);
      if (index > -1) {
        listeners.splice(index, 1);
      }
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  const updateWishlist = (newWishlist) => {
    globalWishlist = newWishlist;
    localStorage.setItem('wishlist', JSON.stringify(newWishlist));
    
    // Notify all listeners
    listeners.forEach(listener => listener(newWishlist));
  };

  const addToWishlist = (product) => {
    const isInWishlist = globalWishlist.some(item => item.idProduct === product.idProduct);
    
    if (!isInWishlist) {
      const newWishlist = [...globalWishlist, product];
      updateWishlist(newWishlist);
    }
  };

  const removeFromWishlist = (productId) => {
    const newWishlist = globalWishlist.filter(item => item.idProduct !== productId);
    updateWishlist(newWishlist);
  };

  const toggleWishlist = (product) => {
    const isInWishlist = globalWishlist.some(item => item.idProduct === product.idProduct);
    
    if (isInWishlist) {
      removeFromWishlist(product.idProduct);
    } else {
      addToWishlist(product);
    }
  };

  const clearWishlist = () => {
    updateWishlist([]);
  };

  return {
    wishlist,
    addToWishlist,
    removeFromWishlist,
    toggleWishlist,
    clearWishlist,
    updateWishlist
  };
};

export default useWishlist; 