import React from 'react'
import { Link, useLocation } from 'react-router-dom'

const Header = () => {
  const location = useLocation()

  const navItems = [
    { path: '/', label: 'Trang chủ' },
    { path: '/users', label: 'Quản lý người dùng' },
    { path: '/employees', label: 'Quản lý nhân viên' },
    { path: '/products', label: 'Quản lý sản phẩm' },
    { path: '/providers', label: 'Quản lý nhà cung cấp' },
    { path: '/categories', label: 'Danh mục sản phẩm' },
    { path: '/promotions', label: 'Khuyến mãi' },
    { path: '/imports', label: 'Nhập hàng' },
    { path: '/salary', label: 'Lương nhân viên' }
    // { path: '/login', label: 'Đăng nhập' }
  ]

  return (
    <aside className="sidebar">
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
  )
}

export default Header 