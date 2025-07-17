import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaUser, FaShoppingCart, FaSearch, FaHeart } from 'react-icons/fa';
import { BiStore } from 'react-icons/bi';
import Login from '../pages/Login.jsx'; // Đường dẫn này đúng với cấu trúc của bạn

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

  useEffect(() => {
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
  }, []);

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
        <span className="icon" title="Wishlist">
          <FaHeart />
        </span>
        <span className="icon" title="Shopping Cart">
          <FaShoppingCart />
        </span>
        <span className="icon" title="User Account" onClick={() => setShowLogin(true)} style={{cursor: 'pointer'}}>
          <FaUser />
        </span>
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