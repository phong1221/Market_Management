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

  useEffect(() => { 
    fetchEmployees()
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

  const handleDelete = async (id) => {
    setConfirmDelete(id);
  };

  const confirmDeleteEmployee = async (id) => {
    try {
      const success = await deleteEmployee(id);
      if (success) {
        fetchEmployees();
        setNotification({ message: "Xóa nhân viên thành công!", type: "success" });
      } else {
        setNotification({ message: "Xóa thất bại!", type: "error" });
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
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
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
          className={`pagination-button ${currentPage === i ? 'active' : ''}`}
          onClick={() => handlePageChange(i)}
        >
          {i}
        </button>
      );
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
    );
  };

  console.log('filteredEmployees:', filteredEmployees.length, filteredEmployees);

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
            <p>Bạn có chắc chắn muốn xóa nhân viên này?</p>
            <div className="form-actions">
              <button className="btn btn-danger" onClick={() => confirmDeleteEmployee(confirmDelete)}>Xóa</button>
              <button className="btn btn-secondary" onClick={cancelDelete}>Hủy</button>
            </div>
          </div>
        </div>
      )}
      <div className="page-header">
        <h1 className="page-title">Quản lý nhân viên</h1>
        <button 
          className="btn btn-primary" 
          onClick={handleAdd}
        >
          Thêm nhân viên mới
        </button>
      </div>

      <div className="search-container" style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
        <input
          type="text"
          placeholder="Nhập từ khóa tìm kiếm..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          className="modal-input"
          style={{ flex: 1 }}
        />
        <select
          value={searchCriteria}
          onChange={(e) => {
            setSearchCriteria(e.target.value);
            setCurrentPage(1);
          }}
          className="modal-input"
          style={{ width: 'auto' }}
        >
          <option value="all">Tất cả</option>
          <option value="nameEmployee">Tên nhân viên</option>
          <option value="addressEmployee">Địa chỉ</option>
          <option value="roleEmployee">Chức vụ</option>
        </select>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>{modalType === "add" ? "Thêm nhân viên mới" : "Sửa nhân viên"}</h2>
            <form onSubmit={handleSave} className="form">
              <div className="form-group">
                <label className="form-label">ID:</label>
                <input
                  type="text"
                  className="form-input"
                  value={editingEmployee.idEmployee}
                  readOnly
                  style={{ backgroundColor: '#f5f5f5', cursor: 'not-allowed' }}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Tên nhân viên:</label>
                <input
                  type="text"
                  className="form-input"
                  value={editingEmployee.nameEmployee}
                  onChange={e => setEditingEmployee({ ...editingEmployee, nameEmployee: e.target.value })}
                  required
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Giới tính:</label>
                <select
                  className="form-input"
                  value={editingEmployee.genderEmployee}
                  onChange={(e) => setEditingEmployee({...editingEmployee, genderEmployee: e.target.value})}
                >
                  <option value="Male">Nam</option>
                  <option value="Female">Nữ</option>
                  <option value="Other">Khác</option>
                </select>
              </div>
              
              <div className="form-group">
                <label className="form-label">Địa chỉ:</label>
                <input
                  type="text"
                  className="form-input"
                  value={editingEmployee.addressEmployee}
                  onChange={(e) => setEditingEmployee({...editingEmployee, addressEmployee: e.target.value})}
                  required
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Số điện thoại:</label>
                <input
                  type="tel"
                  className="form-input"
                  value={editingEmployee.phoneEmployee}
                  onChange={(e) => setEditingEmployee({...editingEmployee, phoneEmployee: e.target.value})}
                  required
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Chức vụ:</label>
                <select
                  className="form-input"
                  value={editingEmployee.roleEmployee}
                  onChange={(e) => setEditingEmployee({...editingEmployee, roleEmployee: e.target.value})}
                >
                  <option value="Cashier">Thu ngân</option>
                  <option value="Manager">Quản lý</option>
                  <option value="Accountant">Kế toán</option>
                  <option value="Stocker">Thủ kho</option>
                </select>
              </div>
              
              <div className="form-actions">
                <button type="submit" className="btn btn-primary">{modalType === "add" ? "Thêm" : "Lưu"}</button>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Hủy</button>
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
                    className="btn btn-secondary btn-sm"
                    onClick={() => handleDelete(employee.idEmployee)}
                  >
                    Xóa
                  </button>
                  <button
                    className="btn btn-primary btn-sm"
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