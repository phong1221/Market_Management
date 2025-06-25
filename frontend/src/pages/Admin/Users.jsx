import React, { useState, useEffect } from 'react'
import '../../css/user.css'
import '../../css/notification.css'
import { fetchUser, addUser, updateUser, deleteUser } from '../../services/userService';

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

  const handleViewDetail = (user) => {
    setSelectedUser(user)
    setShowDetail(true)
  }

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
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
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
            <p>Bạn có chắc chắn muốn xóa người dùng này?</p>
            <div className="form-actions">
              <button className="btn btn-danger" onClick={() => confirmDeleteUser(confirmDelete)}>Xóa</button>
              <button className="btn btn-secondary" onClick={cancelDelete}>Hủy</button>
            </div>
          </div>
        </div>
      )}
      <div className="page-header">
        <h1 className="page-title">Quản lý người dùng</h1>
        <button 
          className="btn btn-primary" 
          onClick={() => setShowForm(true)}
        >
          Thêm người dùng mới
        </button>
      </div>

      {showForm && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Thêm người dùng mới</h2>
            <form onSubmit={handleSubmit} className="form">
              <div className="form-group">
                <label className="form-label">ID:</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.idUser}
                  readOnly
                  style={{ backgroundColor: '#f5f5f5', cursor: 'not-allowed' }}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Tên đăng nhập:</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.nameUser}
                  onChange={(e) => setFormData({...formData, nameUser: e.target.value})}
                  required
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Mật khẩu:</label>
                <input
                  type="password"
                  className="form-input"
                  value={formData.passWord}
                  onChange={(e) => setFormData({...formData, passWord: e.target.value})}
                  required
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Vai trò:</label>
                <select
                  className="form-input"
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

      {showEdit && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Sửa người dùng</h2>
            <form onSubmit={handleEdit} className="form">
              <div className="form-group">
                <label className="form-label">ID:</label>
                <input
                  type="text"
                  className="form-input"
                  value={editData.idUser}
                  disabled
                />
              </div>
              <div className="form-group">
                <label className="form-label">Tên đăng nhập:</label>
                <input
                  type="text"
                  className="form-input"
                  value={editData.nameUser}
                  onChange={(e) => setEditData({...editData, nameUser: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Mật khẩu:</label>
                <input
                  type="text"
                  className="form-input"
                  value={editData.passWord}
                  onChange={(e) => setEditData({...editData, passWord: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Vai trò:</label>
                <select
                  className="form-input"
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
              <div className="form-actions">
                <button type="submit" className="btn btn-primary">Cập nhật</button>
                <button 
                  type="button" 
                  className="btn btn-secondary"
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
        <div className="modal-overlay">
          <div className="modal">
            <h2>Chi tiết người dùng</h2>
            <div className="user-detail">
              <div className="detail-group">
                <label className="detail-label">ID:</label>
                <span className="detail-value">{selectedUser.idUser}</span>
              </div>
              <div className="detail-group">
                <label className="detail-label">Tên đăng nhập:</label>
                <span className="detail-value">{selectedUser.nameUser}</span>
              </div>
              <div className="detail-group">
                <label className="detail-label">Mật khẩu:</label>
                <span className="detail-value">{selectedUser.passWord}</span>
              </div>
              <div className="detail-group">
                <label className="detail-label">Vai trò:</label>
                <span className="detail-value">{selectedUser.roleUser}</span>
              </div>
              <div className="detail-group">
                <label className="detail-label">Họ tên đầy đủ:</label>
                <span className="detail-value">{selectedUser.fullName || 'Chưa cập nhật'}</span>
              </div>
              <div className="detail-group">
                <label className="detail-label">Tuổi:</label>
                <span className="detail-value">{selectedUser.age || 'Chưa cập nhật'}</span>
              </div>
              <div className="detail-group">
                <label className="detail-label">Địa chỉ:</label>
                <span className="detail-value">{selectedUser.address || 'Chưa cập nhật'}</span>
              </div>
              <div className="detail-group">
                <label className="detail-label">Số điện thoại:</label>
                <span className="detail-value">{selectedUser.phone || 'Chưa cập nhật'}</span>
              </div>
            </div>
            <div className="form-actions">
              <button 
                type="button" 
                className="btn btn-secondary"
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

      <div className="table-container">
        <table className="data-table">
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
                    className="btn btn-info btn-sm action-anim"
                    style={{ minWidth: 60, padding: '4px 10px', fontSize: '0.95rem', marginRight: '5px' }}
                    onClick={() => handleViewDetail(user)}
                  >
                    Chi tiết
                  </button>
                  <button 
                    className="btn btn-primary btn-sm action-anim"
                    style={{ minWidth: 48, padding: '4px 10px', fontSize: '0.95rem', marginRight: '5px' }}
                    onClick={() => handleEditClick(user)}
                  >
                    Sửa
                  </button>
                  <button 
                    className="btn btn-secondary btn-sm action-anim"
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