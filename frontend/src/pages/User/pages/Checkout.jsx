import React, { useState, useEffect } from 'react'; // Thêm useEffect
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios'; 
import { useAuth } from '../../../hooks/useAuth.js';
import useCart from '../../../hooks/useCart.js';
import VNPayPayment from '../../../components/VNPayPayment.jsx';
import '../css/Checkout.css';

// URL Backend
const API_BASE_URL = 'http://localhost/market_management/backend/api/vnpay'; 

const Checkout = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cart, clearCart } = useCart();

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

  // Cập nhật tổng tiền mỗi khi cart thay đổi
  useEffect(() => {
    const total = calculateSafeTotal(cart);
    setTotalAmount(total);
  }, [cart]);

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
      // Tính toán lại lần cuối trước khi gửi để chắc chắn không bị 0
      const finalTotal = calculateSafeTotal(cart);

      if (finalTotal <= 0) {
        toast.error("Tổng tiền không hợp lệ (0đ). Vui lòng kiểm tra giỏ hàng.");
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
        idUser: user.idUser, // Đảm bảo idUser luôn có giá trị
        cart: standardizedCart, // Gửi mảng đã chuẩn hóa
        totalAmount: finalTotal // Gửi số tiền đã tính toán
      };

      console.log("PAYLOAD GỬI ĐI:", payload);
      console.log("User ID:", user.idUser);

      const response = await axios.post(`${API_BASE_URL}/create_order.php`, payload, {
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
            <input name="name" value={checkoutData.name} onChange={handleCheckoutInput} placeholder="Nhập họ tên" />
            {checkoutError.name && <div className="checkout-error">{checkoutError.name}</div>}
          </div>
          <div className="checkout-form-group">
            <label>Địa chỉ</label>
            <input name="address" value={checkoutData.address} onChange={handleCheckoutInput} placeholder="Nhập địa chỉ nhận hàng" />
            {checkoutError.address && <div className="checkout-error">{checkoutError.address}</div>}
          </div>
          <div className="checkout-form-group">
            <label>Số điện thoại</label>
            <input name="phone" value={checkoutData.phone} onChange={handleCheckoutInput} placeholder="Nhập số điện thoại" />
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

          <div className="checkout-summary">
             <h3>Tổng tiền: {formatCurrency(totalAmount)}</h3>
          </div>

          <button className="checkout-submit-btn" type="submit" disabled={isProcessing}>
            {isProcessing ? 'Đang xử lý...' : 'Xác nhận đặt hàng'}
          </button>
        </form>
      </div>
      
      {showVNPay && (
        <div className="vnpay-overlay">
          <div className="vnpay-modal">
            <button className="vnpay-close-btn" onClick={() => setShowVNPay(false)}>×</button>
            <VNPayPayment
              idOrder={createdOrderId} 
              orderInfo={`Thanh toán đơn hàng #${createdOrderId}`}
              amount={totalAmount}
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