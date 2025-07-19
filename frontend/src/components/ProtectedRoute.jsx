import React from 'react'
import { Navigate } from 'react-router-dom'

const ProtectedRoute = ({ children }) => {
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true'
  const role = localStorage.getItem('role')
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const admin = JSON.parse(localStorage.getItem('admin') || '{}')
  
  // Kiểm tra xem user có phải là admin không
  const isAdmin = role === 'admin' || user.roleUser === 'Admin' || admin.roleUser === 'Admin'
  
  if (!isLoggedIn || !isAdmin) {
    // Nếu chưa đăng nhập hoặc không phải admin, chuyển hướng về trang đăng nhập
    return <Navigate to="/admin/login" replace />
  }
  
  return children
}

export default ProtectedRoute 