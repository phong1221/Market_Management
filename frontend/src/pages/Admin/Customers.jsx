import React, { useState, useEffect } from 'react';
import '../../css/user.css'; // Reusing User table styles
import '../../css/notification.css';
import { fetchCustomers, updateCustomer, deleteCustomer } from '../../services/customerService';

const Customers = () => {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showEdit, setShowEdit] = useState(false);
    const [notification, setNotification] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [confirmDelete, setConfirmDelete] = useState(null);

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 5;

    const [editData, setEditData] = useState({
        idCustomer: '',
        fullName: '',
        phoneNumber: '',
        address: '',
        email: ''
    });

    useEffect(() => {
        loadCustomers();
    }, []);

    useEffect(() => {
        if (notification) {
            const timer = setTimeout(() => setNotification(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [notification]);

    const loadCustomers = async () => {
        setLoading(true);
        const data = await fetchCustomers();
        setCustomers(data);
        setLoading(false);
    };

    const handleEditClick = (customer) => {
        setEditData({
            idCustomer: customer.idCustomer,
            fullName: customer.fullName || '',
            phoneNumber: customer.phoneNumber || '', // Note: API returned phoneNumber, ensure mismatch handling
            address: customer.address || '',
            email: customer.email || ''
        });
        setShowEdit(true);
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        const result = await updateCustomer(editData);
        if (result.success) {
            setNotification({ message: 'Cập nhật khách hàng thành công', type: 'success' });
            setShowEdit(false);
            loadCustomers();
        } else {
            setNotification({ message: result.message, type: 'error' });
        }
    };

    const handleDeleteClick = (id) => {
        setConfirmDelete(id);
    };

    const confirmDeleteAction = async () => {
        const success = await deleteCustomer(confirmDelete);
        if (success) {
            setNotification({ message: 'Xóa khách hàng thành công', type: 'success' });
            loadCustomers();
        } else {
            setNotification({ message: 'Xóa khách hàng thất bại', type: 'error' });
        }
        setConfirmDelete(null);
    };

    // Search Logic
    const filteredCustomers = customers.filter(c =>
        (c.fullName && c.fullName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (c.phoneNumber && c.phoneNumber.includes(searchTerm)) ||
        (c.email && c.email.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    // Pagination Logic
    const totalPages = Math.ceil(filteredCustomers.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const currentItems = filteredCustomers.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    if (loading) return <div className="users-loading">Đang tải...</div>;

    return (
        <div className="users-page">
            {notification && (
                <div className={`notification-container notification-${notification.type}`}>
                    {notification.message}
                </div>
            )}

            {/* Header */}
            <div className="users-page-header">
                <h1 className="users-page-title">Quản lý Khách hàng</h1>
            </div>

            {/* Search Bar */}
            <div className="admin-search-container">
                <input
                    type="text"
                    placeholder="Tìm kiếm theo tên, số điện thoại, email..."
                    value={searchTerm}
                    onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                    className="admin-search-input"
                />
            </div>

            {/* Table */}
            <div className="users-table-container">
                <table className="users-data-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Họ và Tên</th>
                            <th>Số điện thoại</th>
                            <th>Địa chỉ</th>
                            <th>Email</th>
                            <th>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentItems.length > 0 ? currentItems.map(customer => (
                            <tr key={customer.idCustomer}>
                                <td>{customer.idCustomer}</td>
                                <td>{customer.fullName}</td>
                                <td>{customer.phoneNumber}</td>
                                <td>{customer.address}</td>
                                <td>{customer.email}</td>
                                <td>
                                    <button
                                        className="users-btn users-btn-primary users-btn-sm action-anim"
                                        style={{ marginRight: '5px' }}
                                        onClick={() => handleEditClick(customer)}
                                    >
                                        Sửa
                                    </button>
                                    <button
                                        className="users-btn users-btn-secondary users-btn-sm action-anim"
                                        onClick={() => handleDeleteClick(customer.idCustomer)}
                                    >
                                        Xóa
                                    </button>
                                </td>
                            </tr>
                        )) : (
                            <tr><td colSpan="6" style={{ textAlign: 'center' }}>Không tìm thấy khách hàng nào</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="users-pagination-container">
                    <button
                        className="users-pagination-button"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                    >
                        &lsaquo;
                    </button>
                    {[...Array(totalPages)].map((_, index) => (
                        <button
                            key={index + 1}
                            className={`users-pagination-button ${currentPage === index + 1 ? 'active' : ''}`}
                            onClick={() => handlePageChange(index + 1)}
                        >
                            {index + 1}
                        </button>
                    ))}
                    <button
                        className="users-pagination-button"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                    >
                        &rsaquo;
                    </button>
                    <span className="users-pagination-info">Trang {currentPage} / {totalPages}</span>
                </div>
            )}

            {/* Edit Modal */}
            {showEdit && (
                <div className="users-modal-overlay">
                    <div className="users-modal">
                        <h2>Cập nhật thông tin khách hàng</h2>
                        <form onSubmit={handleUpdate} className="users-form">
                            <div className="users-form-group">
                                <label className="users-form-label">Họ và Tên</label>
                                <input
                                    type="text"
                                    className="users-form-input"
                                    value={editData.fullName}
                                    onChange={(e) => setEditData({ ...editData, fullName: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="users-form-group">
                                <label className="users-form-label">Số điện thoại</label>
                                <input
                                    type="text"
                                    className="users-form-input"
                                    value={editData.phoneNumber}
                                    onChange={(e) => setEditData({ ...editData, phoneNumber: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="users-form-group">
                                <label className="users-form-label">Email</label>
                                <input
                                    type="email"
                                    className="users-form-input"
                                    value={editData.email}
                                    onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                                />
                            </div>
                            <div className="users-form-group">
                                <label className="users-form-label">Địa chỉ</label>
                                <textarea
                                    className="users-form-input"
                                    value={editData.address}
                                    onChange={(e) => setEditData({ ...editData, address: e.target.value })}
                                    rows={3}
                                ></textarea>
                            </div>
                            <div className="users-form-actions">
                                <button type="submit" className="users-btn users-btn-primary">Lưu</button>
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

            {/* Delete Confirmation Modal */}
            {confirmDelete && (
                <div className="users-modal-overlay">
                    <div className="users-modal">
                        <h2>Xác nhận xóa</h2>
                        <p>Bạn có chắc chắn muốn xóa khách hàng này?</p>
                        <div className="users-form-actions">
                            <button className="users-btn users-btn-danger" onClick={confirmDeleteAction}>Xóa</button>
                            <button className="users-btn users-btn-secondary" onClick={() => setConfirmDelete(null)}>Hủy</button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default Customers;
