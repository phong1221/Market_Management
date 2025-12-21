import React, { useState } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import './App.css'
import './css/admin-search.css'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useAuth } from './hooks/useAuth';

// Components
import Header from './components/Header.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import ProtectedUserRoute from './components/ProtectedUserRoute.jsx'
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
import Statistics from './pages/Admin/Statistics.jsx'
import POS from './pages/Admin/POS.jsx'
import Customers from './pages/Admin/Customers.jsx'
import PaymentHistory from './pages/Admin/PaymentHistory.jsx'
import AdminCoupons from './pages/Admin/Coupons.jsx'
import Permissions from './pages/Admin/Permissions.jsx'

// User Components
import UserHeader from './pages/User/components/Header.jsx'
import UserFooter from './pages/User/components/Footer.jsx'
import UserHome from './pages/User/components/Home.jsx'

import TypeProductPage from './pages/User/pages/TypeProductPage';
import StoreInfo from './pages/User/pages/StoreInfo';
import Contact from './pages/User/pages/Contact';
import AccountInfo from './pages/User/pages/AccountInfo';
import Wishlist from './pages/User/pages/Wishlist';
import ShoppingCart from './pages/User/pages/ShoppingCart';
import ProductDetail from './pages/User/pages/ProductDetail.jsx';
import Checkout from './pages/User/pages/Checkout.jsx';
import OrderHistory from './pages/User/pages/OrderHistory.jsx';
import OrderHistoryDebug from './pages/User/pages/OrderHistoryDebug.jsx';
import VNPayReturn from './pages/User/pages/VNPayReturn.jsx';
import VNPayDemo from './pages/User/pages/VNPayDemo.jsx';
import VNPayTest from './components/VNPayTest.jsx';
import Coupons from './pages/User/pages/Coupons.jsx';


function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const { isLoggedIn, role, user } = useAuth();
  const location = useLocation();
  const state = location.state;

  // Debug logs
  console.log('App.jsx debug:', {
    isLoggedIn,
    role,
    pathname: location.pathname,
    user: user,
    admin: localStorage.getItem('admin')
  });

  // Xác định có phải giao diện user không
  const isUserPage =
    location.pathname.startsWith('/user') ||
    location.pathname.startsWith('/vnpay_return');
  // Chỉ render sidebar nếu đã đăng nhập, KHÔNG ở trang login, và là admin
  const showSidebar = isLoggedIn && location.pathname !== '/admin/login' && !isUserPage;

  return (
    <div className="App">
      <ToastContainer
        position="top-right"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      {/* Header cho admin */}
      {showSidebar && <Header onSidebarToggle={setSidebarOpen} sidebarOpen={sidebarOpen} />}
      {/* Header cho user */}
      {isUserPage && <UserHeader />}
      <main className={`main-content${isUserPage ? ' user-main' : ''} ${!showSidebar && !isUserPage ? 'no-header' : ''}`}>
        <Routes location={state?.backgroundLocation || location}>
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
          <Route path="/admin/pos" element={<ProtectedRoute><POS /></ProtectedRoute>} />
          <Route path="/admin/customers" element={<ProtectedRoute><Customers /></ProtectedRoute>} />
          <Route path="/admin/payment-history" element={<ProtectedRoute><PaymentHistory /></ProtectedRoute>} />
          <Route path="/admin/coupons" element={<ProtectedRoute><AdminCoupons /></ProtectedRoute>} />
          <Route path="/admin/permissions" element={<ProtectedRoute><Permissions /></ProtectedRoute>} />
          <Route path="/admin/statistics" element={<ProtectedRoute><Statistics /></ProtectedRoute>} />
          {/* User routes */}
          <Route path="/user/home/:category" element={<UserHome />} />
          <Route path="/user/home" element={<UserHome />} />
          <Route path="/user/account" element={<ProtectedUserRoute><AccountInfo /></ProtectedUserRoute>} />
          <Route path="/user/orders" element={<ProtectedUserRoute><OrderHistory /></ProtectedUserRoute>} />
          <Route path="/user/orders-debug" element={<ProtectedUserRoute><OrderHistoryDebug /></ProtectedUserRoute>} />
          <Route path="/user/wishlist" element={<ProtectedUserRoute><Wishlist /></ProtectedUserRoute>} />
          <Route path="/user/cart" element={<ProtectedUserRoute><ShoppingCart /></ProtectedUserRoute>} />
          <Route path="/user/category/:idType" element={<TypeProductPage />} />
          <Route path="/user/store-info" element={<StoreInfo />} />
          <Route path="/user/contact" element={<Contact />} />
          <Route path="/user/checkout" element={<Checkout />} />
          <Route path="/user/coupons" element={<Coupons />} />
          <Route path="/user/product/:idProduct" element={<ProductDetail />} />
          <Route path="/vnpay_return" element={<VNPayReturn />} />
          <Route path="/vnpay-demo" element={<VNPayDemo />} />
          <Route path="/vnpay-test" element={<VNPayTest />} />

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
        {/* Modal route overlay cho ProductDetail */}
        {state?.backgroundLocation && (
          <Routes>
            <Route path="/user/product/:idProduct" element={<ProductDetail />} />
          </Routes>
        )}
      </main>
      {/* Footer cho user */}
      {isUserPage && <UserFooter />}
    </div>
  )
}

export default App 