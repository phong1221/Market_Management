import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import '../../css/notification.css'
import '../../css/login.css'

const Login = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  })
  const [loading, setLoading] = useState(false)
  const [notification, setNotification] = useState(null)

  const testAPI = async () => {
    try {
      console.log('Testing API connection...')
      const testResponse = await axios.get('http://localhost/market_management/backend/api/user/test_url.php')
      console.log('API test response:', testResponse.data)
      return true
    } catch (error) {
      console.error('API test failed:', error)
      return false
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setNotification(null)

    try {
      // Test API connection first
      const apiWorking = await testAPI()
      if (!apiWorking) {
        setNotification({ 
          message: 'Không thể kết nối đến API server. Vui lòng kiểm tra backend server.', 
          type: 'error' 
        })
        setLoading(false)
        return
      }

      console.log('Đang gửi request đăng nhập...')
      console.log('Data:', { nameUser: formData.username, passWord: formData.password })
      
      // Gọi API đăng nhập admin
      const response = await axios.post('http://localhost/market_management/backend/api/user/loginUser.php', {
        nameUser: formData.username,
        passWord: formData.password
      })
      
      console.log('Response:', response.data)
      
      if (response.data.success) {
        if (response.data.user && response.data.user.roleUser && response.data.user.roleUser.toLowerCase() === 'admin') {
          localStorage.setItem('admin', JSON.stringify(response.data.user));
          localStorage.setItem('isLoggedIn', 'true');
          localStorage.setItem('role', 'admin');
          setNotification({ message: 'Đăng nhập thành công!', type: 'success' });
          setTimeout(() => {
            navigate('/admin/home');
          }, 1000);
        } else {
          setNotification({ message: 'Chỉ tài khoản admin mới được phép đăng nhập!', type: 'error' });
        }
      } else {
        setNotification({ 
          message: response.data.message || 'Đăng nhập thất bại', 
          type: 'error' 
        })
      }
    } catch (error) {
      console.error('Login error:', error)
      console.error('Error response:', error.response?.data)
      
      let errorMessage = 'Tên đăng nhập hoặc mật khẩu không đúng'
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message
      } else if (error.code === 'ERR_NETWORK') {
        errorMessage = 'Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.'
      } else if (error.response?.status === 500) {
        errorMessage = 'Lỗi server. Vui lòng thử lại sau.'
      }
      
      setNotification({ message: errorMessage, type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page">
      {notification && (
        <div className={`notification-container notification-${notification.type}`}>
          {notification.message}
        </div>
      )}
      <div className="login-container">
        <div className="login-card">
          <h1 className="login-title">Đăng nhập Admin</h1>
          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <input
                type="text"
                className="form-input"
                value={formData.username}
                onChange={(e) => setFormData({...formData, username: e.target.value})}
                required
                disabled={loading}
                placeholder=" "
              />
              <label className="form-label">Tên đăng nhập</label>
            </div>
            <div className="form-group">
              <input
                type="password"
                className="form-input"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                required
                disabled={loading}
                placeholder=" "
              />
              <label className="form-label">Mật khẩu</label>
            </div>
            <button 
              type="submit" 
              className="login-btn"
              disabled={loading}
            >
              {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </button>
          </form>
          <div className="login-footer">
            <p>Hệ thống quản lý siêu thị</p>
            <p>© 2024 Market Management</p>
            <p style={{ fontSize: '12px', color: '#95a5a6', marginTop: '10px' }}>
              Tài khoản mẫu: Phong / 123456
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login 