import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaShoppingCart, FaTrash, FaArrowLeft, FaMinus, FaPlus, FaCreditCard } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useAuth } from '../../../hooks/useAuth.js';
import useCart from '../../../hooks/useCart.js';
import '../css/shoppingCart.css';

const ShoppingCart = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cart, removeFromCart, updateQuantity, clearCart } = useCart();

  // State cho form checkout (nếu bạn cần dùng lại logic này sau này)
  const [checkoutData, setCheckoutData] = useState({
    name: '',
    address: '',
    phone: '',
    payment: ''
  });
  const [checkoutError, setCheckoutError] = useState({});
  const [showCheckout, setShowCheckout] = useState(false);

  useEffect(() => {
    console.log('ShoppingCart useEffect triggered, user:', user);
    // Kiểm tra đăng nhập
    if (!user) {
      toast.error('Vui lòng đăng nhập để xem giỏ hàng!');
      navigate('/user/home');
      return;
    }
  }, [user, navigate]);

  const handleQuantityChange = (productId, newQuantity) => {
    updateQuantity(productId, newQuantity);
  };

  const handleRemoveFromCart = (productId) => {
    removeFromCart(productId);
    toast.success('Đã xóa sản phẩm khỏi giỏ hàng!', {
      position: "top-right",
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  };

  const handleClearCart = () => {
    if (cart.length === 0) {
      toast.info('Giỏ hàng trống!');
      return;
    }

    clearCart();
    toast.success('Đã xóa tất cả sản phẩm khỏi giỏ hàng!', {
      position: "top-right",
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  };

  const handleCheckout = () => {
    if (cart.length === 0) {
      toast.info('Giỏ hàng trống!');
      return;
    }
    navigate('/user/checkout');
  };

  // --- CÁC HÀM TÍNH TOÁN TIỀN ---

  const calculateSubtotal = () => {
    return cart.reduce((total, item) => {
      return total + (Number(item.exportCost) * item.quantity);
    }, 0);
  };

  // Đã sửa: Hàm này giờ chỉ trả về đúng bằng Subtotal (không cộng phí ship)
  const calculateTotal = () => {
    return calculateSubtotal();
  };

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  if (!user) {
    return null;
  }

  return (
    <div className="shopping-cart-page">
      <div className="cart-container">
        <div className="cart-header">
          <button className="back-btn" onClick={() => navigate('/user/home')}>
            <FaArrowLeft /> Quay lại
          </button>
          <h1 className="cart-title">
            <FaShoppingCart className="title-icon" />
            Giỏ hàng của tôi
          </h1>
          <button 
            className="clear-cart-btn"
            onClick={handleClearCart}
            disabled={cart.length === 0}
          >
            <FaTrash /> Xóa tất cả
          </button>
        </div>

        <div className="cart-content">
          {cart.length === 0 ? (
            <div className="empty-cart">
              <FaShoppingCart className="empty-icon" />
              <h2>Giỏ hàng trống</h2>
              <p>Bạn chưa có sản phẩm nào trong giỏ hàng</p>
              <button 
                className="shop-now-btn"
                onClick={() => navigate('/user/home')}
              >
                Mua sắm ngay
              </button>
            </div>
          ) : (
            <>
              <div className="cart-items">
                {cart.map((item) => (
                  <div key={item.idProduct} className="cart-item">
                    <div className="item-image">
                      <img
                        src={item.picture ? `http://localhost/market_management/backend/uploads/${item.picture}` : ''}
                        alt={item.nameProduct}
                      />
                    </div>
                    <div className="item-info">
                      <h3 className="item-name">{item.nameProduct}</h3>
                      <p className="item-description">{item.descriptionProduct}</p>
                      <div className="item-price">
                        {Number(item.exportCost).toLocaleString('vi-VN')}₫
                      </div>
                    </div>
                    <div className="item-quantity">
                      <button 
                        className="quantity-btn"
                        onClick={() => handleQuantityChange(item.idProduct, item.quantity - 1)}
                      >
                        <FaMinus />
                      </button>
                      <span className="quantity-display">{item.quantity}</span>
                      <button 
                        className="quantity-btn"
                        onClick={() => handleQuantityChange(item.idProduct, item.quantity + 1)}
                      >
                        <FaPlus />
                      </button>
                    </div>
                    <div className="item-total">
                      {(Number(item.exportCost) * item.quantity).toLocaleString('vi-VN')}₫
                    </div>
                    <button 
                      className="remove-item-btn"
                      onClick={() => handleRemoveFromCart(item.idProduct)}
                    >
                      <FaTrash />
                    </button>
                  </div>
                ))}
              </div>

              <div className="cart-summary">
                <h3 className="summary-title">Tóm tắt đơn hàng</h3>
                <div className="summary-item">
                  <span>Số lượng sản phẩm:</span>
                  <span>{getTotalItems()} sản phẩm</span>
                </div>
                <div className="summary-item">
                  <span>Tạm tính:</span>
                  <span>{calculateSubtotal().toLocaleString('vi-VN')}₫</span>
                </div>
                
                {/* Đã xóa bỏ phần hiển thị phí vận chuyển nếu có trước đây */}

                <div className="summary-total">
                  <span>Tổng cộng:</span>
                  <span>{calculateTotal().toLocaleString('vi-VN')}₫</span>
                </div>
                <button 
                  className="checkout-btn"
                  onClick={handleCheckout}
                >
                  <FaCreditCard /> Thanh toán
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShoppingCart;