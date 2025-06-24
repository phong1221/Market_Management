import React, { useState, useEffect } from 'react'
import { fetchTypeProducts, addTypeProduct, updateTypeProduct, deleteTypeProduct } from '../../services/typeProductService'
import '../../css/notification.css'
import TypeProduct from '../../models/typeProduct'

const Categories = () => {
  const [typeProducts, setTypeProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formType, setFormType] = useState('add')
  const [formData, setFormData] = useState(new TypeProduct('', '', '', 0, 'Số lượng'))
  const [notification, setNotification] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [searchCriteria, setSearchCriteria] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const ITEMS_PER_PAGE = 5

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000)
      return () => clearTimeout(timer)
    }
  }, [notification])

  const fetchData = async () => {
    setLoading(true)
    try {
      const data = await fetchTypeProducts()
      setTypeProducts(data)
    } catch (error) {
      setNotification({ message: 'Lỗi khi tải danh mục: ' + error.message, type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = () => {
    setFormType('add')
    setFormData(new TypeProduct('', '', '', 0, 'Số lượng'))
    setShowForm(true)
  }

  const handleEdit = (category) => {
    setFormType('edit')
    setFormData(new TypeProduct(category.idType, category.nameType, category.descriptionType, category.inventory, category.typeSell))
    setShowForm(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.nameType.trim() || !formData.descriptionType.trim() || !formData.typeSell) {
      setNotification({ message: 'Vui lòng điền đầy đủ thông tin', type: 'error' })
      return
    }

    try {
      let result
      if (formType === 'edit') {
        result = await updateTypeProduct(formData)
      } else {
        result = await addTypeProduct(formData)
      }

      if (result.success) {
        fetchData()
        setNotification({ message: `${formType === 'edit' ? 'Cập nhật' : 'Thêm'} danh mục thành công`, type: 'success' })
        setShowForm(false)
      } else {
        setNotification({ message: result.message, type: 'error' })
      }
    } catch (error) {
      setNotification({ message: 'Lỗi khi lưu danh mục: ' + error.message, type: 'error' })
    }
  }

  const handleDelete = (id) => {
    setConfirmDelete(id)
  }

  const confirmDeleteItem = async (id) => {
    try {
      const result = await deleteTypeProduct(id)
      if (result.success) {
        fetchData()
        setNotification({ message: 'Xóa danh mục thành công', type: 'success' })
      } else {
        setNotification({ message: result.message || 'Xóa danh mục thất bại', type: 'error' })
      }
    } catch (error) {
      setNotification({ message: 'Lỗi khi xóa danh mục: ' + error.message, type: 'error' })
    } finally {
      setConfirmDelete(null)
    }
  }

  const cancelDelete = () => {
    setConfirmDelete(null)
  }

  // Search & Pagination
  const filterData = () => {
    if (!searchTerm.trim()) return typeProducts
    return typeProducts.filter(item => {
      const searchLower = searchTerm.toLowerCase()
      switch (searchCriteria) {
        case 'nameType':
          return item.nameType.toLowerCase().includes(searchLower)
        case 'descriptionType':
          return item.descriptionType.toLowerCase().includes(searchLower)
        case 'typeSell':
          return item.typeSell && item.typeSell.toLowerCase().includes(searchLower)
        case 'all':
          return (
            item.nameType.toLowerCase().includes(searchLower) ||
            item.descriptionType.toLowerCase().includes(searchLower) ||
            (item.typeSell && item.typeSell.toLowerCase().includes(searchLower))
          )
        default:
          return true
      }
    })
  }

  const filteredData = filterData()
  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const currentData = filteredData.slice(startIndex, startIndex + ITEMS_PER_PAGE)

  const handlePageChange = (page) => {
    setCurrentPage(page)
  }

  const renderPagination = () => {
    if (totalPages <= 1) return null
    const pages = []
    for (let i = 1; i <= totalPages; i++) {
      pages.push(
        <button
          key={i}
          className={`pagination-button ${currentPage === i ? 'active' : ''}`}
          onClick={() => handlePageChange(i)}
        >
          {i}
        </button>
      )
    }
    return (
      <div className="pagination-container">
        {pages}
        <span className="pagination-info">
          Trang {currentPage} / {totalPages}
        </span>
      </div>
    )
  }
  
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  if (loading) return <div className="page">Đang tải...</div>

  return (
    <div className="page">
      {notification && (
        <div className={`notification-container notification-${notification.type}`}>
          {notification.message}
        </div>
      )}
      {confirmDelete && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Xác nhận xóa</h2>
            <p>Bạn có chắc chắn muốn xóa danh mục này?</p>
            <div className="form-actions">
              <button className="btn btn-danger" onClick={() => confirmDeleteItem(confirmDelete)}>Xóa</button>
              <button className="btn btn-secondary" onClick={cancelDelete}>Hủy</button>
            </div>
          </div>
        </div>
      )}
      <div className="page-header">
        <h1 className="page-title">Quản lý danh mục sản phẩm</h1>
        <button className="btn btn-primary" onClick={handleAdd}>
          Thêm danh mục mới
        </button>
      </div>

      <div className="search-container" style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
        <input
          type="text"
          placeholder="Nhập từ khóa tìm kiếm..."
          value={searchTerm}
          onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
          className="form-input"
          style={{ flex: 1 }}
        />
        <select
          value={searchCriteria}
          onChange={(e) => { setSearchCriteria(e.target.value); setCurrentPage(1); }}
          className="form-input"
          style={{ width: 'auto' }}
        >
          <option value="all">Tất cả</option>
          <option value="nameType">Tên danh mục</option>
          <option value="descriptionType">Mô tả</option>
          <option value="typeSell">Kiểu bán</option>
        </select>
      </div>

      {showForm && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>{formType === 'add' ? 'Thêm danh mục mới' : 'Sửa danh mục'}</h2>
            <form onSubmit={handleSubmit} className="form">
              {formType === 'edit' && (
                <div className="form-group">
                  <label className="form-label">ID:</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.idType}
                    readOnly
                    style={{ backgroundColor: '#f5f5f5' }}
                  />
                </div>
              )}
              <div className="form-group">
                <label className="form-label">Tên danh mục:</label>
                <input
                  type="text"
                  name="nameType"
                  className="form-input"
                  value={formData.nameType}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Mô tả:</label>
                <textarea
                  name="descriptionType"
                  className="form-input"
                  value={formData.descriptionType}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Tồn kho:</label>
                <input
                  type="number"
                  name="inventory"
                  className="form-input"
                  value={formData.inventory}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Kiểu bán:</label>
                <select
                  name="typeSell"
                  className="form-input"
                  value={formData.typeSell}
                  onChange={handleInputChange}
                  required
                >
                  <option value="Số lượng">Số lượng</option>
                  <option value="Khối lượng">Khối lượng</option>
                </select>
              </div>
              <div className="form-actions">
                <button type="submit" className="btn btn-primary">Lưu</button>
                <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>
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
              <th>Kiểu bán</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {currentData.map((category) => (
              <tr key={category.idType}>
                <td>{category.idType}</td>
                <td>{category.nameType}</td>
                <td>{category.descriptionType}</td>
                <td>{category.inventory}</td>
                <td>{category.typeSell}</td>
                <td>
                  <button className="btn btn-warning btn-sm" style={{ marginRight: 8 }} onClick={() => handleEdit(category)}>
                    Sửa
                  </button>
                  <button className="btn btn-danger btn-sm" onClick={() => handleDelete(category.idType)}>
                    Xóa
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {renderPagination()}
    </div>
  )
}

export default Categories 