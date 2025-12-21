import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  FaUser, FaShoppingCart, FaSearch, FaHeart, FaUserCircle, FaSignOutAlt, FaHistory, FaChevronDown,
  FaUtensils, FaHome, FaAppleAlt, FaGift, FaLaptop, FaTshirt, FaPumpSoap, FaInfoCircle, FaEnvelope, FaTh
} from 'react-icons/fa';
import { BiStore } from 'react-icons/bi';
import Login from '../pages/Login';
import { toast } from 'react-toastify';
import { useAuth } from '../../../hooks/useAuth.js';
import useCart from '../../../hooks/useCart.js';
import useWishlist from '../../../hooks/useWishlist.js';
import { fetchTypeProduct } from '../../../services/typeProductService';
import '../css/header.css';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);
  const [typeProducts, setTypeProducts] = useState([]);
  const userMenuRef = useRef(null);
  const categoryMenuRef = useRef(null);

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

  // Load type products
  useEffect(() => {
    const loadTypeProducts = async () => {
      try {
        const types = await fetchTypeProduct();
        setTypeProducts(types);
      } catch (error) {
        console.error('Error loading type products:', error);
      }
    };
    loadTypeProducts();
  }, []);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
      if (categoryMenuRef.current && !categoryMenuRef.current.contains(event.target)) {
        setShowCategoryMenu(false);
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

  // Hàm lấy icon cho từng typeproduct
  const getTypeIcon = (type) => {
    const nameType = type.nameType?.toLowerCase() || '';
    const idType = type.idType;

    // Map icon dựa trên tên hoặc id
    if (nameType.includes('thức ăn') || nameType.includes('food') || idType === 1) {
      return <FaUtensils />;
    } else if (nameType.includes('gia dụng') || nameType.includes('household') || idType === 2) {
      return <FaHome />;
    } else if (nameType.includes('hoa quả') || nameType.includes('fruit') || nameType.includes('organic') || idType === 3) {
      return <FaAppleAlt />;
    } else if (nameType.includes('quà') || nameType.includes('gift') || idType === 4) {
      return <FaGift />;
    } else if (nameType.includes('điện tử') || nameType.includes('electronic') || idType === 5) {
      return <FaLaptop />;
    } else if (nameType.includes('thời trang') || nameType.includes('fashion') || idType === 6) {
      return <FaTshirt />;
    } else if (nameType.includes('mỹ phẩm') || nameType.includes('cosmetic') || idType === 7) {
      return <FaPumpSoap />;
    }
    // Default icon
    return <FaTh />;
  };

  return (
    <header className={`header-user ${isScrolled ? 'scrolled' : ''}`}>
      <Link to="/user/home" className="logo" style={{ textDecoration: 'none', color: '#fff' }}>
        <BiStore className="logo-icon" />
        HomeMart
      </Link>
      <nav className="nav">
        <Link to="/user/store-info" className="nav-link">
          <FaInfoCircle className="nav-icon" /> Store Information
        </Link>
        <Link to="/user/contact" className="nav-link">
          <FaEnvelope className="nav-icon" /> Contact Us
        </Link>
        <Link to="/user/coupons" className="nav-link">
          <FaGift className="nav-icon" /> Mã giảm giá
        </Link>
        <div
          className="nav-category-dropdown"
          ref={categoryMenuRef}
        >
          <div
            className="nav-category-trigger"
            onClick={() => setShowCategoryMenu(!showCategoryMenu)}
          >
            <FaTh className="nav-icon" />
            <span>Categories</span>
            <FaChevronDown className={`nav-category-icon ${showCategoryMenu ? 'rotated' : ''}`} />
          </div>
          {showCategoryMenu && (
            <div className="nav-category-menu">
              {typeProducts.length > 0 ? (
                <div className="nav-category-grid">
                  {typeProducts.map((type) => (
                    <Link
                      key={type.idType}
                      to={`/user/category/${type.idType}`}
                      className="nav-category-item"
                      onClick={() => setShowCategoryMenu(false)}
                    >
                      <span className="nav-category-icon-wrapper">
                        {getTypeIcon(type)}
                      </span>
                      <span className="nav-category-text">{type.nameType}</span>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="nav-category-loading">Loading categories...</div>
              )}
            </div>
          )}
        </div>
      </nav>
      <div className="icons">
        <span
          className="icon"
          title="Wishlist"
          onClick={handleWishlistClick}
          style={{ cursor: 'pointer' }}
        >
          <FaHeart />
          {wishlist.length > 0 && <span className="badge">{wishlist.length}</span>}
        </span>
        <span
          className="icon"
          title="Shopping Cart"
          onClick={handleCartClick}
          style={{ cursor: 'pointer' }}
        >
          <FaShoppingCart />
          {cart.length > 0 && <span className="badge">{cart.length}</span>}
        </span>
        <div className="user-menu-container" ref={userMenuRef}>
          <span
            className="icon"
            title="User Account"
            onClick={handleUserMenuToggle}
            style={{ cursor: 'pointer' }}
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