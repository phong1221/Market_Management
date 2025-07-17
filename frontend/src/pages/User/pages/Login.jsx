import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/Login.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Login = ({ isModal = false }) => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    nameUser: '',
    passWord: '',
    confirmPassword: '',
    email: '',
    phone: '',
    fullName: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showForgot, setShowForgot] = useState(false);
  const [forgotUser, setForgotUser] = useState("");
  const [forgotMsg, setForgotMsg] = useState("");
  const [formSwitching, setFormSwitching] = useState(false);
  const [showForm, setShowForm] = useState(true);

  useEffect(() => {
    if (!isModal) {
      const user = localStorage.getItem('user');
      if (user) {
        navigate('/user/home');
      }
    }
  }, [navigate, isModal]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    let hasError = false;

    if (!formData.nameUser.trim()) {
      newErrors.nameUser = 'Tên đăng nhập là bắt buộc';
      hasError = true;
    } else if (formData.nameUser.length < 3) {
      newErrors.nameUser = 'Tên đăng nhập phải có ít nhất 3 ký tự';
      hasError = true;
    }

    if (!formData.passWord) {
      newErrors.passWord = 'Mật khẩu là bắt buộc';
      hasError = true;
    } else if (formData.passWord.length < 6) {
      newErrors.passWord = 'Mật khẩu phải có ít nhất 6 ký tự';
      hasError = true;
    }

    if (!isLogin) {
      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Xác nhận mật khẩu là bắt buộc';
        hasError = true;
      } else if (formData.passWord !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Mật khẩu không khớp';
        hasError = true;
      }
    }

    setErrors(newErrors);
    if (hasError) {
      toast.error('Vui lòng điền đầy đủ và đúng các trường bắt buộc!');
    }
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    setMessage('');

    try {
      const response = await fetch('http://localhost/market_management/backend/api/user/loginUser.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nameUser: formData.nameUser,
          passWord: formData.passWord
        })
      });

      const data = await response.json();

      if (data.success) {
        if (data.user && data.user.roleUser && data.user.roleUser.toLowerCase() === 'user') {
          localStorage.setItem('user', JSON.stringify(data.user));
          localStorage.setItem('userToken', 'user-token');
          toast.success('Đăng nhập thành công!');
          setTimeout(() => {
            navigate('/user/home');
          }, 1000);
        } else if (data.user && (!data.user.roleUser || data.user.roleUser === null)) {
          toast.error('Không xác định được vai trò tài khoản. Vui lòng liên hệ quản trị viên.');
        } else {
          toast.error('Chỉ tài khoản người dùng (User) mới được phép đăng nhập tại đây!');
        }
      } else {
        toast.error(data.message || 'Đăng nhập thất bại');
      }
    } catch (error) {
      // setMessage('Lỗi kết nối server');
      toast.error('Lỗi kết nối server');
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    setMessage('');

    try {
      const response = await fetch('http://localhost/market_management/backend/api/user/addUser.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nameUser: formData.nameUser,
          passWord: formData.passWord,
          roleUser: 'User'
        })
      });

      const data = await response.json();

      if (data.success) {
        // setMessage('Đăng ký thành công! Vui lòng đăng nhập.');
        toast.success('Đăng ký thành công! Vui lòng đăng nhập.');
        setIsLogin(true);
        setFormData({
          nameUser: '',
          passWord: '',
          confirmPassword: '',
          email: '',
          phone: '',
          fullName: ''
        });
      } else {
        // setMessage(data.message || 'Đăng ký thất bại');
        toast.error(data.message || 'Đăng ký thất bại');
      }
    } catch (error) {
      // setMessage('Lỗi kết nối server');
      toast.error('Lỗi kết nối server');
      console.error('Register error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isLogin) {
      handleLogin();
    } else {
      handleRegister();
    }
  };

  const toggleMode = () => {
    setFormSwitching(true);
    setTimeout(() => {
      setIsLogin((prev) => !prev);
      setFormData({
        nameUser: '',
        passWord: '',
        confirmPassword: '',
        email: '',
        phone: '',
        fullName: ''
      });
      setErrors({});
      setMessage('');
      setFormSwitching(false);
    }, 350); // Thời gian trùng với CSS transition
  };

  return (
    <div className="user-login-page">
      <ToastContainer position="top-right" autoClose={2000} />
      <div
        className={`user-login-card form-switch-fade ${formSwitching ? 'hide' : 'form-animate-pop-in'}`}
        style={{ position: 'relative' }}
      >
        <div className="user-login-header">
          <h1 className="user-login-title">
            {isLogin ? 'Đăng Nhập' : 'Đăng Ký'}
          </h1>
          <p className="user-login-subtitle">
            {isLogin
              ? 'Chào mừng bạn quay trở lại!'
              : 'Tạo tài khoản mới để bắt đầu mua sắm'}
          </p>
        </div>

        <form className="user-login-form" onSubmit={handleSubmit}>
          <div className="user-form-group">
            <label className="user-form-label">Tên đăng nhập</label>
            <input
              type="text"
              name="nameUser"
              value={formData.nameUser}
              onChange={handleInputChange}
              className={`user-form-input ${errors.nameUser ? 'error' : ''}`}
              placeholder="Nhập tên đăng nhập"
              disabled={isLoading}
            />
          </div>
          <div className="user-form-group">
            <label className="user-form-label">Mật khẩu</label>
            <input
              type="password"
              name="passWord"
              value={formData.passWord}
              onChange={handleInputChange}
              className={`user-form-input ${errors.passWord ? 'error' : ''}`}
              placeholder="Nhập mật khẩu"
              disabled={isLoading}
            />
            {isLogin && (
              <button
                type="button"
                className="forgot-password-link"
                onClick={() => { setShowForgot(true); setForgotMsg(""); setForgotUser(""); }}
                tabIndex={0}
                disabled={isLoading}
              >
                Quên mật khẩu?
              </button>
            )}
          </div>
          {!isLogin && (
            <>
              <div className="user-form-group">
                <label className="user-form-label">Xác nhận mật khẩu</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className={`user-form-input ${errors.confirmPassword ? 'error' : ''}`}
                  placeholder="Nhập lại mật khẩu"
                  disabled={isLoading}
                />
              </div>
            </>
          )}
          <button
            type="submit"
            className="user-login-btn"
            disabled={isLoading}
          >
            {isLoading ? 'Đang xử lý...' : (isLogin ? 'Đăng Nhập' : 'Đăng Ký')}
          </button>
          {/* OR separator */}
          <div className="login-or-separator">
            <span>hoặc</span>
          </div>
          {/* Social login buttons */}
          <div className="login-social">
            <button
              type="button"
              className="login-social-btn google"
              onClick={() => alert('Tính năng đăng nhập Google đang phát triển')}
              disabled={isLoading}
            >
              <img src="https://upload.wikimedia.org/wikipedia/commons/4/4a/Logo_2013_Google.png" alt="Google" className="login-social-icon" />
              Đăng nhập với Google
            </button>
            <button
              type="button"
              className="login-social-btn facebook"
              onClick={() => alert('Tính năng đăng nhập Facebook đang phát triển')}
              disabled={isLoading}
            >
              <img src="https://upload.wikimedia.org/wikipedia/commons/5/51/Facebook_f_logo_%282019%29.svg" alt="Facebook" className="login-social-icon" />
              Đăng nhập với Facebook
            </button>
          </div>
        </form>
        {/* Forgot password modal */}
        {showForgot && (
          <div className="forgot-modal-overlay" onClick={() => setShowForgot(false)}>
            <div className="forgot-modal form-switch-fade form-animate-pop-in" onClick={e => e.stopPropagation()}>
              <button className="forgot-modal-close" onClick={() => setShowForgot(false)}>&times;</button>
              <h3 className="forgot-modal-title">Quên mật khẩu</h3>
              <p className="forgot-modal-desc">Nhập tên đăng nhập để lấy lại mật khẩu</p>
              <input
                type="text"
                className="forgot-modal-input"
                placeholder="Tên đăng nhập"
                value={forgotUser}
                onChange={e => setForgotUser(e.target.value)}
                autoFocus
              />
              <button
                className="forgot-modal-btn"
                onClick={() => setForgotMsg('Nếu tài khoản tồn tại, hướng dẫn đặt lại mật khẩu sẽ được gửi qua email (demo).')}
                disabled={!forgotUser.trim()}
              >
                Gửi yêu cầu
              </button>
              {forgotMsg && <div className="forgot-modal-msg">{forgotMsg}</div>}
            </div>
          </div>
        )}

        <div className="user-login-footer">
          <p>
            {isLogin ? 'Chưa có tài khoản?' : 'Đã có tài khoản?'}
            <button
              type="button"
              className="user-toggle-btn"
              onClick={toggleMode}
              disabled={isLoading}
            >
              {isLogin ? 'Đăng ký ngay' : 'Đăng nhập'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
