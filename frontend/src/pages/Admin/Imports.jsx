import React, { useState, useEffect } from 'react'
import axios from 'axios'

const Imports = () => {
  const [imports, setImports] = useState([])
  const [products, setProducts] = useState([])
  const [providers, setProviders] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    idProduct: '',
    idProvider: '',
    idTypeProduct: '',
    amount: '',
    costImport: '',
    costExport: '',
    amountStock: ''
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [importsRes, productsRes, providersRes, categoriesRes] = await Promise.all([
        axios.get('/api/imports'),
        axios.get('/api/products'),
        axios.get('/api/providers'),
        axios.get('/api/categories')
      ])
      
      setImports(importsRes.data)
      setProducts(productsRes.data)
      setProviders(providersRes.data)
      setCategories(categoriesRes.data)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await axios.post('/api/imports', formData)
      setShowForm(false)
      setFormData({
        idProduct: '',
        idProvider: '',
        idTypeProduct: '',
        amount: '',
        costImport: '',
        costExport: '',
        amountStock: ''
      })
      fetchData()
    } catch (error) {
      console.error('Error creating import:', error)
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc muốn xóa phiếu nhập hàng này?')) {
      try {
        await axios.delete(`/api/imports/${id}`)
        fetchData()
      } catch (error) {
        console.error('Error deleting import:', error)
      }
    }
  }

  if (loading) return <div className="page">Đang tải...</div>

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Quản lý nhập hàng</h1>
        <button 
          className="btn btn-primary" 
          onClick={() => setShowForm(true)}
        >
          Tạo phiếu nhập hàng mới
        </button>
      </div>

      {showForm && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Tạo phiếu nhập hàng mới</h2>
            <form onSubmit={handleSubmit} className="form">
              <div className="form-group">
                <label className="form-label">Sản phẩm:</label>
                <select
                  className="form-input"
                  value={formData.idProduct}
                  onChange={(e) => setFormData({...formData, idProduct: e.target.value})}
                  required
                >
                  <option value="">Chọn sản phẩm</option>
                  {products.map(product => (
                    <option key={product.idProduct} value={product.idProduct}>
                      {product.nameProduct}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label className="form-label">Nhà cung cấp:</label>
                <select
                  className="form-input"
                  value={formData.idProvider}
                  onChange={(e) => setFormData({...formData, idProvider: e.target.value})}
                  required
                >
                  <option value="">Chọn nhà cung cấp</option>
                  {providers.map(provider => (
                    <option key={provider.idProvider} value={provider.idProvider}>
                      {provider.nameProvider}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label className="form-label">Danh mục sản phẩm:</label>
                <select
                  className="form-input"
                  value={formData.idTypeProduct}
                  onChange={(e) => setFormData({...formData, idTypeProduct: e.target.value})}
                  required
                >
                  <option value="">Chọn danh mục</option>
                  {categories.map(category => (
                    <option key={category.idType} value={category.idType}>
                      {category.nameType}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label className="form-label">Số lượng nhập:</label>
                <input
                  type="number"
                  className="form-input"
                  value={formData.amount}
                  onChange={(e) => setFormData({...formData, amount: e.target.value})}
                  required
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Giá nhập:</label>
                <input
                  type="number"
                  className="form-input"
                  value={formData.costImport}
                  onChange={(e) => setFormData({...formData, costImport: e.target.value})}
                  required
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Giá bán:</label>
                <input
                  type="number"
                  className="form-input"
                  value={formData.costExport}
                  onChange={(e) => setFormData({...formData, costExport: e.target.value})}
                  required
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Số lượng tồn kho:</label>
                <input
                  type="number"
                  className="form-input"
                  value={formData.amountStock}
                  onChange={(e) => setFormData({...formData, amountStock: e.target.value})}
                  required
                />
              </div>
              
              <div className="form-actions">
                <button type="submit" className="btn btn-primary">Lưu</button>
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => setShowForm(false)}
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Sản phẩm</th>
              <th>Nhà cung cấp</th>
              <th>Danh mục</th>
              <th>Số lượng nhập</th>
              <th>Giá nhập</th>
              <th>Giá bán</th>
              <th>Tồn kho</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {imports.map((importItem) => (
              <tr key={importItem.idImportProduct}>
                <td>{importItem.idImportProduct}</td>
                <td>{products.find(p => p.idProduct === importItem.idProduct)?.nameProduct}</td>
                <td>{providers.find(p => p.idProvider === importItem.idProvider)?.nameProvider}</td>
                <td>{categories.find(c => c.idType === importItem.idTypeProduct)?.nameType}</td>
                <td>{importItem.amount}</td>
                <td>{importItem.costImport?.toLocaleString()} VNĐ</td>
                <td>{importItem.costExport?.toLocaleString()} VNĐ</td>
                <td>{importItem.amountStock}</td>
                <td>
                  <button 
                    className="btn btn-secondary btn-sm"
                    onClick={() => handleDelete(importItem.idImportProduct)}
                  >
                    Xóa
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Imports 