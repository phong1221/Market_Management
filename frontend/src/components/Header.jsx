import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { NavLink } from 'react-router-dom'
import { toast } from 'react-toastify';
import './Sidebar.css';

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

  const [openMenus, setOpenMenus] = useState({});

  useEffect(() => {
    // Auto-open menu if current path is inside it
    const newOpenMenus = {};
    navItems.forEach(item => {
      if (item.children) {
        item.children.forEach(child => {
          if (location.pathname.startsWith(child.path)) {
            newOpenMenus[item.label] = true;
          }
        });
      }
    });
    setOpenMenus(prev => ({ ...prev, ...newOpenMenus }));
  }, [location.pathname]);

  const toggleMenu = (label) => {
    setOpenMenus(prev => ({ ...prev, [label]: !prev[label] }));
  };

  const navItems = [
    { path: '/admin', label: 'Trang chủ', icon: 'fas fa-home' },
    {
      label: 'Quản lý Người dùng', icon: 'fas fa-users-cog', children: [ // Group 1
        { path: '/admin/users', label: 'Người dùng', icon: 'fas fa-users' },
        { path: '/admin/customers', label: 'Khách hàng', icon: 'fas fa-user-tag' },
        { path: '/admin/employees', label: 'Nhân viên', icon: 'fas fa-user-tie' },
        { path: '/admin/permissions', label: 'Phân quyền', icon: 'fas fa-user-shield' },
        { path: '/admin/salary', label: 'Lương', icon: 'fas fa-dollar-sign' },
      ]
    },
    {
      label: 'Quản lý Sản phẩm', icon: 'fas fa-boxes', children: [ // Group 2
        { path: '/admin/products', label: 'Sản phẩm', icon: 'fas fa-box' },
        { path: '/admin/categories', label: 'Loại sản phẩm', icon: 'fas fa-sitemap' },
        { path: '/admin/brands', label: 'Nhãn hàng', icon: 'fas fa-tags' },
        { path: '/admin/providers', label: 'Nhà cung cấp', icon: 'fas fa-parachute-box' },
        { path: '/admin/imports', label: 'Nhập hàng', icon: 'fas fa-truck-loading' },
      ]
    },
    {
      label: 'Quản lý Bán hàng', icon: 'fas fa-cash-register', children: [ // Group 3
        { path: '/admin/pos', label: 'Bán hàng (POS)', icon: 'fas fa-calculator' },
        { path: '/admin/orders', label: 'Đơn hàng', icon: 'fas fa-receipt' },
        { path: '/admin/payment-history', label: 'Lịch sử thanh toán', icon: 'fas fa-file-invoice-dollar' },
        { path: '/admin/promotions', label: 'Khuyến mãi', icon: 'fas fa-percent' },
        { path: '/admin/coupons', label: 'Mã giảm giá', icon: 'fas fa-ticket-alt' },
      ]
    },
    { path: '/admin/statistics', label: 'Thống kê', icon: 'fas fa-chart-bar' },
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
      {/* Sidebar chỉ render khi open hoặc để transition */}
      <aside className={`sidebar-animated${open ? ' open' : ' closed'}`}>
        {/* Nút đóng (X) khi sidebar mở */}
        {open && (
          <button
            className="sidebar-close-btn"
            onClick={() => setOpen(false)}
            aria-label="Đóng sidebar"
          >
            {/* SVG Close Icon (X) */}
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        )}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div className="sidebar-header">
            <Link to="/admin" className="sidebar-logo">
              <i className="fas fa-cubes"></i>
              Market Management
            </Link>
          </div>
          <nav>
            <ul className="sidebar-menu">
              {navItems.map((item, index) => {
                if (item.children) {
                  const isOpen = openMenus[item.label];
                  return (
                    <li key={index} className="sidebar-menu-item">
                      <div
                        className={`sidebar-link${isOpen ? ' active-parent' : ''}`} // Style parent as link
                        onClick={() => toggleMenu(item.label)}
                        style={{ cursor: 'pointer' }}
                        aria-expanded={isOpen}
                      >
                        <div className="link-content">
                          <i className={item.icon}></i>
                          <span>{item.label}</span>
                        </div>
                        <i className={`fas fa-chevron-${isOpen ? 'up' : 'down'} sidebar-chevron`}></i>
                      </div>
                      <ul className={`sidebar-submenu${isOpen ? ' open' : ''}`}>
                        {item.children.map((child) => (
                          <li key={child.path} className="sidebar-submenu-item">
                            <NavLink
                              to={child.path}
                              className={({ isActive }) => "sidebar-sublink" + (isActive ? " active" : "")}
                            >
                              <span>{child.label}</span>
                            </NavLink>
                          </li>
                        ))}
                      </ul>
                    </li>
                  )
                }
                return (
                  <li key={item.path} className="sidebar-menu-item">
                    <NavLink
                      to={item.path}
                      className={({ isActive }) => "sidebar-link" + (isActive ? " active" : "")}
                      end={item.path === '/admin'} // Important for home link
                    >
                      <div className="link-content">
                        <i className={item.icon}></i>
                        <span>{item.label}</span>
                      </div>
                    </NavLink>
                  </li>
                )
              })}
            </ul>
          </nav>
        </div>
        {/* Nút Đăng xuất ở cuối sidebar */}
        <div className="sidebar-footer">
          <button
            onClick={handleLogout}
            className="btn-logout"
          >
            <i className="fas fa-sign-out-alt"></i>
            <span>Đăng xuất</span>
          </button>
        </div>
      </aside>
      {/* Nút mở (3 gạch) khi sidebar đóng, luôn ở góc trái trên cùng màn hình */}
      {/* Nút mở (3 gạch) khi sidebar đóng, luôn ở góc trái trên cùng màn hình */}
      {!open && (
        <button
          className="sidebar-hamburger-btn"
          onClick={() => setOpen(true)}
          aria-label="Mở sidebar"
        // Removed inline styles, moved to .sidebar-hamburger-btn in Sidebar.css (I need to add this class there)
        >
          {/* SVG Menu Icon (Hamburger) */}
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 12H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M3 6H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M3 18H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      )}
    </>
  )
}

export default Header