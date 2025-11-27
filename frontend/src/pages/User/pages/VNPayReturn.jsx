import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { vnpayService } from '../../../services/vnpayService';
import useCart from '../../../hooks/useCart.js';
import './VNPayReturn.css';

const VNPayReturn = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { clearCart } = useCart();

  useEffect(() => {
    const handlePaymentReturn = async () => {
      try {
        // Lấy query parameters từ URL
        const queryParams = new URLSearchParams(location.search);
        const params = Object.fromEntries(queryParams.entries());

        if (Object.keys(params).length === 0) {
          setError('Không có thông tin thanh toán');
          setLoading(false);
          return;
        }

        // Gọi API để xử lý kết quả thanh toán
        const result = await vnpayService.handlePaymentReturn(params);
        
        // Kiểm tra mã phản hồi từ VNPay
        const responseCode = params.vnp_ResponseCode;
        
        if (responseCode === '00') {
          setPaymentStatus('success');
        } else {
          setPaymentStatus('failed');
        }

      } catch (error) {
        console.error('Error handling payment return:', error);
        setError('Có lỗi xảy ra khi xử lý kết quả thanh toán');
      } finally {
        setLoading(false);
      }
    };

    handlePaymentReturn();
  }, [location]);

  useEffect(() => {
    if (!loading && paymentStatus === 'success') {
      clearCart();
      const timer = setTimeout(() => navigate('/user/home'), 2000);
      return () => clearTimeout(timer);
    }
  }, [loading, paymentStatus, navigate, clearCart]);

  const handleContinueShopping = () => {
    navigate('/user/home');
  };

  const handleViewOrders = () => {
    navigate('/user/orders');
  };

  if (loading) {
    return (
      <div className="vnpay-return-container">
        <div className="vnpay-return-card">
          <div className="loading-spinner"></div>
          <h3>Đang xử lý kết quả thanh toán...</h3>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="vnpay-return-container">
        <div className="vnpay-return-card error">
          <div className="status-icon error">⚠️</div>
          <h3>Lỗi xử lý thanh toán</h3>
          <p>{error}</p>
          <button onClick={handleContinueShopping} className="continue-btn">
            Tiếp tục mua sắm
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="vnpay-return-container">
      <div className={`vnpay-return-card ${paymentStatus}`}>
        {paymentStatus === 'success' ? (
          <>
            <div className="status-icon success">✅</div>
            <h3>Thanh toán thành công!</h3>
            <p>Cảm ơn bạn đã mua hàng. Đơn hàng của bạn đã được xử lý thành công.</p>
            <div className="success-details">
              <p>Mã giao dịch: <strong>{location.search.match(/vnp_TxnRef=([^&]*)/)?.[1] || 'N/A'}</strong></p>
              <p>Thời gian: <strong>{new Date().toLocaleString('vi-VN')}</strong></p>
            </div>
            <div className="action-buttons">
              <button onClick={handleViewOrders} className="view-orders-btn">
                Xem đơn hàng
              </button>
              <button onClick={handleContinueShopping} className="continue-btn">
                Tiếp tục mua sắm
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="status-icon failed">❌</div>
            <h3>Thanh toán thất bại</h3>
            <p>Rất tiếc, giao dịch thanh toán của bạn không thành công.</p>
            <div className="failed-details">
              <p>Mã lỗi: <strong>{location.search.match(/vnp_ResponseCode=([^&]*)/)?.[1] || 'N/A'}</strong></p>
              <p>Thông báo: <strong>{location.search.match(/vnp_Message=([^&]*)/)?.[1] || 'Không xác định'}</strong></p>
            </div>
            <div className="action-buttons">
              <button onClick={handleContinueShopping} className="continue-btn">
                Thử lại
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default VNPayReturn; 