import React, { useState, useEffect } from 'react'
import axios from 'axios'

const Categories = () => {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    nameType: '',
    descriptionType: '',
    inventory: ''
  })

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await axios.get('/api/categories')
      setCategories(response.data)
    } catch (error) {
      console.error('Error fetching categories:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await axios.post('/api/categories', formData)
      setShowForm(false)
      setFormData({
        nameType: '',
        descriptionType: '',
        inventory: ''
      })
      fetchCategories()
    } catch (error) {
      console.error('Error creating category:', error)
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc muốn xóa danh mục này?')) {
      try {
        await axios.delete(`/api/categories/${id}`)
        fetchCategories()
      } catch (error) {
        console.error('Error deleting category:', error)
      }
    }
  }

  if (loading) return <div className="page">Đang tải...</div>

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Quản lý danh mục sản phẩm</h1>
        <button 
          className="btn btn-primary" 
          onClick={() => setShowForm(true)}
        >
          Thêm danh mục mới
        </button>
      </div>

      {showForm && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Thêm danh mục mới</h2>
            <form onSubmit={handleSubmit} className="form">
              <div className="form-group">
                <label className="form-label">Tên danh mục:</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.nameType}
                  onChange={(e) => setFormData({...formData, nameType: e.target.value})}
                  required
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Mô tả:</label>
                <textarea
                  className="form-input"
                  value={formData.descriptionType}
                  onChange={(e) => setFormData({...formData, descriptionType: e.target.value})}
                  required
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Tồn kho:</label>
                <input
                  type="number"
                  className="form-input"
                  value={formData.inventory}
                  onChange={(e) => setFormData({...formData, inventory: e.target.value})}
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
              <th>Tên danh mục</th>
              <th>Mô tả</th>
              <th>Tồn kho</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((category) => (
              <tr key={category.idType}>
                <td>{category.idType}</td>
                <td>{category.nameType}</td>
                <td>{category.descriptionType}</td>
                <td>{category.inventory}</td>
                <td>
                  <button 
                    className="btn btn-secondary btn-sm"
                    onClick={() => handleDelete(category.idType)}
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

export default Categories 