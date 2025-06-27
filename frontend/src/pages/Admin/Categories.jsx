import React, { useState, useEffect } from 'react'
import { fetchTypeProduct, addTypeProduct, updateTypeProduct, deleteTypeProduct } from '../../services/typeProductService'
import '../../css/notification.css'
import '../../css/typeProduct.css'
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
      const data = await fetchTypeProduct()
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
        const currentTotalItems = filteredData.length;
        const newTotalItems = currentTotalItems - 1;
        const newTotalPages = Math.ceil(newTotalItems / ITEMS_PER_PAGE);
        
        const itemsOnCurrentPage = currentData.length;
        const isLastItemOnPage = itemsOnCurrentPage === 1;
        
        if (currentPage > newTotalPages && newTotalPages > 0) {
          setCurrentPage(1);
        } else if (isLastItemOnPage && currentPage > 1) {
          setCurrentPage(currentPage - 1);
        }
        
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
  
  // Đảm bảo currentPage không vượt quá totalPages
  const validCurrentPage = totalPages > 0 ? Math.min(currentPage, totalPages) : 1;
  if (validCurrentPage !== currentPage) {
    setCurrentPage(validCurrentPage);
  }
  
  const startIndex = (validCurrentPage - 1) * ITEMS_PER_PAGE
  const currentData = filteredData.slice(startIndex, startIndex + ITEMS_PER_PAGE)

  const handlePageChange = (page) => {
    setCurrentPage(page)
  }

  const renderPagination = () => {
    if (totalPages <= 1) return null
    const pages = []
    const maxVisiblePages = 5
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2))
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1)
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1)
    }
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          className={`typeProduct-pagination-button ${currentPage === i ? 'active' : ''}`}
          onClick={() => handlePageChange(i)}
        >
          {i}
        </button>
      )
    }
    return (
      <div className="typeProduct-pagination-container">
        <button
          className="typeProduct-pagination-button"
          onClick={() => handlePageChange(1)}
          disabled={currentPage === 1}
        >
          &laquo;
        </button>
        <button
          className="typeProduct-pagination-button"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          &lsaquo;
        </button>
        {pages}
        <button
          className="typeProduct-pagination-button"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          &rsaquo;
        </button>
        <button
          className="typeProduct-pagination-button"
          onClick={() => handlePageChange(totalPages)}
          disabled={currentPage === totalPages}
        >
          &raquo;
        </button>
        <span className="typeProduct-pagination-info">
          Trang {currentPage} / {totalPages}
        </span>
      </div>
    )
  }
  
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  if (loading) return <div className="typeProduct-loading">Đang tải...</div>

  return (
    <div className="typeProduct-page">
      {notification && (
        <div className={`notification-container notification-${notification.type}`}>
          {notification.message}
        </div>
      )}
      {confirmDelete && (
        <div className="typeProduct-modal-overlay">
          <div className="typeProduct-modal">
            <h2>Xác nhận xóa</h2>
            <p>Bạn có chắc chắn muốn xóa danh mục này?</p>
            <div className="typeProduct-form-actions">
              <button className="typeProduct-btn typeProduct-btn-danger" onClick={() => confirmDeleteItem(confirmDelete)}>Xóa</button>
              <button className="typeProduct-btn typeProduct-btn-secondary" onClick={cancelDelete}>Hủy</button>
            </div>
          </div>
        </div>
      )}
      <div className="typeProduct-page-header">
        <h1 className="typeProduct-page-title">Quản lý danh mục sản phẩm</h1>
        <button className="typeProduct-btn typeProduct-btn-primary" onClick={handleAdd}>
          Thêm danh mục mới
        </button>
      </div>

      <div className="typeProduct-search-container">
        <input
          type="text"
          placeholder="Nhập từ khóa tìm kiếm..."
          value={searchTerm}
          onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
          className="typeProduct-form-input"
        />
        <select
          value={searchCriteria}
          onChange={(e) => { setSearchCriteria(e.target.value); setCurrentPage(1); }}
          className="typeProduct-form-input"
        >
          <option value="all">Tất cả</option>
          <option value="nameType">Tên danh mục</option>
          <option value="descriptionType">Mô tả</option>
          <option value="typeSell">Kiểu bán</option>
        </select>
      </div>

      {showForm && (
        <div className="typeProduct-modal-overlay">
          <div className="typeProduct-modal">
            <h2>{formType === 'add' ? 'Thêm danh mục mới' : 'Sửa danh mục'}</h2>
            <form onSubmit={handleSubmit} className="typeProduct-form">
              {formType === 'edit' && (
                <div className="typeProduct-form-group">
                  <label className="typeProduct-form-label">ID:</label>
                  <input
                    type="text"
                    className="typeProduct-form-input"
                    value={formData.idType}
                    readOnly
                    style={{ backgroundColor: '#f5f5f5' }}
                  />
                </div>
              )}
              <div className="typeProduct-form-group">
                <label className="typeProduct-form-label">Tên danh mục:</label>
                <input
                  type="text"
                  name="nameType"
                  className="typeProduct-form-input"
                  value={formData.nameType}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="typeProduct-form-group">
                <label className="typeProduct-form-label">Mô tả:</label>
                <textarea
                  name="descriptionType"
                  className="typeProduct-form-input"
                  value={formData.descriptionType}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="typeProduct-form-group">
                <label className="typeProduct-form-label">Tồn kho:</label>
                <input
                  type="number"
                  name="inventory"
                  className="typeProduct-form-input"
                  value={formData.inventory}
                  onChange={handleInputChange}
                  readOnly
                  style={{ backgroundColor: '#f5f5f5' }}
                />
              </div>
              <div className="typeProduct-form-group">
                <label className="typeProduct-form-label">Kiểu bán:</label>
                <select
                  name="typeSell"
                  className="typeProduct-form-input"
                  value={formData.typeSell}
                  onChange={handleInputChange}
                  required
                >
                  <option value="Số lượng">Số lượng</option>
                  <option value="Khối lượng">Khối lượng</option>
                </select>
              </div>
              <div className="typeProduct-form-actions">
                <button type="submit" className="typeProduct-btn typeProduct-btn-primary">Lưu</button>
                <button type="button" className="typeProduct-btn typeProduct-btn-secondary" onClick={() => setShowForm(false)}>
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="typeProduct-table-container">
        <table className="typeProduct-data-table">
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
                  <button className="typeProduct-btn typeProduct-btn-primary typeProduct-btn-sm" onClick={() => handleEdit(category)}>
                    Sửa
                  </button>
                  <button className="typeProduct-btn typeProduct-btn-secondary typeProduct-btn-sm" onClick={() => handleDelete(category.idType)}>
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