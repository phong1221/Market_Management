import { useState, useEffect } from 'react';

export const useAuth = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(localStorage.getItem('isLoggedIn') === 'true');
  const [role, setRole] = useState(localStorage.getItem('role'));
  const [user, setUser] = useState(() => {
    const userData = localStorage.getItem('user');
    return userData ? JSON.parse(userData) : null;
  });

  useEffect(() => {
    const handleLoginStatusChange = () => {
      const newIsLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
      const newRole = localStorage.getItem('role');
      const userData = localStorage.getItem('user');
      const newUser = userData ? JSON.parse(userData) : null;
      
      setIsLoggedIn(newIsLoggedIn);
      setRole(newRole);
      setUser(newUser);
    };

    const handleStorageChange = () => {
      const newIsLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
      const newRole = localStorage.getItem('role');
      const userData = localStorage.getItem('user');
      const newUser = userData ? JSON.parse(userData) : null;
      
      setIsLoggedIn(newIsLoggedIn);
      setRole(newRole);
      setUser(newUser);
    };

    window.addEventListener('userLoginStatusChanged', handleLoginStatusChange);
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('userLoginStatusChanged', handleLoginStatusChange);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const login = (userData, userRole = 'user') => {
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('userToken', 'user-token');
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('role', userRole);
    
    setUser(userData);
    setIsLoggedIn(true);
    setRole(userRole);
    
    window.dispatchEvent(new CustomEvent('userLoginStatusChanged'));
  };

  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('userToken');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('role');
    localStorage.removeItem('cart');
    localStorage.removeItem('wishlist');
    
    setUser(null);
    setIsLoggedIn(false);
    setRole(null);
    
    window.dispatchEvent(new CustomEvent('userLoginStatusChanged'));
  };

  return {
    isLoggedIn,
    role,
    user,
    login,
    logout
  };
}; 