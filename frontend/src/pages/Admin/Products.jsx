import React, { useState, useEffect } from 'react'
import axios from 'axios'

const Products = () => {
  const [products, setProducts] = useState([])
  const [providers, setProviders] = useState([])
  const [categories, setCategories] = useState([])
  const [promotions, setPromotions] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    nameProduct: '',
    descriptionProduct: '',
    idProvider: '',
    amountProduct: '',
    idType: '',
    importCost: '',
    exportCost: '',
    idPromotion: ''
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [productsRes, providersRes, categoriesRes, promotionsRes] = await Promise.all([
        axios.get('/api/products'),
        axios.get('/api/providers'),
        axios.get('/api/categories'),
        axios.get('/api/promotions')
      ])
      
      setProducts(productsRes.data)
      setProviders(providersRes.data)
      setCategories(categoriesRes.data)
      setPromotions(promotionsRes.data)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await axios.post('/api/products', formData)
      setShowForm(false)
      setFormData({
        nameProduct: '',
        descriptionProduct: '',
        idProvider: '',
        amountProduct: '',
        idType: '',
        importCost: '',
        exportCost: '',
        idPromotion: ''
      })
      fetchData()
    } catch (error) {
      console.error('Error creating product:', error)
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc muốn xóa sản phẩm này?')) {
      try {
        await axios.delete(`/api/products/${id}`)
        fetchData()
      } catch (error) {
        console.error('Error deleting product:', error)
      }
    }
  }

  if (loading) return <div className="page">Đang tải...</div>

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Quản lý sản phẩm</h1>
        <button 
          className="btn btn-primary" 
          onClick={() => setShowForm(true)}
        >
          Thêm sản phẩm mới
        </button>
      </div>

      {showForm && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Thêm sản phẩm mới</h2>
            <form onSubmit={handleSubmit} className="form">
              <div className="form-group">
                <label className="form-label">Tên sản phẩm:</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.nameProduct}
                  onChange={(e) => setFormData({...formData, nameProduct: e.target.value})}
                  required
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Mô tả:</label>
                <textarea
                  className="form-input"
                  value={formData.descriptionProduct}
                  onChange={(e) => setFormData({...formData, descriptionProduct: e.target.value})}
                  required
                />
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
                <label className="form-label">Số lượng:</label>
                <input
                  type="number"
                  className="form-input"
                  value={formData.amountProduct}
                  onChange={(e) => setFormData({...formData, amountProduct: e.target.value})}
                  required
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Danh mục:</label>
                <select
                  className="form-input"
                  value={formData.idType}
                  onChange={(e) => setFormData({...formData, idType: e.target.value})}
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
                <label className="form-label">Giá nhập:</label>
                <input
                  type="number"
                  className="form-input"
                  value={formData.importCost}
                  onChange={(e) => setFormData({...formData, importCost: e.target.value})}
                  required
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Giá bán:</label>
                <input
                  type="number"
                  className="form-input"
                  value={formData.exportCost}
                  onChange={(e) => setFormData({...formData, exportCost: e.target.value})}
                  required
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Khuyến mãi:</label>
                <select
                  className="form-input"
                  value={formData.idPromotion}
                  onChange={(e) => setFormData({...formData, idPromotion: e.target.value})}
                >
                  <option value="">Không có khuyến mãi</option>
                  {promotions.map(promotion => (
                    <option key={promotion.idPromotion} value={promotion.idPromotion}>
                      {promotion.namePromotion} ({promotion.percentPromotion}%)
                    </option>
                  ))}
                </select>
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
              <th>Tên sản phẩm</th>
              <th>Mô tả</th>
              <th>Nhà cung cấp</th>
              <th>Số lượng</th>
              <th>Danh mục</th>
              <th>Giá nhập</th>
              <th>Giá bán</th>
              <th>Khuyến mãi</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.idProduct}>
                <td>{product.idProduct}</td>
                <td>{product.nameProduct}</td>
                <td>{product.descriptionProduct}</td>
                <td>{providers.find(p => p.idProvider === product.idProvider)?.nameProvider}</td>
                <td>{product.amountProduct}</td>
                <td>{categories.find(c => c.idType === product.idType)?.nameType}</td>
                <td>{product.importCost?.toLocaleString()} VNĐ</td>
                <td>{product.exportCost?.toLocaleString()} VNĐ</td>
                <td>{promotions.find(p => p.idPromotion === product.idPromotion)?.namePromotion || 'Không có'}</td>
                <td>
                  <button 
                    className="btn btn-secondary btn-sm"
                    onClick={() => handleDelete(product.idProduct)}
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

export default Products 