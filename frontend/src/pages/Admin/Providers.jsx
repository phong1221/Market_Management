import React, { useState, useEffect } from 'react'
import { fetchProvider, addProvider, updateProvider, deleteProvider } from '../../services/providerService';
import { fetchTypeProduct } from '../../services/typeProductService';
import '../../css/notification.css';
import '../../css/provider.css';

const Providers = () => {
  const [providers, setProviders] = useState([])
  const [typeProducts, setTypeProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formType, setFormType] = useState('add')
  const [formData, setFormData] = useState({
    idProvider: '',
    nameProvider: '',
    addressProvider: '',
    phoneProvider: '',
    emailProvider: '',
    idType: ''
  })
  const [notification, setNotification] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [searchCriteria, setSearchCriteria] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const ITEMS_PER_PAGE = 5

  useEffect(() => {
    fetchProviders()
    fetchTypeProducts()
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
      console.log("Fetched providers:", data);
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

  const fetchTypeProducts = async () => {
    try {
      const data = await fetchTypeProduct();
      console.log("Fetched type products:", data);
      setTypeProducts(data);
    } catch (error) {
      console.error('Lỗi khi tải loại sản phẩm:', error);
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
      emailProvider: '',
      idType: ''
    })
    setShowForm(true)
  }

  const handleEdit = (provider) => {
    console.log("Editing provider:", provider);
    setFormType('edit')
    setFormData({
      idProvider: provider.idProvider,
      nameProvider: provider.nameProvider,
      addressProvider: provider.addressProvider,
      phoneProvider: provider.phoneProvider,
      emailProvider: provider.emailProvider,
      idType: provider.idType ? provider.idType.toString() : ''
    })
    setShowForm(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.nameProvider.trim()) {
      setNotification({ message: 'Vui lòng nhập tên nhà cung cấp', type: 'error' })
      return
    }
    if (!formData.idType) {
      setNotification({ message: 'Vui lòng chọn loại sản phẩm', type: 'error' })
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
        // Tính toán số trang mới sau khi xóa dựa trên dữ liệu hiện tại
        const currentTotalItems = filteredProviders.length;
        const newTotalItems = currentTotalItems - 1;
        const newTotalPages = Math.ceil(newTotalItems / ITEMS_PER_PAGE);
        
        // Kiểm tra xem phần tử bị xóa có phải là phần tử cuối cùng của trang hiện tại không
        const itemsOnCurrentPage = currentProviders.length;
        const isLastItemOnPage = itemsOnCurrentPage === 1;
        
        // Logic điều hướng trang sau khi xóa
        if (currentPage > newTotalPages && newTotalPages > 0) {
          setCurrentPage(1);
        } else if (isLastItemOnPage && currentPage > 1) {
          setCurrentPage(currentPage - 1);
        }
        
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
        case 'nameType':
          return item.nameType && item.nameType.toLowerCase().includes(searchLower)
        case 'all':
          return (
            item.nameProvider.toLowerCase().includes(searchLower) ||
            item.addressProvider.toLowerCase().includes(searchLower) ||
            item.phoneProvider.toLowerCase().includes(searchLower) ||
            item.emailProvider.toLowerCase().includes(searchLower) ||
            (item.nameType && item.nameType.toLowerCase().includes(searchLower))
          )
        default:
          return true
      }
    })
  }

  const filteredProviders = filterData()
  const totalPages = Math.ceil(filteredProviders.length / ITEMS_PER_PAGE)
  
  // Đảm bảo currentPage không vượt quá totalPages
  const validCurrentPage = totalPages > 0 ? Math.min(currentPage, totalPages) : 1;
  if (validCurrentPage !== currentPage) {
    setCurrentPage(validCurrentPage);
  }
  
  const startIndex = (validCurrentPage - 1) * ITEMS_PER_PAGE
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
          className={`providers-pagination-button ${currentPage === i ? 'active' : ''}`}
          onClick={() => handlePageChange(i)}
        >
          {i}
        </button>
      )
    }
    return (
      <div className="providers-pagination-container">
        <button
          className="providers-pagination-button"
          onClick={() => handlePageChange(1)}
          disabled={currentPage === 1}
        >
          &laquo;
        </button>
        <button
          className="providers-pagination-button"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          &lsaquo;
        </button>
        {pages}
        <button
          className="providers-pagination-button"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          &rsaquo;
        </button>
        <button
          className="providers-pagination-button"
          onClick={() => handlePageChange(totalPages)}
          disabled={currentPage === totalPages}
        >
          &raquo;
        </button>
        <span className="providers-pagination-info">
          Trang {currentPage} / {totalPages}
        </span>
      </div>
    )
  }

  if (loading) return <div className="providers-page">Đang tải...</div>

  return (
    <div className="providers-page">
      {notification && (
        <div className={`notification-container notification-${notification.type}`}>
          {notification.message}
        </div>
      )}
      {confirmDelete && (
        <div className="providers-modal-overlay">
          <div className="providers-modal">
            <h2>Xác nhận xóa</h2>
            <p>Bạn có chắc chắn muốn xóa nhà cung cấp này?</p>
            <div className="providers-form-actions">
              <button className="providers-btn providers-btn-danger" onClick={() => confirmDeleteProvider(confirmDelete)}>Xóa</button>
              <button className="providers-btn providers-btn-secondary" onClick={cancelDelete}>Hủy</button>
            </div>
          </div>
        </div>
      )}
      <div className="providers-page-header">
        <h1 className="providers-page-title">Quản lý nhà cung cấp</h1>
        <button 
          className="providers-btn providers-btn-primary" 
          onClick={handleAdd}
        >
          Thêm nhà cung cấp mới
        </button>
      </div>

      <div className="providers-search-container">
        <input
          type="text"
          placeholder="Nhập từ khóa tìm kiếm..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value)
            setCurrentPage(1)
          }}
          className="providers-form-input"
        />
        <select
          value={searchCriteria}
          onChange={(e) => {
            setSearchCriteria(e.target.value)
            setCurrentPage(1)
          }}
          className="providers-form-input"
        >
          <option value="all">Tất cả</option>
          <option value="nameProvider">Tên nhà cung cấp</option>
          <option value="addressProvider">Địa chỉ</option>
          <option value="phoneProvider">Số điện thoại</option>
          <option value="emailProvider">Email</option>
          <option value="nameType">Loại sản phẩm</option>
        </select>
      </div>

      {showForm && (
        <div className="providers-modal-overlay">
          <div className="providers-modal">
            <h2>{formType === 'add' ? 'Thêm nhà cung cấp mới' : 'Sửa nhà cung cấp'}</h2>
            <form onSubmit={handleSubmit} className="providers-form">
              <div className="providers-form-group">
                <label className="providers-form-label">ID:</label>
                <input
                  type="text"
                  className="providers-form-input"
                  value={formData.idProvider}
                  readOnly
                  style={{ backgroundColor: '#f5f5f5', cursor: 'not-allowed' }}
                />
              </div>
              <div className="providers-form-group">
                <label className="providers-form-label">Tên nhà cung cấp:</label>
                <input
                  type="text"
                  className="providers-form-input"
                  value={formData.nameProvider}
                  onChange={(e) => setFormData({...formData, nameProvider: e.target.value})}
                  required
                />
              </div>
              <div className="providers-form-group">
                <label className="providers-form-label">Địa chỉ:</label>
                <input
                  type="text"
                  className="providers-form-input"
                  value={formData.addressProvider}
                  onChange={(e) => setFormData({...formData, addressProvider: e.target.value})}
                  required
                />
              </div>
              <div className="providers-form-group">
                <label className="providers-form-label">Số điện thoại:</label>
                <input
                  type="tel"
                  className="providers-form-input"
                  value={formData.phoneProvider}
                  onChange={(e) => setFormData({...formData, phoneProvider: e.target.value})}
                  required
                />
              </div>
              <div className="providers-form-group">
                <label className="providers-form-label">Email:</label>
                <input
                  type="email"
                  className="providers-form-input"
                  value={formData.emailProvider}
                  onChange={(e) => setFormData({...formData, emailProvider: e.target.value})}
                  required
                />
              </div>
              <div className="providers-form-group">
                <label className="providers-form-label">Loại sản phẩm:</label>
                <select
                  value={formData.idType || ''}
                  onChange={(e) => {
                    console.log("Selected idType:", e.target.value);
                    setFormData({...formData, idType: e.target.value});
                  }}
                  className="providers-form-input"
                  required
                >
                  <option value="">Chọn loại sản phẩm</option>
                  {typeProducts.map((type) => {
                    console.log("Type option:", type);
                    return (
                      <option key={type.idType} value={type.idType}>
                        {type.nameType}
                      </option>
                    );
                  })}
                </select>
              </div>
              <div className="providers-form-actions">
                <button type="submit" className="providers-btn providers-btn-primary">{formType === 'add' ? 'Thêm' : 'Lưu'}</button>
                <button 
                  type="button" 
                  className="providers-btn providers-btn-secondary"
                  onClick={() => setShowForm(false)}
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="providers-table-container">
        <table className="providers-data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Tên nhà cung cấp</th>
              <th>Địa chỉ</th>
              <th>Số điện thoại</th>
              <th>Email</th>
              <th>Loại sản phẩm</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {currentProviders.map((provider) => {
              console.log("Rendering provider:", provider);
              return (
                <tr key={provider.idProvider}>
                  <td>{provider.idProvider}</td>
                  <td>{provider.nameProvider}</td>
                  <td>{provider.addressProvider}</td>
                  <td>{provider.phoneProvider}</td>
                  <td>{provider.emailProvider}</td>
                  <td>{provider.nameType || `Chưa phân loại (idType: ${provider.idType})`}</td>
                  <td>
                    <button 
                      className="providers-btn providers-btn-primary providers-btn-sm"
                      onClick={() => handleEdit(provider)}
                    >
                      Sửa
                    </button>
                    <button 
                      className="providers-btn providers-btn-secondary providers-btn-sm"
                      onClick={() => handleDelete(provider.idProvider)}
                    >
                      Xóa
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {renderPagination()}
    </div>
  )
}

export default Providers 