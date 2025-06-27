import React, { useState, useEffect } from 'react'
import { fetchPromotion, addPromotion, updatePromotion, deletePromotion, hidePromotion } from '../../services/promotionService';
import '../../css/promotion.css';
import '../../css/notification.css';

const Promotions = () => {
  const [promotions, setPromotions] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formType, setFormType] = useState('add')
  const [formData, setFormData] = useState({
    idPromotion: '',
    namePromotion: '',
    descriptionPromotion: '',
    discountPromotion: '',
    startDay: '',
    endDay: '',
    status: ''
  })
  const [notification, setNotification] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [searchCriteria, setSearchCriteria] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const ITEMS_PER_PAGE = 5
  const [dateError, setDateError] = useState('')

  useEffect(() => {
    fetchPromotions()
  }, [])

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 2500);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const fetchPromotions = async () => {
    setLoading(true)
    try {
      const data = await fetchPromotion();
      // Sắp xếp theo ID tăng dần
      const sortedData = data.sort((a, b) => parseInt(a.idPromotion) - parseInt(b.idPromotion));
      setPromotions(sortedData)
      
      // Tự động tạo id mới khi thêm
      const maxId = Math.max(...sortedData.map(promotion => parseInt(promotion.idPromotion, 10)), 0);
      setFormData(prev => ({
        ...prev,
        idPromotion: (maxId + 1).toString()
      }));
    } catch (error) {
      setNotification({ message: 'Lỗi khi tải khuyến mãi: ' + error.message, type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = () => {
    setFormType('add')
    // Sắp xếp promotions theo ID tăng dần để tìm ID lớn nhất chính xác
    const sortedPromotions = [...promotions].sort((a, b) => parseInt(a.idPromotion) - parseInt(b.idPromotion));
    const maxId = Math.max(...sortedPromotions.map(promotion => parseInt(promotion.idPromotion, 10)), 0);
    setFormData({
      idPromotion: (maxId + 1).toString(),
      namePromotion: '',
      descriptionPromotion: '',
      discountPromotion: '',
      startDay: '',
      endDay: '',
      status: ''
    })
    setShowForm(true)
  }

  const handleEdit = (promotion) => {
    setFormType('edit')
    setFormData({
      idPromotion: promotion.idPromotion,
      namePromotion: promotion.namePromotion,
      descriptionPromotion: promotion.descriptionPromotion,
      discountPromotion: promotion.discountPromotion,
      startDay: promotion.startDay,
      endDay: promotion.endDay,
      status: promotion.status
    })
    setShowForm(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.namePromotion.trim()) {
      setNotification({ message: 'Vui lòng nhập tên khuyến mãi', type: 'error' })
      return
    }
    if (!formData.discountPromotion || formData.discountPromotion <= 0) {
      setNotification({ message: 'Vui lòng nhập phần trăm giảm giá hợp lệ', type: 'error' })
      return
    }
    
    // Kiểm tra ngày bắt đầu và kết thúc
    if (!validateDates(formData.startDay, formData.endDay)) {
      return
    }
    
    try {
      if (formType === 'edit') {
        const result = await updatePromotion(formData)
        if (result.success) {
          fetchPromotions()
          setNotification({ message: 'Cập nhật khuyến mãi thành công', type: 'success' })
        } else {
          setNotification({ message: result.message, type: 'error' })
          return
        }
      } else {
        const result = await addPromotion(formData)
        if (result.success) {
          fetchPromotions()
          setNotification({ message: 'Thêm khuyến mãi thành công', type: 'success' })
        } else {
          setNotification({ message: result.message, type: 'error' })
          return
        }
      }
      setShowForm(false)
    } catch (error) {
      setNotification({ message: 'Lỗi khi lưu khuyến mãi: ' + error.message, type: 'error' })
    }
  }

  const handleDelete = (id) => {
    setConfirmDelete(id)
  }

  const confirmDeletePromotion = async (id) => {
    try {
      const success = await deletePromotion(id)
      if (success) {
        // Tính toán số trang mới sau khi xóa dựa trên dữ liệu hiện tại
        const currentTotalItems = filteredPromotions.length;
        const newTotalItems = currentTotalItems - 1;
        const newTotalPages = Math.ceil(newTotalItems / ITEMS_PER_PAGE);
        
        // Kiểm tra xem phần tử bị xóa có phải là phần tử cuối cùng của trang hiện tại không
        const itemsOnCurrentPage = currentPromotions.length;
        const isLastItemOnPage = itemsOnCurrentPage === 1;
        
        // Logic điều hướng trang sau khi xóa
        if (currentPage > newTotalPages && newTotalPages > 0) {
          setCurrentPage(1);
        } else if (isLastItemOnPage && currentPage > 1) {
          setCurrentPage(currentPage - 1);
        }
        
        fetchPromotions()
        setNotification({ message: 'Xóa khuyến mãi thành công', type: 'success' })
      } else {
        setNotification({ message: 'Xóa khuyến mãi thất bại', type: 'error' })
      }
    } catch (error) {
      setNotification({ message: 'Lỗi khi xóa khuyến mãi: ' + error.message, type: 'error' })
    } finally {
      setConfirmDelete(null)
    }
  }

  const cancelDelete = () => {
    setConfirmDelete(null)
  }

  const validateDates = (startDay, endDay) => {
    if (startDay && endDay) {
      const startDate = new Date(startDay)
      const endDate = new Date(endDay)
      if (startDate > endDate) {
        setDateError('Ngày bắt đầu không thể lớn hơn ngày kết thúc!')
        return false
      } else {
        setDateError('')
        return true
      }
    }
    setDateError('')
    return true
  }

  const handleHide = async (id) => {
    try {
      const result = await hidePromotion(id)
      if (result.success) {
        fetchPromotions()
        const statusText = result.newStatus === 'Active' ? 'kích hoạt' : 'ẩn'
        setNotification({ message: `Đã ${statusText} khuyến mãi thành công`, type: 'success' })
      } else {
        setNotification({ message: result.message, type: 'error' })
      }
    } catch (error) {
      setNotification({ message: 'Lỗi khi thay đổi trạng thái: ' + error.message, type: 'error' })
    }
  }

  // Search & Pagination
  const filterData = () => {
    if (!searchTerm.trim()) return promotions
    return promotions.filter(item => {
      const searchLower = searchTerm.toLowerCase()
      switch (searchCriteria) {
        case 'namePromotion':
          return item.namePromotion.toLowerCase().includes(searchLower)
        case 'descriptionPromotion':
          return item.descriptionPromotion.toLowerCase().includes(searchLower)
        case 'status':
          return item.status.toLowerCase().includes(searchLower)
        case 'all':
          return (
            item.namePromotion.toLowerCase().includes(searchLower) ||
            item.descriptionPromotion.toLowerCase().includes(searchLower) ||
            item.status.toLowerCase().includes(searchLower)
          )
        default:
          return true
      }
    })
  }

  const filteredPromotions = filterData()
  const totalPages = Math.ceil(filteredPromotions.length / ITEMS_PER_PAGE)
  
  // Đảm bảo currentPage không vượt quá totalPages
  const validCurrentPage = totalPages > 0 ? Math.min(currentPage, totalPages) : 1;
  if (validCurrentPage !== currentPage) {
    setCurrentPage(validCurrentPage);
  }
  
  const startIndex = (validCurrentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const currentPromotions = filteredPromotions.slice(startIndex, endIndex)

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
          className={`promotions-pagination-button ${currentPage === i ? 'active' : ''}`}
          onClick={() => handlePageChange(i)}
        >
          {i}
        </button>
      )
    }
    return (
      <div className="promotions-pagination-container">
        <button
          className="promotions-pagination-button"
          onClick={() => handlePageChange(1)}
          disabled={currentPage === 1}
        >
          &laquo;
        </button>
        <button
          className="promotions-pagination-button"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          &lsaquo;
        </button>
        {pages}
        <button
          className="promotions-pagination-button"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          &rsaquo;
        </button>
        <button
          className="promotions-pagination-button"
          onClick={() => handlePageChange(totalPages)}
          disabled={currentPage === totalPages}
        >
          &raquo;
        </button>
        <span className="promotions-pagination-info">
          Trang {currentPage} / {totalPages}
        </span>
      </div>
    )
  }

  if (loading) return <div className="promotions-loading">Đang tải...</div>

  return (
    <div className="promotions-page">
      {notification && (
        <div className={`notification-container notification-${notification.type}`}>
          {notification.message}
        </div>
      )}
      {confirmDelete && (
        <div className="promotions-modal-overlay">
          <div className="promotions-modal">
            <h2>Xác nhận xóa</h2>
            <p>Bạn có chắc chắn muốn xóa khuyến mãi này?</p>
            <div className="promotions-form-actions">
              <button className="promotions-btn promotions-btn-danger" onClick={() => confirmDeletePromotion(confirmDelete)}>Xóa</button>
              <button className="promotions-btn promotions-btn-secondary" onClick={cancelDelete}>Hủy</button>
            </div>
          </div>
        </div>
      )}
      <div className="promotions-page-header">
        <h1 className="promotions-page-title">Quản lý khuyến mãi</h1>
        <button 
          className="promotions-btn promotions-btn-primary" 
          onClick={handleAdd}
        >
          Thêm khuyến mãi mới
        </button>
      </div>

      <div className="promotions-search-container">
        <input
          type="text"
          placeholder="Nhập từ khóa tìm kiếm..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value)
            setCurrentPage(1)
          }}
          className="promotions-form-input"
        />
        <select
          value={searchCriteria}
          onChange={(e) => {
            setSearchCriteria(e.target.value)
            setCurrentPage(1)
          }}
          className="promotions-form-input"
        >
          <option value="all">Tất cả</option>
          <option value="namePromotion">Tên khuyến mãi</option>
          <option value="descriptionPromotion">Mô tả</option>
          <option value="status">Trạng thái</option>
        </select>
      </div>

      {showForm && (
        <div className="promotions-modal-overlay">
          <div className="promotions-modal">
            <h2>{formType === 'add' ? 'Thêm khuyến mãi mới' : 'Sửa khuyến mãi'}</h2>
            <form onSubmit={handleSubmit} className="promotions-form">
              <div className="promotions-form-group">
                <label className="promotions-form-label">ID:</label>
                <input
                  type="text"
                  className="promotions-form-input"
                  value={formData.idPromotion}
                  readOnly
                  style={{ backgroundColor: '#f5f5f5', cursor: 'not-allowed' }}
                />
              </div>
              <div className="promotions-form-group">
                <label className="promotions-form-label">Tên khuyến mãi:</label>
                <input
                  type="text"
                  className="promotions-form-input"
                  value={formData.namePromotion}
                  onChange={(e) => setFormData({...formData, namePromotion: e.target.value})}
                  required
                />
              </div>
              
              <div className="promotions-form-group">
                <label className="promotions-form-label">Mô tả:</label>
                <textarea
                  className="promotions-form-input"
                  value={formData.descriptionPromotion}
                  onChange={(e) => setFormData({...formData, descriptionPromotion: e.target.value})}
                  required
                  rows="3"
                />
              </div>
              
              <div className="promotions-form-group">
                <label className="promotions-form-label">Phần trăm giảm giá (%):</label>
                <input
                  type="number"
                  className="promotions-form-input"
                  value={formData.discountPromotion}
                  onChange={(e) => setFormData({...formData, discountPromotion: e.target.value})}
                  min="0"
                  max="100"
                  step="0.01"
                  required
                />
              </div>

              <div className="promotions-form-group">
                <label className="promotions-form-label">Ngày bắt đầu:</label>
                <input
                  type="date"
                  className="promotions-form-input"
                  value={formData.startDay}
                  onChange={(e) => {
                    const newStartDay = e.target.value
                    setFormData({...formData, startDay: newStartDay})
                    validateDates(newStartDay, formData.endDay)
                  }}
                  required
                />
              </div>

              <div className="promotions-form-group">
                <label className="promotions-form-label">Ngày kết thúc:</label>
                <input
                  type="date"
                  className="promotions-form-input"
                  value={formData.endDay}
                  onChange={(e) => {
                    const newEndDay = e.target.value
                    setFormData({...formData, endDay: newEndDay})
                    validateDates(formData.startDay, newEndDay)
                  }}
                  required
                />
              </div>
              
              {dateError && (
                <div className="promotions-form-group">
                  <div className="promotions-error-message">
                    ⚠️ {dateError}
                  </div>
                </div>
              )}

              <div className="promotions-form-actions">
                <button type="submit" className="promotions-btn promotions-btn-primary">{formType === 'add' ? 'Thêm' : 'Lưu'}</button>
                <button 
                  type="button" 
                  className="promotions-btn promotions-btn-secondary"
                  onClick={() => setShowForm(false)}
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="promotions-table-container">
        <table className="promotions-data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Tên khuyến mãi</th>
              <th>Mô tả</th>
              <th>Giảm giá (%)</th>
              <th>Ngày bắt đầu</th>
              <th>Ngày kết thúc</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {currentPromotions.map((promotion) => (
              <tr key={promotion.idPromotion}>
                <td>{promotion.idPromotion}</td>
                <td>{promotion.namePromotion}</td>
                <td>{promotion.descriptionPromotion}</td>
                <td>{promotion.discountPromotion}%</td>
                <td>{promotion.startDay}</td>
                <td>{promotion.endDay}</td>
                <td>
                  <span className={`promotions-status-badge ${promotion.status === 'Active' || promotion.status === 'Hoạt động' ? 'active' : 'inactive'}`}>
                    {promotion.status === 'Active' || promotion.status === 'Hoạt động' ? 'Hoạt động' : 'Không hoạt động'}
                  </span>
                </td>
                <td>
                  <button 
                    className="promotions-btn promotions-btn-primary promotions-btn-sm"
                    onClick={() => handleEdit(promotion)}
                  >
                    Sửa
                  </button>
                  <button 
                    className="promotions-btn promotions-btn-info promotions-btn-sm"
                    onClick={() => handleHide(promotion.idPromotion)}
                  >
                    {promotion.status === 'Active' || promotion.status === 'Hoạt động' ? 'Ẩn' : 'Hiện'}
                  </button>
                  <button 
                    className="promotions-btn promotions-btn-secondary promotions-btn-sm"
                    onClick={() => handleDelete(promotion.idPromotion)}
                  >
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

export default Promotions 