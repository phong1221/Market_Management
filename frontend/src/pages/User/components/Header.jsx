import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaUser, FaShoppingCart, FaSearch, FaHeart, FaUserCircle, FaSignOutAlt, FaHistory } from 'react-icons/fa';
import { BiStore } from 'react-icons/bi';
import Login from '../pages/Login';
import { toast } from 'react-toastify';
import { useAuth } from '../../../hooks/useAuth.js';
import useCart from '../../../hooks/useCart.js';
import useWishlist from '../../../hooks/useWishlist.js';
import '../css/header.css';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef(null);
  
  // Debug logs
  console.log('UserHeader component rendered');
  console.log('User login state:', {
    user: user,
    isLoggedIn: !!user,
    role: localStorage.getItem('role')
  });

  useEffect(() => {
    // Nếu không phải trang Home, luôn coi như đã scroll
    if (location.pathname !== '/user/home') {
      setIsScrolled(true);
      return;
    }
    // Nếu là Home, reset về false ngay lập tức
    setIsScrolled(false);
    // Ở Home mới dùng hiệu ứng scroll
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      if (scrollTop > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [location.pathname]);

  // Lấy số lượng real-time từ hook
  const { cart } = useCart();
  const { wishlist } = useWishlist();

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleUserMenuToggle = () => {
    if (user) {
      setShowUserMenu(!showUserMenu);
    } else {
      setShowLogin(true);
    }
  };

  const handleLogout = () => {
    logout();
    // Reset localStorage và global state
    localStorage.removeItem('wishlist');
    localStorage.removeItem('cart');
    window.dispatchEvent(new Event('storage'));
    setShowUserMenu(false);
    toast.success('Đăng xuất thành công!');
    navigate('/user/home');
  };

  const handleAccountInfo = () => {
    setShowUserMenu(false);
    navigate('/user/account');
  };

  const handleOrderHistory = () => {
    setShowUserMenu(false);
    navigate('/user/orders');
  };

  // SỬA: Nếu chưa đăng nhập thì mở modal đăng nhập, nếu đã đăng nhập thì chuyển trang
  const handleWishlistClick = () => {
    if (!user) {
      setShowLogin(true);
    } else {
      navigate('/user/wishlist');
    }
  };

  const handleCartClick = () => {
    if (!user) {
      setShowLogin(true);
    } else {
      navigate('/user/cart');
    }
  };

  return (
    <header className={`header-user ${isScrolled ? 'scrolled' : ''}`}>
      <Link to="/user/home" className="logo" style={{textDecoration:'none', color:'#fff'}}>
        <BiStore className="logo-icon" />
        HomeMart
      </Link>
      <nav className="nav">
        <Link to="/user/groceries"><FaSearch className="nav-icon" /> Đồ Ăn</Link>
        <Link to="/user/produce"><FaSearch className="nav-icon" /> Đồ Gia Dụng</Link>
        <Link to="/user/household"><FaSearch className="nav-icon" /> Quà Tặng</Link>
        <Link to="/user/organic"><FaSearch className="nav-icon" /> Hoa Quả</Link>
      </nav>
      <div className="icons">
        <span 
          className="icon" 
          title="Wishlist"
          onClick={handleWishlistClick}
          style={{cursor: 'pointer'}}
        >
          <FaHeart />
          {wishlist.length > 0 && <span className="badge">{wishlist.length}</span>}
        </span>
        <span 
          className="icon" 
          title="Shopping Cart"
          onClick={handleCartClick}
          style={{cursor: 'pointer'}}
        >
          <FaShoppingCart />
          {cart.length > 0 && <span className="badge">{cart.length}</span>}
        </span>
        <div className="user-menu-container" ref={userMenuRef}>
          <span 
            className="icon" 
            title="User Account" 
            onClick={handleUserMenuToggle}
            style={{cursor: 'pointer'}}
          >
            <FaUser />
          </span>
          
          {showUserMenu && (
            <div className="user-dropdown-menu">
              <div className="user-menu-header">
                <FaUserCircle className="user-avatar" />
                                 <div className="user-info">
                   <div className="user-name">
                     {user?.nameUser || 'User'}
                   </div>
                   <div className="user-email">
                     {user?.email || 'user@example.com'}
                   </div>
                 </div>
              </div>
              <div className="user-menu-items">
                <div 
                  className="menu-item"
                  onClick={handleAccountInfo}
                >
                  <FaUserCircle className="menu-icon" />
                  <span>Thông tin cá nhân</span>
                </div>
                <div 
                  className="menu-item"
                  onClick={handleOrderHistory}
                >
                  <FaHistory className="menu-icon" />
                  <span>Lịch sử đơn hàng</span>
                </div>
                <div 
                  className="menu-item"
                  onClick={handleLogout}
                >
                  <FaSignOutAlt className="menu-icon" />
                  <span>Đăng xuất</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      {showLogin && (
        <div className="login-modal">
          <div
            className="login-modal-overlay"
            onClick={() => setShowLogin(false)}
            style={{
              position: 'fixed',
              top: 0, left: 0, width: '100vw', height: '100vh',
              zIndex: 9999
            }}
          />
          <div className="login-modal-content">
            <button
              className="login-modal-close"
              style={{
                right: '18px',
                left: 'auto',
                top: '18px',
                zIndex: 10001,
                position: 'absolute'
              }}
              onClick={() => setShowLogin(false)}
            >×</button>
            <Login isModal={true} />
          </div>
        </div>
      )}
    </header>
  );
};

export default Header; 