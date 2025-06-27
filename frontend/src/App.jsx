import React, { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import './App.css'

// Components
import Header from './components/Header.jsx'

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

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  return (
    <div className="App">
      <Header onSidebarToggle={setSidebarOpen} sidebarOpen={sidebarOpen} />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/users" element={<Users />} />
          <Route path="/employees" element={<Employees />} />
          <Route path="/products" element={<Products />} />
          <Route path="/providers" element={<Providers />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/promotions" element={<Promotions />} />
          <Route path="/imports" element={<Imports />} />
          <Route path="/salary" element={<Salary />} />
          <Route path="/brands" element={<Brands />} />
          <Route path="/login" element={<Login />} />
          <Route path="/orders" element={<Orders />} />
          {/* <Route path="/account-info" element={<AccountInfo />} /> */}
        </Routes>
      </main>
    </div>
  )
}

export default App 