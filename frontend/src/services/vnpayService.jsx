import axios from 'axios';

// SỬA DÒNG NÀY: Đổi 'user' thành 'vnpay'
const API_BASE_URL = 'http://localhost/market_management/backend/api/vnpay';

export const vnpayService = {
  createPayment: async (idOrder, orderInfo, amount, bankCode = '') => {
    try {
      // Code sẽ gọi: .../api/vnpay/create_payment.php
      const response = await axios.post(`${API_BASE_URL}/create_payment.php`, {
        idOrder,
        orderInfo,
        amount,
        bankCode
      });
      return response.data;
    } catch (error) {
      console.error('Error creating payment:', error);
      throw error;
    }
  },

  handlePaymentReturn: async (queryParams) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/vnpay_return.php`, {
        params: queryParams
      });
      return response.data;
    } catch (error) {
      console.error('Error verifying payment:', error);
      throw error;
    }
  }
};