import React, { useState } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import './App.css'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Components
import Header from './components/Header.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import OAuthCallback from './components/OAuthCallback.jsx'

// Pages
import Home from './pages/Admin/Home.jsx'
import Users from './pages/Admin/Users.jsx'
import Employees from './pages/Admin/Employees.jsx'
import Products from './pages/Admin/Products.jsx'
import Providers from './pages/Admin/Providers.jsx'
import Categories from './pages/Admin/Categories.jsx'
import Promotions from './pages/Admin/Promotions.jsx'
import Imports from './pages/Admin/Imports.jsx'
import Salary from './pages/Admin/Salary.jsx'
import Brands from './pages/Admin/Brands.jsx'
import Login from './pages/Admin/Login.jsx'
import Orders from './pages/Admin/Order'
// import AccountInfo from './pages/Admin/AccountInfo.jsx' 

// User Components
import UserHeader from './pages/User/components/Header.jsx'
import UserFooter from './pages/User/components/Footer.jsx'
import UserHome from './pages/User/components/Home.jsx'
import "./pages/User/css/header.css";
import "./pages/User/css/footer.css";
import "./pages/User/css/home.css";
import Groceries from './pages/User/pages/Groceries';
import Produce from './pages/User/pages/Produce';
import Household from './pages/User/pages/Household';
import Organic from './pages/User/pages/Organic';
import AccountInfo from './pages/User/pages/AccountInfo';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true'
  const role = localStorage.getItem('role') // 'admin' hoặc 'user'
  const location = useLocation();
  
  // Debug logs
  console.log('App.jsx debug:', {
    isLoggedIn,
    role,
    pathname: location.pathname,
    user: localStorage.getItem('user'),
    admin: localStorage.getItem('admin')
  });

  // Xác định có phải giao diện user không
  const isUserPage = location.pathname.startsWith('/user')
  // Chỉ render sidebar nếu đã đăng nhập, KHÔNG ở trang login, và là admin
  const showSidebar = isLoggedIn && location.pathname !== '/admin/login' && !isUserPage;

  return (
    <div className="App">
      <ToastContainer position="top-right" autoClose={2000} />
      {/* Header cho admin */}
      {showSidebar && <Header onSidebarToggle={setSidebarOpen} sidebarOpen={sidebarOpen} />}
      {/* Header cho user */}
      {isUserPage && <UserHeader />}
      <main className={`main-content${isUserPage ? ' user-main' : ''} ${!showSidebar && !isUserPage ? 'no-header' : ''}`}>
        <Routes>
          {/* Public routes */}
          <Route path="/admin/login" element={<Login />} />
          {/* OAuth callback routes */}
          <Route path="/auth/google/callback" element={<OAuthCallback />} />
          <Route path="/auth/facebook/callback" element={<OAuthCallback />} />
          {/* Protected admin routes */}
          <Route path="/admin" element={<ProtectedRoute><Navigate to="/admin/home" replace /></ProtectedRoute>} />
          <Route path="/admin/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute><Users /></ProtectedRoute>} />
          <Route path="/admin/employees" element={<ProtectedRoute><Employees /></ProtectedRoute>} />
          <Route path="/admin/products" element={<ProtectedRoute><Products /></ProtectedRoute>} />
          <Route path="/admin/providers" element={<ProtectedRoute><Providers /></ProtectedRoute>} />
          <Route path="/admin/categories" element={<ProtectedRoute><Categories /></ProtectedRoute>} />
          <Route path="/admin/promotions" element={<ProtectedRoute><Promotions /></ProtectedRoute>} />
          <Route path="/admin/imports" element={<ProtectedRoute><Imports /></ProtectedRoute>} />
          <Route path="/admin/salary" element={<ProtectedRoute><Salary /></ProtectedRoute>} />
          <Route path="/admin/brands" element={<ProtectedRoute><Brands /></ProtectedRoute>} />
          <Route path="/admin/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
          {/* User routes */}
          <Route path="/user/home/:category" element={<UserHome />} />
          <Route path="/user/home" element={<UserHome />} />
          <Route path="/user/account" element={<AccountInfo />} />
          <Route path="/user/groceries" element={<Groceries />} />
          <Route path="/user/produce" element={<Produce />} />
          <Route path="/user/household" element={<Household />} />
          <Route path="/user/organic" element={<Organic />} />
          {/* Có thể thêm các route user khác ở đây */}
          {/* Redirect root: nếu đã đăng nhập, chuyển theo role; nếu chưa, về login */}
          <Route path="/" element={
            isLoggedIn
              ? (role === 'admin' ? <Navigate to="/admin/home" replace /> : <Navigate to="/user/home" replace />)
              : <Navigate to="/admin/login" replace />
          } />
          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      {/* Footer cho user */}
      {isUserPage && <UserFooter />}
    </div>
  )
}

export default App 