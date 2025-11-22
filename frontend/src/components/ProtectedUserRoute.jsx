import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

const ProtectedUserRoute = ({ children }) => {
  const { isLoggedIn, role, user } = useAuth()
  
  // Kiểm tra xem user có phải là user thường không
  const isUser = role === 'user' || (user && user.roleUser === 'User')
  
  if (!isLoggedIn || !isUser) {
    // Nếu chưa đăng nhập hoặc không phải user, chuyển hướng về trang home
    return <Navigate to="/user/home" replace />
  }
  
  return children
}

export default ProtectedUserRoute 