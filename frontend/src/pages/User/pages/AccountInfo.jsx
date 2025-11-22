import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import '../css/accountInfo.css';
import { useAuth } from '../../../hooks/useAuth';

const AccountInfo = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [userInfo, setUserInfo] = useState({
    fullName: '',
    age: '',
    address: '',
    phone: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // Kiểm tra xem user có đăng nhập không
    if (!user) {
      toast.error('Vui lòng đăng nhập để xem thông tin cá nhân');
      navigate('/user/home');
      return;
    }
    
    // Load thông tin chi tiết của user
    loadUserInfo(user.idUser);
  }, [navigate, user]);

  const loadUserInfo = async (userId) => {
    try {
      setIsLoading(true);
      const response = await fetch(`http://localhost/market_management/backend/api/user/getUserDetail.php?idUser=${userId}`);
      const data = await response.json();
      
      if (data.success && data.userInfo) {
        setUserInfo({
          fullName: data.userInfo.fullName || '',
          age: data.userInfo.age || '',
          address: data.userInfo.address || '',
          phone: data.userInfo.phone || ''
        });
      } else {
        // Nếu chưa có thông tin chi tiết, tạo form trống
        setUserInfo({
          fullName: '',
          age: '',
          address: '',
          phone: ''
        });
      }
    } catch (error) {
      console.error('Error loading user info:', error);
      toast.error('Không thể tải thông tin cá nhân');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    if (!user) return;

    try {
      setIsSaving(true);
      const response = await fetch('http://localhost/market_management/backend/api/user/updateUserInfo.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          idUser: user.idUser,
          fullName: userInfo.fullName,
          age: parseInt(userInfo.age) || 0,
          address: userInfo.address,
          phone: parseInt(userInfo.phone) || 0
        })
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success('Cập nhật thông tin thành công!');
        setIsEditing(false);
      } else {
        toast.error(data.message || 'Cập nhật thất bại');
      }
    } catch (error) {
      console.error('Error saving user info:', error);
      toast.error('Lỗi khi cập nhật thông tin');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    toast.success('Đăng xuất thành công!');
    navigate('/user/home');
  };

  if (!user) {
    return (
      <div className="account-info-container">
        <div className="loading">Đang tải...</div>
      </div>
    );
  }

  return (
    <div className="account-info-container">
      <div className="account-info-card">
        <div className="account-info-header">
          <h1>Thông Tin Cá Nhân</h1>
          <button 
            className="back-btn"
            onClick={() => navigate('/user/home')}
          >
            ← Quay lại
          </button>
        </div>

        <div className="account-info-content">
          {/* Thông tin cơ bản */}
          <div className="info-section">
            <h2>Thông Tin Tài Khoản</h2>
            <div className="info-grid">
              <div className="info-item">
                <label>Tên đăng nhập:</label>
                <span>{user.nameUser}</span>
              </div>
              <div className="info-item">
                <label>Email:</label>
                <span>{user.email || 'Chưa cập nhật'}</span>
              </div>
              <div className="info-item">
                <label>Vai trò:</label>
                <span>{user.roleUser}</span>
              </div>
              <div className="info-item">
                <label>Phương thức đăng nhập:</label>
                <span>{user.oauthProvider || 'Tài khoản thường'}</span>
              </div>
            </div>
          </div>

          {/* Thông tin chi tiết */}
          <div className="info-section">
            <div className="section-header">
              <h2>Thông Tin Chi Tiết</h2>
              {!isEditing && (
                <button 
                  className="edit-btn"
                  onClick={() => setIsEditing(true)}
                  disabled={isLoading}
                >
                  Chỉnh sửa
                </button>
              )}
            </div>

            {isLoading ? (
              <div className="loading">Đang tải thông tin...</div>
            ) : (
              <div className="info-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>Họ và tên:</label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="fullName"
                        value={userInfo.fullName}
                        onChange={handleInputChange}
                        placeholder="Nhập họ và tên"
                      />
                    ) : (
                      <span>{userInfo.fullName || 'Chưa cập nhật'}</span>
                    )}
                  </div>
                  <div className="form-group">
                    <label>Tuổi:</label>
                    {isEditing ? (
                      <input
                        type="number"
                        name="age"
                        value={userInfo.age}
                        onChange={handleInputChange}
                        placeholder="Nhập tuổi"
                        min="0"
                        max="150"
                      />
                    ) : (
                      <span>{userInfo.age || 'Chưa cập nhật'}</span>
                    )}
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Địa chỉ:</label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="address"
                        value={userInfo.address}
                        onChange={handleInputChange}
                        placeholder="Nhập địa chỉ"
                      />
                    ) : (
                      <span>{userInfo.address || 'Chưa cập nhật'}</span>
                    )}
                  </div>
                  <div className="form-group">
                    <label>Số điện thoại:</label>
                    {isEditing ? (
                      <input
                        type="tel"
                        name="phone"
                        value={userInfo.phone}
                        onChange={handleInputChange}
                        placeholder="Nhập số điện thoại"
                      />
                    ) : (
                      <span>{userInfo.phone || 'Chưa cập nhật'}</span>
                    )}
                  </div>
                </div>

                {isEditing && (
                  <div className="form-actions">
                    <button 
                      className="save-btn"
                      onClick={handleSave}
                      disabled={isSaving}
                    >
                      {isSaving ? 'Đang lưu...' : 'Lưu thay đổi'}
                    </button>
                    <button 
                      className="cancel-btn"
                      onClick={() => setIsEditing(false)}
                      disabled={isSaving}
                    >
                      Hủy
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Nút đăng xuất */}
          <div className="logout-section">
            <button 
              className="logout-btn"
              onClick={handleLogout}
            >
              Đăng xuất
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountInfo; 