import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { NavLink } from 'react-router-dom'

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
    { path: '/', label: 'Trang chủ', icon: 'fas fa-home' },
    { path: '/users', label: 'Người dùng', icon: 'fas fa-users' },
    { path: '/employees', label: 'Nhân viên', icon: 'fas fa-user-tie' },
    { path: '/products', label: 'Sản phẩm', icon: 'fas fa-box' },
    { path: '/categories', label: 'Loại sản phẩm', icon: 'fas fa-sitemap' },
    { path: '/brands', label: 'Nhãn hàng', icon: 'fas fa-tags' },
    { path: '/providers', label: 'Nhà cung cấp', icon: 'fas fa-parachute-box' },
    { path: '/imports', label: 'Nhập hàng', icon: 'fas fa-truck-loading' },
    { path: '/orders', label: 'Đơn hàng', icon: 'fas fa-receipt' },
    { path: '/promotions', label: 'Khuyến mãi', icon: 'fas fa-percent' },
    { path: '/salary', label: 'Lương', icon: 'fas fa-dollar-sign' },
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
                <NavLink
                  to={item.path}
                  className={({ isActive }) => "sidebar-link" + (isActive ? " active" : "")}
                  end={item.path === '/'} // Important for home link
                >
                  <i className={item.icon}></i>
                  <span>{item.label}</span>
                </NavLink>
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