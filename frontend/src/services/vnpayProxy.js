// Proxy service để bypass CORS
const PROXY_URL = 'https://cors-anywhere.herokuapp.com/';
const BACKEND_URL = 'http://localhost/backend/api/vnpay';

export const vnpayProxy = {
  // Test kết nối
  testConnection: async () => {
    try {
      const response = await fetch(`${PROXY_URL}${BACKEND_URL}/test_connection.php`);
      return await response.json();
    } catch (error) {
      console.error('Proxy test connection error:', error);
      throw error;
    }
  },

  // Tạo thanh toán
  createPayment: async (orderInfo, amount, bankCode = '') => {
    try {
      const response = await fetch(`${PROXY_URL}${BACKEND_URL}/create_payment.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderInfo,
          amount,
          bankCode
        })
      });
      
      return await response.json();
    } catch (error) {
      console.error('Proxy create payment error:', error);
      throw error;
    }
  },

  // Xử lý kết quả
  handlePaymentReturn: async (queryParams) => {
    try {
      const params = new URLSearchParams(queryParams);
      const response = await fetch(`${PROXY_URL}${BACKEND_URL}/vnpay_return.php?${params}`);
      return await response.json();
    } catch (error) {
      console.error('Proxy payment return error:', error);
      throw error;
    }
  }
}; 