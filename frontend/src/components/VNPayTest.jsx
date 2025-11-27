import React, { useState } from 'react';
import { vnpayService } from '../services/vnpayService';

const VNPayTest = () => {
  const [testResult, setTestResult] = useState('');
  const [loading, setLoading] = useState(false);

  const testConnection = async () => {
    setLoading(true);
    setTestResult('');

    try {
      console.log('Testing connection...');
      const result = await vnpayService.testConnection();
      console.log('Test result:', result);
      setTestResult(JSON.stringify(result, null, 2));
    } catch (error) {
      console.error('Test failed:', error);
      setTestResult(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testPayment = async () => {
    setLoading(true);
    setTestResult('');

    try {
      console.log('Testing payment...');
      const result = await vnpayService.createPayment(
        'Test payment',
        100000,
        'NCB'
      );
      console.log('Payment result:', result);
      setTestResult(JSON.stringify(result, null, 2));
    } catch (error) {
      console.error('Payment test failed:', error);
      setTestResult(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h2>VNPay Connection Test</h2>
      
      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={testConnection}
          disabled={loading}
          style={{ marginRight: '10px', padding: '10px 20px' }}
        >
          {loading ? 'Testing...' : 'Test Connection'}
        </button>
        
        <button 
          onClick={testPayment}
          disabled={loading}
          style={{ padding: '10px 20px' }}
        >
          {loading ? 'Testing...' : 'Test Payment'}
        </button>
      </div>

      {testResult && (
        <div style={{ 
          background: '#f5f5f5', 
          padding: '15px', 
          borderRadius: '5px',
          fontFamily: 'monospace',
          whiteSpace: 'pre-wrap'
        }}>
          <h3>Result:</h3>
          {testResult}
        </div>
      )}

      <div style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
        <h3>Debug Info:</h3>
        <p>API Base URL: /vnpay-api</p>
        <p>Test URL: /vnpay-api/test_connection.php</p>
        <p>Payment URL: /vnpay-api/create_payment.php</p>
      </div>
    </div>
  );
};

export default VNPayTest; 