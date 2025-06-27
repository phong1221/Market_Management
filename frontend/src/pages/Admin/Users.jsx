import React, { useState, useEffect } from 'react'
import '../../css/user.css'
import '../../css/notification.css'
import { fetchUser, addUser, updateUser, deleteUser, fetchUserDetails } from '../../services/userService';

const Users = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [showDetail, setShowDetail] = useState(false)
  const [showEdit, setShowEdit] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [formData, setFormData] = useState({
    idUser: '',
    nameUser: '',
    passWord: '',
    roleUser: 'User'
  })
  const [editData, setEditData] = useState({
    idUser: '',
    nameUser: '',
    passWord: '',
    roleUser: 'User'
  })
  const [notification, setNotification] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [searchCriteria, setSearchCriteria] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const ITEMS_PER_PAGE = 5
  const [loadingDetails, setLoadingDetails] = useState(false);

  useEffect(() => {
    fetchUsers()
  }, [])

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 2500);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const data = await fetchUser();
      setUsers(data)
      
      // Tự động tạo id mới khi thêm
      const maxId = Math.max(...data.map(user => parseInt(user.idUser, 10)), 0);
      setFormData(prev => ({
        ...prev,
        idUser: (maxId + 1).toString()
      }));
    } catch (error) {
      setNotification({ message: 'Lỗi khi tải người dùng: ' + error.message, type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const result = await addUser(formData)
      if (result.success) {
        setShowForm(false)
        const maxId = Math.max(...users.map(user => parseInt(user.idUser, 10)), 0);
        setFormData({
          idUser: (maxId + 2).toString(),
          nameUser: '',
          passWord: '',
          roleUser: 'User'
        })
        fetchUsers()
        setNotification({ message: 'Thêm người dùng thành công', type: 'success' })
      } else {
        setNotification({ message: result.message, type: 'error' })
      }
    } catch (error) {
      setNotification({ message: 'Lỗi khi thêm người dùng: ' + error.message, type: 'error' })
    }
  }

  const handleEdit = async (e) => {
    e.preventDefault()
    try {
      const result = await updateUser(editData)
      if (result.success) {
        setShowEdit(false)
        setEditData({
          idUser: '',
          nameUser: '',
          passWord: '',
          roleUser: 'User'
        })
        fetchUsers()
        setNotification({ message: 'Cập nhật người dùng thành công', type: 'success' })
      } else {
        setNotification({ message: result.message, type: 'error' })
      }
    } catch (error) {
      setNotification({ message: 'Lỗi khi cập nhật người dùng: ' + error.message, type: 'error' })
    }
  }

  const handleDelete = (id) => {
    setConfirmDelete(id)
  }

  const confirmDeleteUser = async (id) => {
    try {
      const success = await deleteUser(id)
      if (success) {
        // Tính toán số trang mới sau khi xóa dựa trên dữ liệu hiện tại
        const currentTotalItems = filteredUsers.length;
        const newTotalItems = currentTotalItems - 1;
        const newTotalPages = Math.ceil(newTotalItems / ITEMS_PER_PAGE);
        
        // Kiểm tra xem phần tử bị xóa có phải là phần tử cuối cùng của trang hiện tại không
        const itemsOnCurrentPage = currentUsers.length;
        const isLastItemOnPage = itemsOnCurrentPage === 1;
        
        // Logic điều hướng trang sau khi xóa
        if (currentPage > newTotalPages && newTotalPages > 0) {
          setCurrentPage(1);
        } else if (isLastItemOnPage && currentPage > 1) {
          setCurrentPage(currentPage - 1);
        }
        
        fetchUsers()
        setNotification({ message: 'Xóa người dùng thành công', type: 'success' })
      } else {
        setNotification({ message: 'Xóa người dùng thất bại', type: 'error' })
      }
    } catch (error) {
      setNotification({ message: 'Lỗi khi xóa người dùng: ' + error.message, type: 'error' })
    } finally {
      setConfirmDelete(null)
    }
  }

  const cancelDelete = () => {
    setConfirmDelete(null)
  }

  const handleViewDetail = async (user) => {
    setShowDetail(true);
    setLoadingDetails(true);
    setSelectedUser(user); // Hiển thị thông tin cơ bản ngay lập tức

    try {
      const details = await fetchUserDetails(user.idUser);
      // Hợp nhất thông tin chi tiết vào user đã chọn
      if (details) {
        setSelectedUser(prevUser => ({ ...prevUser, ...details }));
      }
    } catch (error) {
      setNotification({ message: 'Lỗi khi tải chi tiết người dùng.', type: 'error' });
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleEditClick = (user) => {
    setEditData({
      idUser: user.idUser,
      nameUser: user.nameUser,
      passWord: user.passWord,
      roleUser: user.roleUser
    })
    setShowEdit(true)
  }

  // Search & Pagination
  const filterData = () => {
    if (!searchTerm.trim()) return users
    return users.filter(item => {
      const searchLower = searchTerm.toLowerCase()
      switch (searchCriteria) {
        case 'nameUser':
          return item.nameUser.toLowerCase().includes(searchLower)
        case 'roleUser':
          return item.roleUser.toLowerCase().includes(searchLower)
        case 'all':
          return (
            item.nameUser.toLowerCase().includes(searchLower) ||
            item.roleUser.toLowerCase().includes(searchLower)
          )
        default:
          return true
      }
    })
  }

  const filteredUsers = filterData()
  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE)
  
  // Đảm bảo currentPage không vượt quá totalPages
  const validCurrentPage = totalPages > 0 ? Math.min(currentPage, totalPages) : 1;
  if (validCurrentPage !== currentPage) {
    setCurrentPage(validCurrentPage);
  }
  
  const startIndex = (validCurrentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const currentUsers = filteredUsers.slice(startIndex, endIndex)

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
          className={`users-pagination-button ${currentPage === i ? 'active' : ''}`}
          onClick={() => handlePageChange(i)}
        >
          {i}
        </button>
      )
    }
    return (
      <div className="users-pagination-container">
        <button
          className="users-pagination-button"
          onClick={() => handlePageChange(1)}
          disabled={currentPage === 1}
        >
          &laquo;
        </button>
        <button
          className="users-pagination-button"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          &lsaquo;
        </button>
        {pages}
        <button
          className="users-pagination-button"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          &rsaquo;
        </button>
        <button
          className="users-pagination-button"
          onClick={() => handlePageChange(totalPages)}
          disabled={currentPage === totalPages}
        >
          &raquo;
        </button>
        <span className="users-pagination-info">
          Trang {currentPage} / {totalPages}
        </span>
      </div>
    )
  }

  if (loading) return <div className="users-loading">Đang tải...</div>

  return (
    <div className="users-page">
      {notification && (
        <div className={`notification-container notification-${notification.type}`}>
          {notification.message}
        </div>
      )}
      {confirmDelete && (
        <div className="users-modal-overlay">
          <div className="users-modal">
            <h2>Xác nhận xóa</h2>
            <p>Bạn có chắc chắn muốn xóa người dùng này?</p>
            <div className="users-form-actions">
              <button className="users-btn users-btn-danger" onClick={() => confirmDeleteUser(confirmDelete)}>Xóa</button>
              <button className="users-btn users-btn-secondary" onClick={cancelDelete}>Hủy</button>
            </div>
          </div>
        </div>
      )}
      <div className="users-page-header">
        <h1 className="users-page-title">Quản lý người dùng</h1>
        <button 
          className="users-btn users-btn-primary" 
          onClick={() => setShowForm(true)}
        >
          Thêm người dùng mới
        </button>
      </div>

      {showForm && (
        <div className="users-modal-overlay">
          <div className="users-modal">
            <h2>Thêm người dùng mới</h2>
            <form onSubmit={handleSubmit} className="users-form">
              <div className="users-form-group">
                <label className="users-form-label">ID:</label>
                <input
                  type="text"
                  className="users-form-input"
                  value={formData.idUser}
                  readOnly
                  style={{ backgroundColor: '#f5f5f5', cursor: 'not-allowed' }}
                />
              </div>
              <div className="users-form-group">
                <label className="users-form-label">Tên đăng nhập:</label>
                <input
                  type="text"
                  className="users-form-input"
                  value={formData.nameUser}
                  onChange={(e) => setFormData({...formData, nameUser: e.target.value})}
                  required
                />
              </div>
              
              <div className="users-form-group">
                <label className="users-form-label">Mật khẩu:</label>
                <input
                  type="password"
                  className="users-form-input"
                  value={formData.passWord}
                  onChange={(e) => setFormData({...formData, passWord: e.target.value})}
                  required
                />
              </div>
              
              <div className="users-form-group">
                <label className="users-form-label">Vai trò:</label>
                <select
                  className="users-form-input"
                  value={formData.roleUser}
                  onChange={(e) => setFormData({...formData, roleUser: e.target.value})}
                >
                  <option value="Admin">Admin</option>
                  <option value="Cashier">Cashier</option>
                  <option value="Manager">Manager</option>
                  <option value="User">User</option>
                  <option value="Stocker">Stocker</option>
                  <option value="Accountant">Accountant</option>
                </select>
              </div>
              
              <div className="users-form-actions">
                <button type="submit" className="users-btn users-btn-primary">Lưu</button>
                <button 
                  type="button" 
                  className="users-btn users-btn-secondary"
                  onClick={() => setShowForm(false)}
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEdit && (
        <div className="users-modal-overlay">
          <div className="users-modal">
            <h2>Sửa người dùng</h2>
            <form onSubmit={handleEdit} className="users-form">
              <div className="users-form-group">
                <label className="users-form-label">ID:</label>
                <input
                  type="text"
                  className="users-form-input"
                  value={editData.idUser}
                  disabled
                />
              </div>
              <div className="users-form-group">
                <label className="users-form-label">Tên đăng nhập:</label>
                <input
                  type="text"
                  className="users-form-input"
                  value={editData.nameUser}
                  onChange={(e) => setEditData({...editData, nameUser: e.target.value})}
                  required
                />
              </div>
              <div className="users-form-group">
                <label className="users-form-label">Mật khẩu:</label>
                <input
                  type="text"
                  className="users-form-input"
                  value={editData.passWord}
                  onChange={(e) => setEditData({...editData, passWord: e.target.value})}
                  required
                />
              </div>
              <div className="users-form-group">
                <label className="users-form-label">Vai trò:</label>
                <select
                  className="users-form-input"
                  value={editData.roleUser}
                  onChange={(e) => setEditData({...editData, roleUser: e.target.value})}
                >
                  <option value="Admin">Admin</option>
                  <option value="Cashier">Cashier</option>
                  <option value="Manager">Manager</option>
                  <option value="User">User</option>
                  <option value="Stocker">Stocker</option>
                  <option value="Accountant">Accountant</option>
                </select>
              </div>
              <div className="users-form-actions">
                <button type="submit" className="users-btn users-btn-primary">Cập nhật</button>
                <button 
                  type="button" 
                  className="users-btn users-btn-secondary"
                  onClick={() => setShowEdit(false)}
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDetail && selectedUser && (
        <div className="users-modal-overlay">
          <div className="users-modal">
            <h2>Chi tiết người dùng</h2>
            <div className="users-user-detail">
              <div className="users-detail-group">
                <label className="users-detail-label">ID:</label>
                <span className="users-detail-value">{selectedUser.idUser}</span>
              </div>
              <div className="users-detail-group">
                <label className="users-detail-label">Tên đăng nhập:</label>
                <span className="users-detail-value">{selectedUser.nameUser}</span>
              </div>
              <div className="users-detail-group">
                <label className="users-detail-label">Mật khẩu:</label>
                <span className="users-detail-value">{selectedUser.passWord}</span>
              </div>
              <div className="users-detail-group">
                <label className="users-detail-label">Vai trò:</label>
                <span className="users-detail-value">{selectedUser.roleUser}</span>
              </div>
              {loadingDetails ? (
                <div className="users-detail-group">
                  <span>Đang tải thông tin chi tiết...</span>
                </div>
              ) : (
                <>
                  <div className="users-detail-group">
                    <label className="users-detail-label">Họ tên đầy đủ:</label>
                    <span className="users-detail-value">{selectedUser.fullName || 'Chưa cập nhật'}</span>
                  </div>
                  <div className="users-detail-group">
                    <label className="users-detail-label">Tuổi:</label>
                    <span className="users-detail-value">{selectedUser.age || 'Chưa cập nhật'}</span>
                  </div>
                  <div className="users-detail-group">
                    <label className="users-detail-label">Địa chỉ:</label>
                    <span className="users-detail-value">{selectedUser.address || 'Chưa cập nhật'}</span>
                  </div>
                  <div className="users-detail-group">
                    <label className="users-detail-label">Số điện thoại:</label>
                    <span className="users-detail-value">{selectedUser.phone || 'Chưa cập nhật'}</span>
                  </div>
                </>
              )}
            </div>
            <div className="users-form-actions">
              <button 
                type="button" 
                className="users-btn users-btn-secondary"
                onClick={() => setShowDetail(false)}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

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
          <option value="nameUser">Tên đăng nhập</option>
          <option value="roleUser">Vai trò</option>
        </select>
      </div>

      <div className="users-table-container">
        <table className="users-data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Tên đăng nhập</th>
              <th>Mật khẩu</th>
              <th>Vai trò</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {currentUsers.map((user) => (
              <tr key={user.idUser}>
                <td>{user.idUser}</td>
                <td>{user.nameUser}</td>
                <td>••••••••</td>
                <td>{user.roleUser}</td>
                <td>
                  <button 
                    className="users-btn users-btn-info users-btn-sm action-anim"
                    style={{ minWidth: 60, padding: '4px 10px', fontSize: '0.95rem', marginRight: '5px' }}
                    onClick={() => handleViewDetail(user)}
                  >
                    Chi tiết
                  </button>
                  <button 
                    className="users-btn users-btn-primary users-btn-sm action-anim"
                    style={{ minWidth: 48, padding: '4px 10px', fontSize: '0.95rem', marginRight: '5px' }}
                    onClick={() => handleEditClick(user)}
                  >
                    Sửa
                  </button>
                  <button 
                    className="users-btn users-btn-secondary users-btn-sm action-anim"
                    style={{ minWidth: 48, padding: '4px 10px', fontSize: '0.95rem' }}
                    onClick={() => handleDelete(user.idUser)}
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

export default Users 