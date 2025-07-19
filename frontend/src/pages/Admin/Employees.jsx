import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { addEmployee, updateEmployee, deleteEmployee } from '../../services/employeeService';
import '../../css/employee.css';
import '../../css/notification.css';

const Employees = () => {
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [modalType, setModalType] = useState("add")
  const [editingEmployee, setEditingEmployee] = useState({
    idEmployee: "",
    nameEmployee: "",
    genderEmployee: "Male",
    addressEmployee: "",
    phoneEmployee: "",
    roleEmployee: "Cashier"
  })
  const [notification, setNotification] = useState(null)
  const [searchTerm, setSearchTerm] = useState("");
  const [searchCriteria, setSearchCriteria] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 5;
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [employeesWithSalary, setEmployeesWithSalary] = useState([]);

  useEffect(() => { 
    fetchEmployees()
    fetchEmployeesWithSalary()
  }, [])

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 2500);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost/market_management/backend/api/employee/getEmployee.php');
      const data = response.data && Array.isArray(response.data.data) ? response.data.data : [];
      setEmployees(data);

      // Tự động tạo id mới khi thêm
      const maxId = Math.max(...data.map(emp => parseInt(emp.idEmployee, 10)), 0);
      setEditingEmployee(prev => ({
        ...prev,
        idEmployee: (maxId + 1).toString()
      }));

      console.log('Số lượng nhân viên:', data.length, data);
    } catch (error) {
      setNotification({ message: "Lỗi khi tải dữ liệu: " + error.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  }

  const fetchEmployeesWithSalary = async () => {
    try {
      const response = await axios.get('http://localhost/market_management/backend/api/salary/getSalary.php');
      const data = response.data && Array.isArray(response.data.data) ? response.data.data : [];
      const employeeIds = [...new Set(data.map(salary => salary.idEmployee))];
      setEmployeesWithSalary(employeeIds);
    } catch (error) {
      console.error('Lỗi khi tải dữ liệu lương:', error);
    }
  }

  const handleEdit = (employee) => {
    setModalType("edit");
    setEditingEmployee(employee);
    setShowModal(true);
  };

  const handleAdd = () => {
    setModalType("add");
    const maxId = Math.max(...employees.map(emp => parseInt(emp.idEmployee, 10)), 0);
    setEditingEmployee({
      idEmployee: (maxId + 1).toString(),
      nameEmployee: "",
      genderEmployee: "Male",
      addressEmployee: "",
      phoneEmployee: "",
      roleEmployee: "Cashier"
    });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!editingEmployee.nameEmployee.trim()) {
      setNotification({ message: "Vui lòng nhập tên nhân viên", type: "error" });
      return;
    }
    // ... kiểm tra các trường khác nếu cần

    try {
      if (modalType === "edit") {
        // Gọi API update
        const result = await updateEmployee(editingEmployee);
        if (result.success) {
          fetchEmployees();
          setNotification({ message: "Cập nhật thành công", type: "success" });
        } else {
          setNotification({ message: result.message, type: "error" });
          return;
        }
      } else {
        // Gọi API add
        const result = await addEmployee(editingEmployee);
        if (result.success) {
          fetchEmployees();
          setNotification({ message: "Thêm thành công", type: "success" });
        } else {
          setNotification({ message: result.message, type: "error" });
          return;
        }
      }
      setShowModal(false);
    } catch (error) {
      setNotification({ message: "Có lỗi xảy ra: " + error.message, type: "error" });
    }
  };

  const handleDelete = (importItem) => {
    setConfirmDelete(importItem);
  };

  const confirmDeleteEmployee = async (id) => {
    try {
      const result = await deleteEmployee(id);
      if (result.success) {
        // Tính toán số trang mới sau khi xóa dựa trên dữ liệu hiện tại
        const currentTotalItems = filteredEmployees.length;
        const newTotalItems = currentTotalItems - 1;
        const newTotalPages = Math.ceil(newTotalItems / ITEMS_PER_PAGE);
        
        // Kiểm tra xem phần tử bị xóa có phải là phần tử cuối cùng của trang hiện tại không
        const itemsOnCurrentPage = currentEmployees.length;
        const isLastItemOnPage = itemsOnCurrentPage === 1;
        
        // Nếu trang hiện tại lớn hơn số trang mới và có ít nhất 1 trang, chuyển về trang đầu tiên
        // Hoặc nếu xóa phần tử cuối cùng của trang và không phải trang đầu tiên, chuyển về trang trước
        if (currentPage > newTotalPages && newTotalPages > 0) {
          setCurrentPage(1);
        } else if (isLastItemOnPage && currentPage > 1) {
          setCurrentPage(currentPage - 1);
        }
        
        fetchEmployees();
        fetchEmployeesWithSalary(); // Cập nhật danh sách nhân viên có lương
        setNotification({ message: result.message, type: "success" });
      } else {
        setNotification({ message: result.message, type: "error" });
      }
    } catch (error) {
      setNotification({ message: "Lỗi khi xóa: " + error.message, type: "error" });
    } finally {
      setConfirmDelete(null);
    }
  };

  const cancelDelete = () => {
    setConfirmDelete(null);
  };

  const filterData = () => {
    if (!searchTerm.trim()) return employees;

    return employees.filter(item => {
      const searchLower = searchTerm.toLowerCase();
      switch (searchCriteria) {
        case "nameEmployee":
          return item.nameEmployee.toLowerCase().includes(searchLower);
        case "addressEmployee":
          return item.addressEmployee.toLowerCase().includes(searchLower);
        case "roleEmployee":
          return item.roleEmployee.toLowerCase().includes(searchLower);
        case "all":
          return (
            item.nameEmployee.toLowerCase().includes(searchLower) ||
            item.addressEmployee.toLowerCase().includes(searchLower) ||
            item.roleEmployee.toLowerCase().includes(searchLower)
          );
        default:
          return true;
      }
    });
  };

  const filteredEmployees = filterData();
  const totalPages = Math.ceil(filteredEmployees.length / ITEMS_PER_PAGE);
  
  // Đảm bảo currentPage không vượt quá totalPages
  const validCurrentPage = totalPages > 0 ? Math.min(currentPage, totalPages) : 1;
  if (validCurrentPage !== currentPage) {
    setCurrentPage(validCurrentPage);
  }
  
  const startIndex = (validCurrentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentEmployees = filteredEmployees.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;
    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          className={`employees-pagination-button ${currentPage === i ? 'active' : ''}`}
          onClick={() => handlePageChange(i)}
        >
          {i}
        </button>
      );
    }

    return (
      <div className="employees-pagination-container">
        <button
          className="employees-pagination-button"
          onClick={() => handlePageChange(1)}
          disabled={currentPage === 1}
        >
          &laquo;
        </button>
        <button
          className="employees-pagination-button"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          &lsaquo;
        </button>
        {pages}
        <button
          className="employees-pagination-button"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          &rsaquo;
        </button>
        <button
          className="employees-pagination-button"
          onClick={() => handlePageChange(totalPages)}
          disabled={currentPage === totalPages}
        >
          &raquo;
        </button>
        <span className="employees-pagination-info">
          Trang {currentPage} / {totalPages}
        </span>
      </div>
    );
  };

  console.log('filteredEmployees:', filteredEmployees.length, filteredEmployees);

  if (loading) return <div className="employees-loading">Đang tải...</div>

  return (
    <div className="employees-page">
      {notification && (
        <div className={`employees-notification-container employees-notification-${notification.type}`}>
          {notification.message}
        </div>
      )}
      {confirmDelete && (
        <div className="employees-modal-overlay">
          <div className="employees-modal">
            <h2>Xác nhận xóa</h2>
            <p>Bạn có chắc chắn muốn xóa nhân viên này?</p>
            <div className="employees-form-actions">
              <button className="employees-btn employees-btn-danger" onClick={() => confirmDeleteEmployee(confirmDelete)}>Xóa</button>
              <button className="employees-btn employees-btn-secondary" onClick={cancelDelete}>Hủy</button>
            </div>
          </div>
        </div>
      )}
      <div className="employees-page-header">
        <h1 className="employees-page-title">Quản lý nhân viên</h1>
        <button 
          className="employees-btn employees-btn-primary" 
          onClick={handleAdd}
        >
          Thêm nhân viên mới
        </button>
      </div>

      <div className="employees-search-container">
        <input
          type="text"
          placeholder="Nhập từ khóa tìm kiếm..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          className="employees-form-input"
        />
        <select
          value={searchCriteria}
          onChange={(e) => {
            setSearchCriteria(e.target.value);
            setCurrentPage(1);
          }}
          className="employees-form-input"
        >
          <option value="all">Tất cả</option>
          <option value="nameEmployee">Tên nhân viên</option>
          <option value="addressEmployee">Địa chỉ</option>
          <option value="roleEmployee">Chức vụ</option>
        </select>
      </div>

      {showModal && (
        <div className="employees-modal-overlay">
          <div className="employees-modal">
            <h2>{modalType === "add" ? "Thêm nhân viên mới" : "Sửa nhân viên"}</h2>
            <form onSubmit={handleSave} className="employees-form">
              <div className="employees-form-group">
                <label className="employees-form-label">ID:</label>
                <input
                  type="text"
                  className="employees-form-input"
                  value={editingEmployee.idEmployee}
                  readOnly
                  style={{ backgroundColor: '#f5f5f5', cursor: 'not-allowed' }}
                />
              </div>
              <div className="employees-form-group">
                <label className="employees-form-label">Tên nhân viên:</label>
                <input
                  type="text"
                  className="employees-form-input"
                  value={editingEmployee.nameEmployee}
                  onChange={e => setEditingEmployee({ ...editingEmployee, nameEmployee: e.target.value })}
                  required
                />
              </div>
              
              <div className="employees-form-group">
                <label className="employees-form-label">Giới tính:</label>
                <select
                  className="employees-form-input"
                  value={editingEmployee.genderEmployee}
                  onChange={(e) => setEditingEmployee({...editingEmployee, genderEmployee: e.target.value})}
                >
                  <option value="Male">Nam</option>
                  <option value="Female">Nữ</option>
                  <option value="Other">Khác</option>
                </select>
              </div>
              
              <div className="employees-form-group">
                <label className="employees-form-label">Địa chỉ:</label>
                <input
                  type="text"
                  className="employees-form-input"
                  value={editingEmployee.addressEmployee}
                  onChange={(e) => setEditingEmployee({...editingEmployee, addressEmployee: e.target.value})}
                  required
                />
              </div>
              
              <div className="employees-form-group">
                <label className="employees-form-label">Số điện thoại:</label>
                <input
                  type="tel"
                  className="employees-form-input"
                  value={editingEmployee.phoneEmployee}
                  onChange={(e) => setEditingEmployee({...editingEmployee, phoneEmployee: e.target.value})}
                  required
                />
              </div>
              
              <div className="employees-form-group">
                <label className="employees-form-label">Chức vụ:</label>
                <select
                  className="employees-form-input"
                  value={editingEmployee.roleEmployee}
                  onChange={(e) => setEditingEmployee({...editingEmployee, roleEmployee: e.target.value})}
                >
                  <option value="Cashier">Thu ngân</option>
                  <option value="Manager">Quản lý</option>
                  <option value="Accountant">Kế toán</option>
                  <option value="Stocker">Thủ kho</option>
                </select>
              </div>
              
              <div className="employees-form-actions">
                <button type="submit" className="employees-btn employees-btn-primary">{modalType === "add" ? "Thêm" : "Lưu"}</button>
                <button type="button" className="employees-btn employees-btn-secondary" onClick={() => setShowModal(false)}>Hủy</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="employees-table-container">
        <table className="employees-data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Tên nhân viên</th>
              <th>Giới tính</th>
              <th>Địa chỉ</th>
              <th>Số điện thoại</th>
              <th>Chức vụ</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {currentEmployees.map((employee) => (
              <tr key={employee.idEmployee}>
                <td>{employee.idEmployee}</td>
                <td>{employee.nameEmployee}</td>
                <td>{employee.genderEmployee}</td>
                <td>{employee.addressEmployee}</td>
                <td>{employee.phoneEmployee}</td>
                <td>{employee.roleEmployee}</td>
                <td>
                  <button 
                    className={`employees-btn employees-btn-sm ${employeesWithSalary.includes(employee.idEmployee) ? 'employees-btn-warning' : 'employees-btn-secondary'}`}
                    onClick={() => handleDelete(employee.idEmployee)}
                    title={employeesWithSalary.includes(employee.idEmployee) ? 'Nhân viên này có dữ liệu lương, không thể xóa' : 'Xóa nhân viên'}
                    disabled={employeesWithSalary.includes(employee.idEmployee)}
                  >
                    {employeesWithSalary.includes(employee.idEmployee) ? '🔒 Không thể xóa' : 'Xóa'}
                  </button>
                  <button
                    className="employees-btn employees-btn-primary employees-btn-sm"
                    style={{ marginLeft: 8 }}
                    onClick={() => handleEdit(employee)}
                  >
                    Sửa
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

export default Employees 