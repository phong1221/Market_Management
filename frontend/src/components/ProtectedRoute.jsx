import React from 'react'
import { Navigate } from 'react-router-dom'

const ProtectedRoute = ({ children }) => {
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true'
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  
  // Kiểm tra xem user có phải là admin không
  const isAdmin = user.roleUser === 'Admin'
  
  if (!isLoggedIn || !isAdmin) {
    // Nếu chưa đăng nhập hoặc không phải admin, chuyển hướng về trang đăng nhập
    return <Navigate to="/admin/login" replace />
  }
  
  return children
}

export default ProtectedRoute 