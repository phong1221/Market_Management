import React, { useState, useEffect } from 'react'
import { fetchSalary, addSalary, updateSalary, deleteSalary, getEmployeeInfo } from '../../services/salaryService'
import { fetchEmployee } from '../../services/employeeService'
import SalaryModel from '../../models/salary'
import '../../css/notification.css'
import '../../css/salary.css'

const Salary = () => {
  const [salaries, setSalaries] = useState([])
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formType, setFormType] = useState('add')
  const [formData, setFormData] = useState({
    idSalary: '',
    idEmployee: '',
    basicSalary: '',
    bonus: '',
    deduction: '',
    salaryMonth: ''
  })
  const [notification, setNotification] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [selectedSalary, setSelectedSalary] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [searchCriteria, setSearchCriteria] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const ITEMS_PER_PAGE = 5

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 2500);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const fetchData = async () => {
    setLoading(true)
    try {
      const [salariesData, employeesData] = await Promise.all([
        fetchSalary(),
        fetchEmployee()
      ])
      
      salariesData.sort((a, b) => parseInt(a.idSalary) - parseInt(b.idSalary));
      setSalaries(salariesData)
      setEmployees(employeesData)
      
      // Tự động tạo id mới khi thêm
      const maxId = Math.max(...salariesData.map(salary => parseInt(salary.idSalary, 10)), 0);
      setFormData(prev => ({
        ...prev,
        idSalary: (maxId + 1).toString()
      }));
    } catch (error) {
      setNotification({ message: 'Lỗi khi tải dữ liệu: ' + error.message, type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = () => {
    setFormType('add')
    const maxId = Math.max(...salaries.map(salary => parseInt(salary.idSalary, 10)), 0);
    setFormData({
      idSalary: (maxId + 1).toString(),
      idEmployee: '',
      basicSalary: '',
      bonus: '',
      deduction: '',
      salaryMonth: ''
    })
    setShowForm(true)
  }

  const handleEdit = (salary) => {
    setFormType('edit')
    setFormData({
      idSalary: salary.idSalary,
      idEmployee: salary.idEmployee,
      basicSalary: salary.basicSalary,
      bonus: salary.bonus,
      deduction: salary.deduction,
      salaryMonth: salary.salaryMonth ? salary.salaryMonth.substring(0, 7) : ''
    })
    setShowForm(true)
  }

  const handleShowDetails = (salary) => {
    setSelectedSalary(salary)
    setShowDetailsModal(true)
  }

  const calculateTotalSalary = () => {
    const basic = parseFloat(formData.basicSalary) || 0
    const bonus = parseFloat(formData.bonus) || 0
    const deduction = parseFloat(formData.deduction) || 0
    return basic + bonus - deduction
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.idEmployee || !formData.basicSalary || !formData.salaryMonth) {
      setNotification({ message: 'Vui lòng nhập đầy đủ thông tin bắt buộc', type: 'error' })
      return
    }
    try {
      if (formType === 'edit') {
        const result = await updateSalary(formData)
        if (result.success) {
          fetchData()
          setNotification({ message: 'Cập nhật lương thành công', type: 'success' })
        } else {
          setNotification({ message: result.message, type: 'error' })
          return
        }
      } else {
        const result = await addSalary(formData)
        if (result.success) {
          fetchData()
          setNotification({ message: 'Thêm lương thành công', type: 'success' })
        } else {
          setNotification({ message: result.message, type: 'error' })
          return
        }
      }
      setShowForm(false)
    } catch (error) {
      setNotification({ message: 'Lỗi khi lưu lương: ' + error.message, type: 'error' })
    }
  }

  const handleDelete = (id) => {
    setConfirmDelete(id)
  }

  const confirmDeleteSalary = async (id) => {
    try {
      const success = await deleteSalary(id)
      if (success) {
        // Tính toán số trang mới sau khi xóa dựa trên dữ liệu hiện tại
        const currentTotalItems = filteredSalaries.length;
        const newTotalItems = currentTotalItems - 1;
        const newTotalPages = Math.ceil(newTotalItems / ITEMS_PER_PAGE);
        
        // Kiểm tra xem phần tử bị xóa có phải là phần tử cuối cùng của trang hiện tại không
        const itemsOnCurrentPage = currentSalaries.length;
        const isLastItemOnPage = itemsOnCurrentPage === 1;
        
        // Logic điều hướng trang sau khi xóa
        if (currentPage > newTotalPages && newTotalPages > 0) {
          setCurrentPage(1);
        } else if (isLastItemOnPage && currentPage > 1) {
          setCurrentPage(currentPage - 1);
        }
        
        fetchData()
        setNotification({ message: 'Xóa lương thành công', type: 'success' })
      } else {
        setNotification({ message: 'Xóa lương thất bại', type: 'error' })
      }
    } catch (error) {
      setNotification({ message: 'Lỗi khi xóa lương: ' + error.message, type: 'error' })
    } finally {
      setConfirmDelete(null)
    }
  }

  const cancelDelete = () => {
    setConfirmDelete(null)
  }

  const formatMonthYear = (dateString) => {
    if (!dateString || !dateString.includes('-')) return 'N/A'
    const [year, month] = dateString.split('-')
    return `${month}/${year}`
  }

  // Search & Pagination
  const filterData = () => {
    if (!searchTerm.trim()) return salaries
    return salaries.filter(item => {
      const employee = employees.find(e => e.idEmployee === item.idEmployee)
      const searchLower = searchTerm.toLowerCase()
      switch (searchCriteria) {
        case 'employeeName':
          return employee?.nameEmployee?.toLowerCase().includes(searchLower)
        case 'roleEmployee':
          return employee?.roleEmployee?.toLowerCase().includes(searchLower)
        case 'salaryMonth':
          return item.salaryMonth?.includes(searchLower)
        case 'idSalary':
          return item.idSalary?.toString().includes(searchLower)
        case 'all':
          return (
            employee?.nameEmployee?.toLowerCase().includes(searchLower) ||
            employee?.roleEmployee?.toLowerCase().includes(searchLower) ||
            item.salaryMonth?.includes(searchLower) ||
            item.idSalary?.toString().includes(searchLower)
          )
        default:
          return true
      }
    })
  }

  const filteredSalaries = filterData()
  const totalPages = Math.ceil(filteredSalaries.length / ITEMS_PER_PAGE)
  
  // Đảm bảo currentPage không vượt quá totalPages
  const validCurrentPage = totalPages > 0 ? Math.min(currentPage, totalPages) : 1;
  if (validCurrentPage !== currentPage) {
    setCurrentPage(validCurrentPage);
  }
  
  const startIndex = (validCurrentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const currentSalaries = filteredSalaries.slice(startIndex, endIndex)

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
          className={`salary-pagination-button ${currentPage === i ? 'active' : ''}`}
          onClick={() => handlePageChange(i)}
        >
          {i}
        </button>
      )
    }
    return (
      <div className="salary-pagination-container">
        <button
          className="salary-pagination-button"
          onClick={() => handlePageChange(1)}
          disabled={currentPage === 1}
        >
          &laquo;
        </button>
        <button
          className="salary-pagination-button"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          &lsaquo;
        </button>
        {pages}
        <button
          className="salary-pagination-button"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          &rsaquo;
        </button>
        <button
          className="salary-pagination-button"
          onClick={() => handlePageChange(totalPages)}
          disabled={currentPage === totalPages}
        >
          &raquo;
        </button>
        <span className="salary-pagination-info">
          Trang {currentPage} / {totalPages}
        </span>
      </div>
    )
  }

  if (loading) return <div className="salary-loading">Đang tải...</div>

  return (
    <div className="salary-page">
      {notification && (
        <div className={`salary-notification-container salary-notification-${notification.type}`}>
          {notification.message}
        </div>
      )}
      {confirmDelete && (
        <div className="salary-modal-overlay">
          <div className="salary-modal">
            <h2>Xác nhận xóa</h2>
            <p>Bạn có chắc chắn muốn xóa bản ghi lương này?</p>
            <div className="salary-form-actions">
              <button className="salary-btn salary-btn-danger" onClick={() => confirmDeleteSalary(confirmDelete)}>Xóa</button>
              <button className="salary-btn salary-btn-secondary" onClick={cancelDelete}>Hủy</button>
            </div>
          </div>
        </div>
      )}
      {showDetailsModal && selectedSalary && (() => {
        const employeeDetails = employees.find(e => e.idEmployee == selectedSalary.idEmployee);
        return (
          <div className="salary-modal-overlay">
            <div className="salary-modal">
              <h2>Chi tiết nhân viên</h2>
              {employeeDetails ? (
                <div>
                  <p><strong>ID:</strong> {employeeDetails.idEmployee}</p>
                  <p><strong>Tên nhân viên:</strong> {employeeDetails.nameEmployee}</p>
                  <p><strong>Giới tính:</strong> {employeeDetails.genderEmployee}</p>
                  <p><strong>Địa chỉ:</strong> {employeeDetails.addressEmployee}</p>
                  <p><strong>Số điện thoại:</strong> {employeeDetails.phoneEmployee}</p>
                  <p><strong>Chức vụ:</strong> {employeeDetails.roleEmployee}</p>
                </div>
              ) : (
                <p>Không tìm thấy thông tin nhân viên.</p>
              )}
              <div className="salary-form-actions">
                <button className="salary-btn salary-btn-secondary" onClick={() => setShowDetailsModal(false)}>Đóng</button>
              </div>
            </div>
          </div>
        );
      })()}
      <div className="salary-page-header">
        <h1 className="salary-page-title">Quản lý lương nhân viên</h1>
        <button 
          className="salary-btn salary-btn-primary" 
          onClick={handleAdd}
        >
          Thêm bản ghi lương mới
        </button>
      </div>

      <div className="salary-search-container">
        <input
          type="text"
          placeholder="Nhập từ khóa tìm kiếm..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value)
            setCurrentPage(1)
          }}
          className="salary-form-input"
        />
        <select
          value={searchCriteria}
          onChange={(e) => {
            setSearchCriteria(e.target.value)
            setCurrentPage(1)
          }}
          className="salary-form-input"
        >
          <option value="all">Tất cả</option>
          <option value="employeeName">Tên nhân viên</option>
          <option value="roleEmployee">Chức vụ</option>
          <option value="salaryMonth">Tháng lương</option>
          <option value="idSalary">ID lương</option>
        </select>
      </div>

      {showForm && (
        <div className="salary-modal-overlay">
          <div className="salary-modal">
            <h2>{formType === 'add' ? 'Thêm bản ghi lương mới' : 'Sửa bản ghi lương'}</h2>
            <form onSubmit={handleSubmit} className="salary-form">
              <div className="salary-form-group">
                <label className="salary-form-label">ID:</label>
                <input
                  type="text"
                  className="salary-form-input"
                  value={formData.idSalary}
                  readOnly
                  style={{ backgroundColor: '#f5f5f5', cursor: 'not-allowed' }}
                />
              </div>
              <div className="salary-form-group">
                <label className="salary-form-label">Nhân viên:</label>
                <select
                  className="salary-form-input"
                  value={formData.idEmployee}
                  onChange={(e) => setFormData({...formData, idEmployee: e.target.value})}
                  required
                >
                  <option value="">Chọn nhân viên</option>
                  {employees.map(employee => (
                    <option key={employee.idEmployee} value={employee.idEmployee}>
                      {employee.nameEmployee} - {employee.roleEmployee}
                    </option>
                  ))}
                </select>
              </div>
              <div className="salary-form-group">
                <label className="salary-form-label">Lương cơ bản:</label>
                <input
                  type="number"
                  className="salary-form-input"
                  value={formData.basicSalary}
                  onChange={(e) => setFormData({...formData, basicSalary: e.target.value})}
                  required
                  min="0"
                />
              </div>
              <div className="salary-form-group">
                <label className="salary-form-label">Thưởng:</label>
                <input
                  type="number"
                  className="salary-form-input"
                  value={formData.bonus}
                  onChange={(e) => setFormData({...formData, bonus: e.target.value})}
                  required
                  min="0"
                />
              </div>
              <div className="salary-form-group">
                <label className="salary-form-label">Khấu trừ:</label>
                <input
                  type="number"
                  className="salary-form-input"
                  value={formData.deduction}
                  onChange={(e) => setFormData({...formData, deduction: e.target.value})}
                  required
                  min="0"
                />
              </div>
              <div className="salary-form-group">
                <label className="salary-form-label">Tổng lương:</label>
                <input
                  type="number"
                  className="salary-form-input"
                  value={calculateTotalSalary()}
                  readOnly
                  style={{ backgroundColor: '#f5f5f5', cursor: 'not-allowed' }}
                />
              </div>
              <div className="salary-form-group">
                <label className="salary-form-label">Tháng lương:</label>
                <input
                  type="month"
                  className="salary-form-input"
                  value={formData.salaryMonth}
                  onChange={(e) => setFormData({...formData, salaryMonth: e.target.value})}
                  required
                />
              </div>
              <div className="salary-form-actions">
                <button type="submit" className="salary-btn salary-btn-primary">{formType === 'add' ? 'Thêm' : 'Lưu'}</button>
                <button 
                  type="button" 
                  className="salary-btn salary-btn-secondary"
                  onClick={() => setShowForm(false)}
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="salary-table-container">
        <table className="salary-data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nhân viên</th>
              <th>Chức vụ</th>
              <th>Lương cơ bản</th>
              <th>Thưởng</th>
              <th>Khấu trừ</th>
              <th>Tổng lương</th>
              <th>Tháng lương</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {currentSalaries.length === 0 ? (
              <tr>
                <td colSpan="9" className="salary-no-data">Không có dữ liệu</td>
              </tr>
            ) : (
              currentSalaries.map((salary) => {
                const employee = employees.find(e => e.idEmployee == salary.idEmployee)
                return (
                  <tr key={salary.idSalary}>
                    <td>{salary.idSalary}</td>
                    <td>{employee?.nameEmployee || 'N/A'}</td>
                    <td>{employee?.roleEmployee || 'N/A'}</td>
                    <td>{salary.basicSalary?.toLocaleString()} VNĐ</td>
                    <td>{salary.bonus?.toLocaleString()} VNĐ</td>
                    <td>{salary.deduction?.toLocaleString()} VNĐ</td>
                    <td>{salary.totalSalary?.toLocaleString()} VNĐ</td>
                    <td>{formatMonthYear(salary.salaryMonth)}</td>
                    <td>
                      <button 
                        className="salary-btn salary-btn-info salary-btn-sm salary-action-anim"
                        style={{ minWidth: 60, padding: '4px 10px', fontSize: '0.95rem', marginRight: 8 }}
                        onClick={() => handleShowDetails(salary)}
                      >
                        Chi tiết
                      </button>
                      <button 
                        className="salary-btn salary-btn-primary salary-btn-sm salary-action-anim"
                        style={{ minWidth: 48, padding: '4px 10px', fontSize: '0.95rem', marginRight: 8 }}
                        onClick={() => handleEdit(salary)}
                      >
                        Sửa
                      </button>
                      <button 
                        className="salary-btn salary-btn-secondary salary-btn-sm salary-action-anim"
                        style={{ minWidth: 48, padding: '4px 10px', fontSize: '0.95rem' }}
                        onClick={() => handleDelete(salary.idSalary)}
                      >
                        Xóa
                      </button>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
      {renderPagination()}
    </div>
  )
}

export default Salary 