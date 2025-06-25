import React from 'react'
import { Link } from 'react-router-dom'

const Home = () => {
  const dashboardItems = [
    {
      title: 'Quản lý người dùng',
      description: 'Quản lý tài khoản người dùng và phân quyền',
      path: '/users',
      icon: '👥'
    },
    {
      title: 'Quản lý nhân viên',
      description: 'Thông tin nhân viên và chức vụ',
      path: '/employees',
      icon: '👨‍💼'
    },
    {
      title: 'Quản lý sản phẩm',
      description: 'Danh sách sản phẩm và tồn kho',
      path: '/products',
      icon: '📦'
    },
    
    {
      title: 'Danh mục sản phẩm',
      description: 'Phân loại và quản lý danh mục',
      path: '/categories',
      icon: '📋'
    },
    {
      title: 'Nhà cung cấp',
      description: 'Quản lý thông tin nhà cung cấp',
      path: '/providers',
      icon: '🏢'
    },
    {
      title:'Danh mục sản phẩm',
      description:'Phân loại và quản lý danh mục',
      path:'/categories',
      icon:'🏚️'
    },
    {
      title: 'Quản lý thương hiệu',
      description: 'Quản lý thương hiệu sản phẩm',
      path: '/brands',
      icon: '📩'
    },
    {
      title: 'Khuyến mãi',
      description: 'Quản lý chương trình khuyến mãi',
      path: '/promotions',
      icon: '🎉'
    },
    {
      title: 'Nhập hàng',
      description: 'Quản lý quá trình nhập hàng',
      path: '/imports',
      icon: '📥'
    },
    {
      title: 'Lương nhân viên',
      description: 'Quản lý lương và thưởng',
      path: '/salary',
      icon: '💰'
    }
  ]

  return (
    <div className="page">
      <h1 className="page-title">Dashboard - Quản lý Siêu thị</h1>
      
      <div className="dashboard-grid">
        {dashboardItems.map((item, index) => (
          <div key={index} className="dashboard-card">
            <div className="dashboard-icon">{item.icon}</div>
            <h3>{item.title}</h3>
            <p>{item.description}</p>
            <Link to={item.path} className="btn btn-primary">
              Truy cập
            </Link>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Home 