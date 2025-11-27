import React, { useState } from 'react';
import VNPayPayment from '../../../components/VNPayPayment.jsx';
import './VNPayDemo.css';

const VNPayDemo = () => {
  const [orderInfo, setOrderInfo] = useState('Thanh toan don hang thoi gian: ' + new Date().toLocaleString('vi-VN'));
  const [amount, setAmount] = useState(100000);
  const [showPayment, setShowPayment] = useState(false);

  const handlePaymentSuccess = () => {
    alert('Thanh toán thành công!');
    setShowPayment(false);
  };

  const handlePaymentError = (error) => {
    alert(`Lỗi thanh toán: ${error}`);
    setShowPayment(false);
  };

  return (
    <div className="vnpay-demo-container">
      <div className="vnpay-demo-card">
        <h2>Demo Thanh toán VNPay</h2>
        <p>Đây là trang demo để test tính năng thanh toán VNPay</p>
        
        <div className="demo-form">
          <div className="form-group">
            <label>Thông tin đơn hàng:</label>
            <input
              type="text"
              value={orderInfo}
              onChange={(e) => setOrderInfo(e.target.value)}
              placeholder="Nhập thông tin đơn hàng"
            />
          </div>
          
          <div className="form-group">
            <label>Số tiền (VND):</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              placeholder="Nhập số tiền"
              min="1000"
            />
          </div>
          
          <button 
            className="demo-payment-btn"
            onClick={() => setShowPayment(true)}
          >
            Test Thanh toán VNPay
          </button>
        </div>

        <div className="demo-info">
          <h3>Hướng dẫn sử dụng:</h3>
          <ul>
            <li>Nhập thông tin đơn hàng và số tiền</li>
            <li>Click "Test Thanh toán VNPay"</li>
            <li>Sẽ chuyển hướng đến trang thanh toán VNPay</li>
            <li>Sau khi thanh toán xong sẽ quay về trang kết quả</li>
          </ul>
        </div>
      </div>

      {showPayment && (
        <div className="vnpay-overlay">
          <div className="vnpay-modal">
            <button 
              className="vnpay-close-btn" 
              onClick={() => setShowPayment(false)}
            >
              ×
            </button>
            <VNPayPayment
              orderInfo={orderInfo}
              amount={amount}
              onPaymentSuccess={handlePaymentSuccess}
              onPaymentError={handlePaymentError}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default VNPayDemo; 