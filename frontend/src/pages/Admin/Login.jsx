import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import '../../css/notification.css'

const Login = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  })
  const [loading, setLoading] = useState(false)
  const [notification, setNotification] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setNotification(null)

    try {
      // Gọi API đăng nhập admin (giả sử endpoint là /backend/api/user/loginUser.php)
      const response = await axios.post('http://localhost/market_management/backend/api/user/loginUser.php', {
        nameUser: formData.username,
        passWord: formData.password
      })
      if (response.data.success && response.data.user) {
        localStorage.setItem('user', JSON.stringify(response.data.user))
        navigate('/admin/account-info')
      } else {
        setNotification({ message: response.data.message || 'Đăng nhập thất bại', type: 'error' })
      }
    } catch (error) {
      setNotification({ message: 'Tên đăng nhập hoặc mật khẩu không đúng', type: 'error' })
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
              <label className="form-label">Tên đăng nhập:</label>
              <input
                type="text"
                className="form-input"
                value={formData.username}
                onChange={(e) => setFormData({...formData, username: e.target.value})}
                required
                disabled={loading}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Mật khẩu:</label>
              <input
                type="password"
                className="form-input"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                required
                disabled={loading}
              />
            </div>
            <button 
              type="submit" 
              className="btn btn-primary login-btn"
              disabled={loading}
            >
              {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </button>
          </form>
          <div className="login-footer">
            <p>Hệ thống quản lý siêu thị</p>
            <p>© 2024 Market Management</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login 