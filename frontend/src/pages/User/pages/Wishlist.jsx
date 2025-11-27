import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaHeart, FaTrash, FaShoppingCart, FaArrowLeft } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useAuth } from '../../../hooks/useAuth.js';
import useCart from '../../../hooks/useCart.js';
import useWishlist from '../../../hooks/useWishlist.js';
import '../css/wishlist.css';

const Wishlist = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cart, addToCart } = useCart();
  const { wishlist, removeFromWishlist, clearWishlist } = useWishlist();

  useEffect(() => {
    console.log('Wishlist useEffect triggered, user:', user);
    // Kiểm tra đăng nhập
    if (!user) {
      toast.error('Vui lòng đăng nhập để xem Wishlist!');
      navigate('/user/home');
      return;
    }
  }, [user, navigate]);



  const handleRemoveFromWishlist = (productId) => {
    removeFromWishlist(productId);
    toast.success('Đã xóa khỏi Wishlist!', {
      position: "top-right",
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  };

  const handleAddToCart = (product) => {
    addToCart(product);
    toast.success('Đã thêm vào giỏ hàng!', {
      position: "top-right",
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  };

  const handleMoveAllToCart = () => {
    if (wishlist.length === 0) {
      toast.info('Wishlist trống!');
      return;
    }

    wishlist.forEach(product => {
      addToCart(product);
    });

    clearWishlist();
    toast.success('Đã chuyển tất cả sản phẩm vào giỏ hàng!', {
      position: "top-right",
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  };

  const handleClearWishlist = () => {
    if (wishlist.length === 0) {
      toast.info('Wishlist trống!');
      return;
    }

    clearWishlist();
    toast.success('Đã xóa tất cả sản phẩm khỏi Wishlist!', {
      position: "top-right",
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  };

  if (!user) {
    return null;
  }

  return (
    <div className="wishlist-page">

      
      <div className="wishlist-container">
        <div className="wishlist-header">
          <button className="back-btn" onClick={() => navigate('/user/home')}>
            <FaArrowLeft /> Quay lại
          </button>
          <h1 className="wishlist-title">
            <FaHeart className="title-icon" />
            Wishlist của tôi
          </h1>
          <div className="wishlist-actions">
            <button 
              className="action-btn move-all-btn"
              onClick={handleMoveAllToCart}
              disabled={wishlist.length === 0}
            >
              <FaShoppingCart /> Chuyển tất cả vào giỏ hàng
            </button>
            <button 
              className="action-btn clear-btn"
              onClick={handleClearWishlist}
              disabled={wishlist.length === 0}
            >
              <FaTrash /> Xóa tất cả
            </button>
          </div>
        </div>

        {wishlist.length === 0 ? (
          <div className="empty-wishlist">
            <FaHeart className="empty-icon" />
            <h2>Wishlist trống</h2>
            <p>Bạn chưa có sản phẩm nào trong Wishlist</p>
            <button 
              className="shop-now-btn"
              onClick={() => navigate('/user/home')}
            >
              Mua sắm ngay
            </button>
          </div>
        ) : (
          <div className="wishlist-grid">
            {wishlist.map((product) => (
              <div key={product.idProduct} className="wishlist-item">
                <div className="product-image">
                  <img
                    src={product.picture ? `http://localhost/market_management/backend/uploads/${product.picture}` : ''}
                    alt={product.nameProduct}
                  />
                </div>
                <div className="product-info">
                  <div className="product-name">{product.nameProduct}</div>
                  <div className="product-description">{product.descriptionProduct}</div>
                  <div className="product-price">{Number(product.exportCost).toLocaleString('vi-VN')}₫</div>
                  <div className="wishlist-actions-inline">
                    <button className="add-to-cart-btn" onClick={() => handleAddToCart(product)}>
                      <FaShoppingCart /> Thêm vào giỏ hàng
                    </button>
                    <button className="remove-btn" onClick={() => handleRemoveFromWishlist(product.idProduct)}>
                      <FaTrash /> Xóa
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist; 