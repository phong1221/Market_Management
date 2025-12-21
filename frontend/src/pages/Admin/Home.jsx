import React from 'react'
import { Link } from 'react-router-dom'
import '../../css/dashboard.css'
// Import Icons
import {
  BiUser, BiUserPin, BiIdCard, BiShieldQuarter, BiMoney, // Users
  BiPackage, BiCategory, BiPurchaseTag, BiStore, BiImport, // Products
  BiCalculator, BiReceipt, BiHistory, BiGift, BiSolidCoupon, // Sales
  BiChart, BiRightArrowAlt // Stats & Action
} from "react-icons/bi";

const Home = () => {
  // Define grouped modules matching Sidebar structure
  const groups = [
    {
      title: 'Quản lý Người dùng',
      className: 'user-card',
      items: [
        { title: 'Người dùng', desc: 'Quản lý tài khoản hệ thống', path: '/admin/users', icon: <BiUser /> },
        { title: 'Khách hàng', desc: 'Thông tin hồ sơ khách hàng', path: '/admin/customers', icon: <BiUserPin /> },
        { title: 'Nhân viên', desc: 'Danh sách và chức vụ', path: '/admin/employees', icon: <BiIdCard /> },
        { title: 'Phân quyền', desc: 'Cấu hình quyền truy cập', path: '/admin/permissions', icon: <BiShieldQuarter /> },
        { title: 'Lương', desc: 'Quản lý lương thưởng', path: '/admin/salary', icon: <BiMoney /> },
      ]
    },
    {
      title: 'Quản lý Sản phẩm',
      className: 'product-card',
      items: [
        { title: 'Sản phẩm', desc: 'Kho hàng và giá cả', path: '/admin/products', icon: <BiPackage /> },
        { title: 'Loại sản phẩm', desc: 'Phân loại danh mục', path: '/admin/categories', icon: <BiCategory /> },
        { title: 'Nhãn hàng', desc: 'Thương hiệu đối tác', path: '/admin/brands', icon: <BiPurchaseTag /> },
        { title: 'Nhà cung cấp', desc: 'Nguồn nhập hàng', path: '/admin/providers', icon: <BiStore /> },
        { title: 'Nhập hàng', desc: 'Quản lý phiếu nhập', path: '/admin/imports', icon: <BiImport /> },
      ]
    },
    {
      title: 'Quản lý Bán hàng',
      className: 'sales-card',
      items: [
        { title: 'Bán hàng (POS)', desc: 'Tạo đơn hàng tại quầy', path: '/admin/pos', icon: <BiCalculator /> },
        { title: 'Đơn hàng', desc: 'Theo dõi đơn đặt hàng', path: '/admin/orders', icon: <BiReceipt /> },
        { title: 'Lịch sử thanh toán', desc: 'Giao dịch tài chính', path: '/admin/payment-history', icon: <BiHistory /> },
        { title: 'Khuyến mãi', desc: 'Chương trình giảm giá', path: '/admin/promotions', icon: <BiGift /> },
        { title: 'Mã giảm giá', desc: 'Coupon và Voucher', path: '/admin/coupons', icon: <BiSolidCoupon /> },
      ]
    },
    {
      title: 'Thống kê & Báo cáo',
      className: 'stats-card',
      items: [
        { title: 'Thống kê', desc: 'Biểu đồ doanh thu & tăng trưởng', path: '/admin/statistics', icon: <BiChart /> },
      ]
    }
  ];

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <h1 className="dashboard-title">Tổng quan hệ thống</h1>
        <p className="dashboard-subtitle">Chào mừng trở lại! Dưới đây là tổng quan các chức năng của dự án này.</p>
      </div>

      {groups.map((group, groupIndex) => (
        <div key={groupIndex} className="dashboard-section">
          <h2 className="section-title">
            {group.title}
          </h2>
          <div className="dashboard-grid">
            {group.items.map((item, itemIndex) => (
              <Link
                to={item.path}
                key={itemIndex}
                className={`dashboard-card ${group.className}`}
              >
                <div className="card-action">
                  <BiRightArrowAlt size={24} />
                </div>
                <div className="card-icon-wrapper">
                  <span className="card-icon">{item.icon}</span>
                </div>
                <div className="card-content">
                  <h3>{item.title}</h3>
                  <p>{item.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

export default Home 