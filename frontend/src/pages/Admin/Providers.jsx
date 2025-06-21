import React, { useState, useEffect } from 'react'
import { fetchProvider, addProvider, updateProvider, deleteProvider } from '../../services/providerService';
import '../../css/notification.css';

const Providers = () => {
  const [providers, setProviders] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formType, setFormType] = useState('add')
  const [formData, setFormData] = useState({
    idProvider: '',
    nameProvider: '',
    addressProvider: '',
    phoneProvider: '',
    emailProvider: ''
  })
  const [notification, setNotification] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [searchCriteria, setSearchCriteria] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const ITEMS_PER_PAGE = 5

  useEffect(() => {
    fetchProviders()
  }, [])

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 2500);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const fetchProviders = async () => {
    setLoading(true)
    try {
      const data = await fetchProvider();
      setProviders(data)
      
      // Tự động tạo id mới khi thêm
      const maxId = Math.max(...data.map(provider => parseInt(provider.idProvider, 10)), 0);
      setFormData(prev => ({
        ...prev,
        idProvider: (maxId + 1).toString()
      }));
    } catch (error) {
      setNotification({ message: 'Lỗi khi tải nhà cung cấp: ' + error.message, type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = () => {
    setFormType('add')
    const maxId = Math.max(...providers.map(provider => parseInt(provider.idProvider, 10)), 0);
    setFormData({
      idProvider: (maxId + 1).toString(),
      nameProvider: '',
      addressProvider: '',
      phoneProvider: '',
      emailProvider: ''
    })
    setShowForm(true)
  }

  const handleEdit = (provider) => {
    setFormType('edit')
    setFormData({
      idProvider: provider.idProvider,
      nameProvider: provider.nameProvider,
      addressProvider: provider.addressProvider,
      phoneProvider: provider.phoneProvider,
      emailProvider: provider.emailProvider
    })
    setShowForm(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.nameProvider.trim()) {
      setNotification({ message: 'Vui lòng nhập tên nhà cung cấp', type: 'error' })
      return
    }
    try {
      if (formType === 'edit') {
        const result = await updateProvider(formData)
        if (result.success) {
          fetchProviders()
          setNotification({ message: 'Cập nhật nhà cung cấp thành công', type: 'success' })
        } else {
          setNotification({ message: result.message, type: 'error' })
          return
        }
      } else {
        const result = await addProvider(formData)
        if (result.success) {
          fetchProviders()
          setNotification({ message: 'Thêm nhà cung cấp thành công', type: 'success' })
        } else {
          setNotification({ message: result.message, type: 'error' })
          return
        }
      }
      setShowForm(false)
    } catch (error) {
      setNotification({ message: 'Lỗi khi lưu nhà cung cấp: ' + error.message, type: 'error' })
    }
  }

  const handleDelete = (id) => {
    setConfirmDelete(id)
  }

  const confirmDeleteProvider = async (id) => {
    try {
      const success = await deleteProvider(id)
      if (success) {
        fetchProviders()
        setNotification({ message: 'Xóa nhà cung cấp thành công', type: 'success' })
      } else {
        setNotification({ message: 'Xóa nhà cung cấp thất bại', type: 'error' })
      }
    } catch (error) {
      setNotification({ message: 'Lỗi khi xóa nhà cung cấp: ' + error.message, type: 'error' })
    } finally {
      setConfirmDelete(null)
    }
  }

  const cancelDelete = () => {
    setConfirmDelete(null)
  }

  // Search & Pagination
  const filterData = () => {
    if (!searchTerm.trim()) return providers
    return providers.filter(item => {
      const searchLower = searchTerm.toLowerCase()
      switch (searchCriteria) {
        case 'nameProvider':
          return item.nameProvider.toLowerCase().includes(searchLower)
        case 'addressProvider':
          return item.addressProvider.toLowerCase().includes(searchLower)
        case 'phoneProvider':
          return item.phoneProvider.toLowerCase().includes(searchLower)
        case 'emailProvider':
          return item.emailProvider.toLowerCase().includes(searchLower)
        case 'all':
          return (
            item.nameProvider.toLowerCase().includes(searchLower) ||
            item.addressProvider.toLowerCase().includes(searchLower) ||
            item.phoneProvider.toLowerCase().includes(searchLower) ||
            item.emailProvider.toLowerCase().includes(searchLower)
          )
        default:
          return true
      }
    })
  }

  const filteredProviders = filterData()
  const totalPages = Math.ceil(filteredProviders.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const currentProviders = filteredProviders.slice(startIndex, endIndex)

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
          className={`pagination-button ${currentPage === i ? 'active' : ''}`}
          onClick={() => handlePageChange(i)}
        >
          {i}
        </button>
      )
    }
    return (
      <div className="pagination-container">
        <button
          className="pagination-button"
          onClick={() => handlePageChange(1)}
          disabled={currentPage === 1}
        >
          &laquo;
        </button>
        <button
          className="pagination-button"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          &lsaquo;
        </button>
        {pages}
        <button
          className="pagination-button"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          &rsaquo;
        </button>
        <button
          className="pagination-button"
          onClick={() => handlePageChange(totalPages)}
          disabled={currentPage === totalPages}
        >
          &raquo;
        </button>
        <span className="pagination-info">
          Trang {currentPage} / {totalPages}
        </span>
      </div>
    )
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
            <p>Bạn có chắc chắn muốn xóa nhà cung cấp này?</p>
            <div className="form-actions">
              <button className="btn btn-danger" onClick={() => confirmDeleteProvider(confirmDelete)}>Xóa</button>
              <button className="btn btn-secondary" onClick={cancelDelete}>Hủy</button>
            </div>
          </div>
        </div>
      )}
      <div className="page-header">
        <h1 className="page-title">Quản lý nhà cung cấp</h1>
        <button 
          className="btn btn-primary" 
          onClick={handleAdd}
        >
          Thêm nhà cung cấp mới
        </button>
      </div>

      <div className="search-container" style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
        <input
          type="text"
          placeholder="Nhập từ khóa tìm kiếm..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value)
            setCurrentPage(1)
          }}
          className="modal-input"
          style={{ flex: 1 }}
        />
        <select
          value={searchCriteria}
          onChange={(e) => {
            setSearchCriteria(e.target.value)
            setCurrentPage(1)
          }}
          className="modal-input"
          style={{ width: 'auto' }}
        >
          <option value="all">Tất cả</option>
          <option value="nameProvider">Tên nhà cung cấp</option>
          <option value="addressProvider">Địa chỉ</option>
          <option value="phoneProvider">Số điện thoại</option>
          <option value="emailProvider">Email</option>
        </select>
      </div>

      {showForm && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>{formType === 'add' ? 'Thêm nhà cung cấp mới' : 'Sửa nhà cung cấp'}</h2>
            <form onSubmit={handleSubmit} className="form">
              <div className="form-group">
                <label className="form-label">ID:</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.idProvider}
                  readOnly
                  style={{ backgroundColor: '#f5f5f5', cursor: 'not-allowed' }}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Tên nhà cung cấp:</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.nameProvider}
                  onChange={(e) => setFormData({...formData, nameProvider: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Địa chỉ:</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.addressProvider}
                  onChange={(e) => setFormData({...formData, addressProvider: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Số điện thoại:</label>
                <input
                  type="tel"
                  className="form-input"
                  value={formData.phoneProvider}
                  onChange={(e) => setFormData({...formData, phoneProvider: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Email:</label>
                <input
                  type="email"
                  className="form-input"
                  value={formData.emailProvider}
                  onChange={(e) => setFormData({...formData, emailProvider: e.target.value})}
                  required
                />
              </div>
              <div className="form-actions">
                <button type="submit" className="btn btn-primary">{formType === 'add' ? 'Thêm' : 'Lưu'}</button>
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
              <th>Tên nhà cung cấp</th>
              <th>Địa chỉ</th>
              <th>Số điện thoại</th>
              <th>Email</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {currentProviders.map((provider) => (
              <tr key={provider.idProvider}>
                <td>{provider.idProvider}</td>
                <td>{provider.nameProvider}</td>
                <td>{provider.addressProvider}</td>
                <td>{provider.phoneProvider}</td>
                <td>{provider.emailProvider}</td>
                <td>
                  <button 
                    className="btn btn-warning btn-sm"
                    style={{ marginRight: 8 }}
                    onClick={() => handleEdit(provider)}
                  >
                    Sửa
                  </button>
                  <button 
                    className="btn btn-danger btn-sm"
                    onClick={() => handleDelete(provider.idProvider)}
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

export default Providers 