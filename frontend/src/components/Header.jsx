import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { NavLink } from 'react-router-dom'
import { toast } from 'react-toastify';

const Header = ({ onSidebarToggle, sidebarOpen }) => {
  const location = useLocation()
  const [open, setOpen] = useState(true)

  // Gọi callback để layout biết sidebar đang mở/đóng
  React.useEffect(() => {
    if (onSidebarToggle) onSidebarToggle(open)
    // eslint-disable-next-line
  }, [open])

  useEffect(() => {
    document.body.classList.toggle('sidebar-closed', !open);
  }, [open]);

  const navItems = [
    { path: '/admin', label: 'Trang chủ', icon: 'fas fa-home' },
    { path: '/admin/users', label: 'Người dùng', icon: 'fas fa-users' },
    { path: '/admin/employees', label: 'Nhân viên', icon: 'fas fa-user-tie' },
    { path: '/admin/products', label: 'Sản phẩm', icon: 'fas fa-box' },
    { path: '/admin/categories', label: 'Loại sản phẩm', icon: 'fas fa-sitemap' },
    { path: '/admin/brands', label: 'Nhãn hàng', icon: 'fas fa-tags' },
    { path: '/admin/providers', label: 'Nhà cung cấp', icon: 'fas fa-parachute-box' },
    { path: '/admin/imports', label: 'Nhập hàng', icon: 'fas fa-truck-loading' },
    { path: '/admin/orders', label: 'Đơn hàng', icon: 'fas fa-receipt' },
    { path: '/admin/promotions', label: 'Khuyến mãi', icon: 'fas fa-percent' },
    { path: '/admin/salary', label: 'Lương', icon: 'fas fa-dollar-sign' },
  ]

  const handleLogout = () => {
    // Xoá token hoặc thông tin đăng nhập admin ở đây nếu có
    localStorage.removeItem('admin');
    toast.success('Đăng xuất thành công!');
    setTimeout(() => {
      window.location.href = '/admin/login';
    }, 1000);
  }

  return (
    <>
      {/* Sidebar chỉ render khi open hoặc để transition */}
      <aside className={`sidebar-animated${open ? ' open' : ' closed'}`}
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          height: '100vh',
          position: 'fixed',
          left: open ? 0 : '-260px',
          top: 0,
          zIndex: 200,
          transition: 'left 0.3s',
          width: 260,
          background: '#fff',
          boxShadow: '2px 0 8px rgba(0,0,0,0.08)'
        }}
      >
        {/* Nút đóng (X) khi sidebar mở */}
        {open && (
          <button
            className="sidebar-hamburger-btn"
            onClick={() => setOpen(false)}
            aria-label="Đóng sidebar"
            style={{
              position: 'absolute',
              top: 20,
              right: 5,
              zIndex: 201,
              background: '#007bff',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              padding: '8px 12px',
              cursor: 'pointer',
              fontSize: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
            }}
          >
            <span style={{ fontSize: 24, fontWeight: 'bold', lineHeight: 1 }}>×</span>
          </button>
        )}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div className="sidebar-logo">
            <Link to="/admin" className="logo">
              Market Management
            </Link>
          </div>
          <nav>
            <ul className="sidebar-menu">
              {navItems.map((item) => (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    className={({ isActive }) => "sidebar-link" + (isActive ? " active" : "")}
                    end={item.path === '/admin'} // Important for home link
                  >
                    <i className={item.icon}></i>
                    <span>{item.label}</span>
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        {/* Nút Đăng xuất ở cuối sidebar */}
        <div style={{ width: '100%', textAlign: 'center', marginBottom: 24 }}>
          <button
            onClick={handleLogout}
            style={{
              background: '#e74c3c',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              padding: '10px 24px',
              fontSize: '1rem',
              fontWeight: 600,
              cursor: 'pointer',
              margin: '0 auto',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
            }}
          >
            Đăng xuất
          </button>
        </div>
      </aside>
      {/* Nút mở (3 gạch) khi sidebar đóng, luôn ở góc trái trên cùng màn hình */}
      {!open && (
        <button
          className="sidebar-hamburger-btn"
          onClick={() => setOpen(true)}
          aria-label="Mở sidebar"
          style={{
            position: 'fixed',
            top: 20,
            left: 20,
            zIndex: 201,
            background: '#007bff',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            padding: '8px 12px',
            cursor: 'pointer',
            fontSize: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
          }}
        >
          <span style={{ display: 'inline-block', width: 24, height: 24 }}>
            <span style={{
              display: 'block',
              width: 24,
              height: 3,
              background: '#fff',
              margin: '4px 0',
              borderRadius: 2
            }} />
            <span style={{
              display: 'block',
              width: 24,
              height: 3,
              background: '#fff',
              margin: '4px 0',
              borderRadius: 2
            }} />
            <span style={{
              display: 'block',
              width: 24,
              height: 3,
              background: '#fff',
              margin: '4px 0',
              borderRadius: 2
            }} />
          </span>
        </button>
      )}
    </>
  )
}

export default Header 