import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'

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
    { path: '/', label: 'Trang chủ' },
    { path: '/users', label: 'Quản lý người dùng' },
    { path: '/employees', label: 'Quản lý nhân viên' },
    { path: '/products', label: 'Quản lý sản phẩm' },
    { path: '/providers', label: 'Quản lý nhà cung cấp' },
    { path: '/categories', label: 'Danh mục sản phẩm' },
    { path: '/brands', label: 'Quản lý nhãn hàng' },
    { path: '/promotions', label: 'Khuyến mãi' },
    { path: '/imports', label: 'Nhập hàng' },
    { path: '/salary', label: 'Lương nhân viên' }
    // { path: '/login', label: 'Đăng nhập' }
  ]

  return (
    <>
      {/* Sidebar chỉ render khi open hoặc để transition */}
      <aside className={`sidebar-animated${open ? ' open' : ' closed'}`}>
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
        <div className="sidebar-logo">
          <Link to="/" className="logo">
            Market Management
          </Link>
        </div>
        <nav>
          <ul className="sidebar-menu">
            {navItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={location.pathname === item.path ? 'active' : ''}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
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