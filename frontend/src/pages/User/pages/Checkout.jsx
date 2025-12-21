import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import { useAuth } from '../../../hooks/useAuth.js';
import useCart from '../../../hooks/useCart.js';
import VNPayPayment from '../../../components/VNPayPayment.jsx';
import '../css/Checkout.css';

// URL Backend
const API_BASE_URL = 'http://localhost/market_management/backend/api';
const VNPAY_API_URL = 'http://localhost/market_management/backend/api/vnpay';

const Checkout = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cart, clearCart } = useCart();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // --- FIX LỖI TÍNH TIỀN ---
  // Hàm tính tổng tiền an toàn, chấp nhận cả 'price' hoặc 'exportCost'
  const calculateSafeTotal = (cartItems) => {
    if (!cartItems || cartItems.length === 0) return 0;

    return cartItems.reduce((total, item) => {
      // Ưu tiên lấy price, nếu không có thì lấy exportCost, không có nữa thì lấy importCost
      const rawPrice = item.price || item.exportCost || item.importCost || 0;
      const price = Number(rawPrice);
      const quantity = Number(item.quantity) || 1;
      return total + (price * quantity);
    }, 0);
  };

  // State lưu tổng tiền
  const [totalAmount, setTotalAmount] = useState(0);
  const [finalAmount, setFinalAmount] = useState(0);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const [coupons, setCoupons] = useState([]);
  const [showCouponModal, setShowCouponModal] = useState(false);

  // Cập nhật tổng tiền mỗi khi cart thay đổi
  useEffect(() => {
    const total = calculateSafeTotal(cart);
    setTotalAmount(total);
    // Reset coupon if total is 0 (empty cart)
    if (total === 0) {
      setSelectedCoupon(null);
      setDiscountAmount(0);
      setFinalAmount(0);
    } else {
      // Recalculate if coupon exists
      if (selectedCoupon) {
        applyCouponLogic(selectedCoupon, total);
      } else {
        setFinalAmount(total);
      }
    }
  }, [cart]);

  // Fetch coupons
  useEffect(() => {
    if (user) {
      fetchUserCoupons();
    }
  }, [user]);

  const fetchUserCoupons = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/coupon/getUserCoupons.php?idUser=${user.idUser}`);
      if (response.data.success) {
        setCoupons(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching coupons", error);
    }
  };

  const applyCouponLogic = (coupon, currentTotal) => {
    // Check min order value
    if (Number(coupon.min_order_value) > currentTotal) {
      toast.warn(`Đơn hàng phải từ ${formatCurrency(coupon.min_order_value)} để dùng mã này.`);
      setSelectedCoupon(null);
      setDiscountAmount(0);
      setFinalAmount(currentTotal);
      return;
    }

    let discount = 0;
    if (coupon.discount_type === 'percent') {
      discount = currentTotal * (Number(coupon.discount_value) / 100);
    } else {
      discount = Number(coupon.discount_value);
    }

    // Ensure discount doesn't exceed total
    if (discount > currentTotal) discount = currentTotal;

    setDiscountAmount(discount);
    setFinalAmount(currentTotal - discount);
    setSelectedCoupon(coupon);
  };

  const handleSelectCoupon = (coupon) => {
    applyCouponLogic(coupon, totalAmount);
    setShowCouponModal(false);
    toast.success(`Đã áp dụng mã ${coupon.code}`);
  };

  const handleRemoveCoupon = () => {
    setSelectedCoupon(null);
    setDiscountAmount(0);
    setFinalAmount(totalAmount);
    toast.info("Đã bỏ mã giảm giá");
  };

  const [checkoutData, setCheckoutData] = useState({
    name: user?.fullName || user?.nameUser || '',
    address: user?.address || '',
    phone: user?.phone || '',
    payment: 'cash',
  });

  const [checkoutError, setCheckoutError] = useState({});
  const [showVNPay, setShowVNPay] = useState(false);
  const [createdOrderId, setCreatedOrderId] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleCheckoutInput = (e) => {
    const { name, value } = e.target;
    setCheckoutData(prev => ({ ...prev, [name]: value }));
    setCheckoutError(prev => ({ ...prev, [name]: '' }));
  };

  const validateCheckout = () => {
    const err = {};
    if (!checkoutData.name.trim()) err.name = 'Vui lòng nhập tên';
    if (!checkoutData.address.trim()) err.address = 'Vui lòng nhập địa chỉ';
    if (!checkoutData.phone.trim()) err.phone = 'Vui lòng nhập số điện thoại';
    if (!checkoutData.payment) err.payment = 'Chọn hình thức thanh toán';
    setCheckoutError(err);
    return Object.keys(err).length === 0;
  };

  const createOrderInDatabase = async () => {
    try {
      if (finalAmount < 0) { // Should not happen but strict check
        toast.error("Tổng tiền không hợp lệ.");
        return null;
      }

      // Chuẩn hóa lại mảng cart để gửi sang PHP (PHP đang mong đợi key là 'price')
      const standardizedCart = cart.map(item => ({
        idProduct: item.idProduct,
        quantity: item.quantity,
        // Ép kiểu dữ liệu giá về key 'price' để PHP đọc được
        price: Number(item.price || item.exportCost || 0)
      }));

      // Đảm bảo idUser được gửi đúng
      if (!user || !user.idUser) {
        toast.error('Vui lòng đăng nhập để đặt hàng');
        return null;
      }

      const payload = {
        ...checkoutData,
        idUser: user.idUser,
        cart: standardizedCart,
        totalAmount: finalAmount, // Send FINAL amount after discount
        couponCode: selectedCoupon ? selectedCoupon.code : null,
        discountAmount: discountAmount
      };

      console.log("PAYLOAD GỬI ĐI:", payload);

      const response = await axios.post(`${VNPAY_API_URL}/create_order.php`, payload, {
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.data.status === 'success') {
        return response.data.idOrder;
      } else {
        throw new Error(response.data.message || JSON.stringify(response.data));
      }
    } catch (error) {
      console.error('Create order error:', error);
      toast.error(`Lỗi tạo đơn: ${error.message}`);
      return null;
    }
  };

  const handleCheckoutSubmit = async (e) => {
    e.preventDefault();
    if (!validateCheckout()) return;
    if (!cart || cart.length === 0) {
      toast.warn('Giỏ hàng đang trống!');
      return;
    }

    setIsProcessing(true);

    // 1. Tạo đơn hàng
    const orderId = await createOrderInDatabase();

    if (!orderId) {
      setIsProcessing(false);
      return;
    }

    // 2. Xử lý thanh toán
    if (checkoutData.payment === 'bank') {
      setCreatedOrderId(orderId);
      setShowVNPay(true);
      setIsProcessing(false);
    } else {
      toast.success(`Đặt hàng thành công! Mã đơn: #${orderId}`);
      clearCart();
      navigate('/user/home');
    }
  };

  const handleVNPaySuccess = () => {
    toast.success('Thanh toán VNPAY thành công!');
    clearCart();
    navigate('/user/home');
  };

  const handleVNPayError = (msg) => {
    toast.error(`Thanh toán thất bại: ${msg}`);
    setShowVNPay(false);
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  return (
    <div className="checkout-page">
      <div className="checkout-container">
        <h2 className="checkout-title">Thông tin thanh toán</h2>
        <form className="checkout-form" onSubmit={handleCheckoutSubmit}>
          <div className="checkout-form-group">
            <label>Họ tên</label>
            <input className="checkout-input" name="name" value={checkoutData.name} onChange={handleCheckoutInput} placeholder="Nhập họ tên" />
            {checkoutError.name && <div className="checkout-error">{checkoutError.name}</div>}
          </div>
          <div className="checkout-form-group">
            <label>Địa chỉ</label>
            <input className="checkout-input" name="address" value={checkoutData.address} onChange={handleCheckoutInput} placeholder="Nhập địa chỉ nhận hàng" />
            {checkoutError.address && <div className="checkout-error">{checkoutError.address}</div>}
          </div>
          <div className="checkout-form-group">
            <label>Số điện thoại</label>
            <input className="checkout-input" name="phone" value={checkoutData.phone} onChange={handleCheckoutInput} placeholder="Nhập số điện thoại" />
            {checkoutError.phone && <div className="checkout-error">{checkoutError.phone}</div>}
          </div>

          <div className="checkout-form-group">
            <label>Hình thức thanh toán</label>
            <div className="checkout-radio-group">
              <label><input type="radio" name="payment" value="cash" checked={checkoutData.payment === 'cash'} onChange={handleCheckoutInput} /> Tiền mặt</label>
              <label><input type="radio" name="payment" value="bank" checked={checkoutData.payment === 'bank'} onChange={handleCheckoutInput} /> Chuyển khoản VNPAY</label>
            </div>
            {checkoutError.payment && <div className="checkout-error">{checkoutError.payment}</div>}
          </div>

          {/* COUPON SECTION */}
          <div className="checkout-coupon-section">
            <div className="checkout-section-header">
              <h3>Mã giảm giá</h3>
              {!selectedCoupon ? (
                <button type="button" className="btn-select-coupon" onClick={() => setShowCouponModal(true)}>
                  Chọn mã
                </button>
              ) : (
                <button type="button" className="btn-remove-coupon" onClick={handleRemoveCoupon}>
                  Bỏ chọn
                </button>
              )}
            </div>

            {selectedCoupon && (
              <div className="selected-coupon-info">
                <span>Đang dùng: <strong>{selectedCoupon.code}</strong></span>
                <span className="discount-value">- {formatCurrency(discountAmount)}</span>
              </div>
            )}
          </div>

          <div className="checkout-summary">
            <div className="summary-row">
              <span>Tạm tính:</span>
              <span>{formatCurrency(totalAmount)}</span>
            </div>
            {selectedCoupon && (
              <div className="summary-row discount">
                <span>Giảm giá:</span>
                <span>-{formatCurrency(discountAmount)}</span>
              </div>
            )}
            <div className="summary-row total">
              <span>Tổng tiền:</span>
              <span>{formatCurrency(finalAmount)}</span>
            </div>
          </div>

          <button className="checkout-submit-btn" type="submit" disabled={isProcessing}>
            {isProcessing ? 'Đang xử lý...' : 'Xác nhận đặt hàng'}
          </button>
        </form>
      </div>

      {/* Coupon Modal */}
      {showCouponModal && (
        <div className="modal-overlay" onClick={() => setShowCouponModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3>Chọn mã giảm giá</h3>
            <button className="modal-close" onClick={() => setShowCouponModal(false)}>×</button>
            <div className="coupon-list-modal">
              {coupons.length === 0 ? (
                <p>Bạn chưa có mã giảm giá nào phù hợp.</p>
              ) : (
                coupons.map(coupon => (
                  <div key={coupon.code} className="coupon-item-modal" onClick={() => handleSelectCoupon(coupon)}>
                    <div className="code">{coupon.code}</div>
                    <div className="desc">{coupon.description}</div>
                    <div className="expiry">HSD: {coupon.expiry_date}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {showVNPay && (
        <div className="vnpay-overlay">
          <div className="vnpay-modal">
            <button className="vnpay-close-btn" onClick={() => setShowVNPay(false)}>×</button>
            <VNPayPayment
              idOrder={createdOrderId}
              orderInfo={`Thanh toán đơn hàng #${createdOrderId}`}
              amount={finalAmount} // Use FINAL amount
              onPaymentSuccess={handleVNPaySuccess}
              onPaymentError={handleVNPayError}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Checkout;