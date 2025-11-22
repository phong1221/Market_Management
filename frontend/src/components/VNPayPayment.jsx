import React, { useState } from 'react';
import { vnpayService } from '../services/vnpayService';
import './VNPayPayment.css';

// 1. Thêm idOrder vào props nhận về
const VNPayPayment = ({ idOrder, orderInfo, amount, onPaymentSuccess, onPaymentError }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('QR'); // 'QR' hoặc 'ATM'
  const [selectedBank, setSelectedBank] = useState('');

  const banks = [
    { code: 'NCB', name: 'Ngân hàng NCB' },
    { code: 'VCB', name: 'Vietcombank' },
    { code: 'BIDV', name: 'BIDV' },
    { code: 'TECHCOMBANK', name: 'Techcombank' },
    { code: 'MBBANK', name: 'MBBank' },
    { code: 'ACB', name: 'ACB' },
    { code: 'VPBANK', name: 'VPBank' },
    { code: 'TPBANK', name: 'TPBank' },
    { code: 'SACOMBANK', name: 'Sacombank' },
    { code: 'VIETINBANK', name: 'VietinBank' },
    { code: 'AGRIBANK', name: 'Agribank' },
    { code: 'SCB', name: 'SCB' },
    { code: 'EXIMBANK', name: 'EximBank' },
    { code: 'HDBANK', name: 'HDBank' },
    { code: 'DONGABANK', name: 'DongA Bank' },
    { code: 'OCEANBANK', name: 'OceanBank' },
    { code: 'SHB', name: 'SHB' },
    { code: 'MSBANK', name: 'MSB' },
    { code: 'NAMABANK', name: 'Nam A Bank' },
    { code: 'OCB', name: 'OCB' },
    { code: 'IVB', name: 'Indovina Bank' }
  ];

  const handlePayment = async () => {
    setLoading(true);
    setError('');

    try {
      // Nếu chọn phương thức QR/VNPAY App thì gửi bankCode rỗng để VNPAY tự hiện trang chọn
      const bankCodeToSend = paymentMethod === 'QR' ? '' : selectedBank;

      // 2. QUAN TRỌNG: Truyền idOrder vào hàm service để gửi xuống Backend
      const response = await vnpayService.createPayment(idOrder, orderInfo, amount, bankCodeToSend);
      
      if (response.payUrl) {
        // Chuyển hướng
        window.location.href = response.payUrl;
      } else {
        throw new Error('Không nhận được link thanh toán từ Server');
      }
    } catch (err) {
      console.error('Payment error:', err);
      let msg = 'Có lỗi xảy ra. Vui lòng thử lại.';
      if (err.response) {
        // Lỗi từ Backend trả về (ví dụ: thiếu idOrder, db lỗi...)
        msg = `Lỗi server (${err.response.status}): ${err.response.data?.message || 'Không xác định'}`;
      } else if (err.request) {
        msg = 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra mạng.';
      }
      setError(msg);
      onPaymentError && onPaymentError(msg);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(value);
  };

  return (
    <div className="vnpay-modern-container">
      <div className="vnpay-modern-card">
        
        {/* Header */}
        <div className="vnpay-modern-header">
          <div className="vnpay-brand">
            <span className="brand-vn">VN</span>
            <span className="brand-pay">PAY</span>
          </div>
          <p>Cổng thanh toán an toàn</p>
        </div>

        {/* Bill Summary */}
        <div className="vnpay-summary">
          <div className="summary-row">
            <span>Mã đơn hàng:</span>
            {/* Hiển thị mã đơn hàng cho người dùng thấy */}
            <span className="order-info-text">#{idOrder}</span> 
          </div>
          <div className="summary-row">
            <span>Nội dung:</span>
            <span className="order-info-text">{orderInfo}</span>
          </div>
          <div className="summary-row total">
            <span>Tổng thanh toán:</span>
            <span className="amount-text">{formatCurrency(amount)}</span>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="vnpay-methods">
          <label className="method-title">Chọn phương thức:</label>
          
          {/* Option 1: VNPAY QR / All */}
          <div 
            className={`method-item ${paymentMethod === 'QR' ? 'active' : ''}`}
            onClick={() => setPaymentMethod('QR')}
          >
            <div className="radio-circle"></div>
            <div className="method-info">
              <span className="method-name">Ứng dụng thanh toán hỗ trợ VNPAY-QR</span>
              <span className="method-desc">Quét mã QR bằng ứng dụng ngân hàng hoặc Ví điện tử</span>
            </div>
          </div>

          {/* Option 2: ATM / Bank Account */}
          <div 
            className={`method-item ${paymentMethod === 'ATM' ? 'active' : ''}`}
            onClick={() => setPaymentMethod('ATM')}
          >
            <div className="radio-circle"></div>
            <div className="method-info">
              <span className="method-name">Thẻ ATM / Tài khoản ngân hàng</span>
              <span className="method-desc">Chọn ngân hàng nội địa của bạn</span>
            </div>
          </div>

          {/* Bank Dropdown (Only shows if ATM selected) */}
          {paymentMethod === 'ATM' && (
            <div className="bank-selection-box">
              <select 
                className="bank-select"
                value={selectedBank}
                onChange={(e) => setSelectedBank(e.target.value)}
              >
                <option value="">-- Chọn ngân hàng --</option>
                {banks.map(bank => (
                  <option key={bank.code} value={bank.code}>{bank.name}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && <div className="vnpay-error-alert">{error}</div>}

        {/* Action Button */}
        <button 
          className="vnpay-submit-btn"
          onClick={handlePayment}
          disabled={loading || (paymentMethod === 'ATM' && !selectedBank)}
        >
          {loading ? (
            <div className="vnpay-spinner"></div>
          ) : (
            <span>Tiếp tục thanh toán</span>
          )}
        </button>

        {/* Footer */}
        <div className="vnpay-secure-footer">
          <span>🔒 Được bảo mật bởi VNPAY</span>
        </div>

      </div>
    </div>
  );
};

export default VNPayPayment;