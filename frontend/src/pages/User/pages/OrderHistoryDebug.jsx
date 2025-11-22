import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth.js';
import { fetchUserOrders } from '../../../services/orderService.jsx';

const OrderHistoryDebug = () => {
  const { user } = useAuth();
  const [debugInfo, setDebugInfo] = useState({});
  const [testResult, setTestResult] = useState(null);

  useEffect(() => {
    const info = {
      user: user,
      userStringified: JSON.stringify(user, null, 2),
      idUser: user?.idUser,
      idUserType: typeof user?.idUser,
      localStorage: {
        user: localStorage.getItem('user'),
        isLoggedIn: localStorage.getItem('isLoggedIn'),
        role: localStorage.getItem('role')
      }
    };
    setDebugInfo(info);
    console.log('Debug Info:', info);
  }, [user]);

  const testAPI = async () => {
    if (!user || !user.idUser) {
      alert('User hoặc idUser không có!');
      return;
    }

    try {
      const url = `http://localhost/market_management/backend/api/order/getUserOrders.php?idUser=${user.idUser}`;
      console.log('Testing API:', url);
      
      const response = await fetch(url);
      const text = await response.text();
      console.log('Raw response:', text);
      
      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        setTestResult({
          error: 'Không parse được JSON',
          rawText: text,
          status: response.status
        });
        return;
      }
      
      setTestResult({
        success: true,
        data: data,
        status: response.status,
        ordersCount: data.data?.length || 0
      });
    } catch (error) {
      setTestResult({
        error: error.message,
        stack: error.stack
      });
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>Order History Debug</h1>
      
      <div style={{ marginBottom: '20px', padding: '15px', background: '#f0f0f0', borderRadius: '5px' }}>
        <h2>User Info</h2>
        <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
      </div>

      <button 
        onClick={testAPI}
        style={{ padding: '10px 20px', fontSize: '16px', marginBottom: '20px' }}
      >
        Test API
      </button>

      {testResult && (
        <div style={{ marginTop: '20px', padding: '15px', background: '#e0e0e0', borderRadius: '5px' }}>
          <h2>API Test Result</h2>
          <pre>{JSON.stringify(testResult, null, 2)}</pre>
        </div>
      )}

      <div style={{ marginTop: '20px', padding: '15px', background: '#fff3cd', borderRadius: '5px' }}>
        <h2>Instructions</h2>
        <ol>
          <li>Kiểm tra User Info - đảm bảo có idUser</li>
          <li>Nhấp "Test API" để test trực tiếp</li>
          <li>Xem kết quả trong Console (F12)</li>
          <li>Copy kết quả và gửi cho tôi</li>
        </ol>
      </div>
    </div>
  );
};

export default OrderHistoryDebug;

