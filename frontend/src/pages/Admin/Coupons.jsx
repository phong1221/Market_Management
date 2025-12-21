import React, { useState, useEffect } from 'react'
import { fetchCoupons, addCoupon, updateCoupon, deleteCoupon, hideCoupon } from '../../services/couponService';
import '../../css/promotion.css'; // Reusing promotion css as it is similar
import '../../css/notification.css';

const Coupons = () => {
    const [coupons, setCoupons] = useState([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [formType, setFormType] = useState('add')
    const [formData, setFormData] = useState({
        code: '',
        description: '',
        discount_type: 'percent',
        discount_value: '',
        min_order_value: '',
        expiry_date: '',
        quantity: '',
        status: 'active'
    })
    const [notification, setNotification] = useState(null)
    const [confirmDelete, setConfirmDelete] = useState(null)
    const [searchTerm, setSearchTerm] = useState('')
    const [searchCriteria, setSearchCriteria] = useState('all')
    const [currentPage, setCurrentPage] = useState(1)
    const ITEMS_PER_PAGE = 5

    useEffect(() => {
        loadCoupons()
    }, [])

    useEffect(() => {
        if (notification) {
            const timer = setTimeout(() => setNotification(null), 2500);
            return () => clearTimeout(timer);
        }
    }, [notification]);

    const loadCoupons = async () => {
        setLoading(true)
        try {
            const data = await fetchCoupons();
            setCoupons(data)
        } catch (error) {
            setNotification({ message: 'Lỗi khi tải danh sách coupon: ' + error.message, type: 'error' })
        } finally {
            setLoading(false)
        }
    }

    const handleAdd = () => {
        setFormType('add')
        setFormData({
            code: '',
            description: '',
            discount_type: 'percent',
            discount_value: '',
            min_order_value: '0',
            expiry_date: '',
            quantity: '100',
            status: 'active'
        })
        setShowForm(true)
    }

    const handleEdit = (coupon) => {
        setFormType('edit')
        setFormData({
            code: coupon.code,
            description: coupon.description,
            discount_type: coupon.discount_type,
            discount_value: coupon.discount_value,
            min_order_value: coupon.min_order_value,
            expiry_date: coupon.expiry_date,
            quantity: coupon.quantity,
            status: coupon.status
        })
        setShowForm(true)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!formData.code.trim()) {
            setNotification({ message: 'Vui lòng nhập mã coupon', type: 'error' })
            return
        }

        try {
            if (formType === 'edit') {
                const result = await updateCoupon(formData)
                if (result.success) {
                    loadCoupons()
                    setNotification({ message: 'Cập nhật coupon thành công', type: 'success' })
                } else {
                    setNotification({ message: result.message, type: 'error' })
                    return
                }
            } else {
                const result = await addCoupon(formData)
                if (result.success) {
                    loadCoupons()
                    setNotification({ message: 'Thêm coupon thành công', type: 'success' })
                } else {
                    setNotification({ message: result.message, type: 'error' })
                    return
                }
            }
            setShowForm(false)
        } catch (error) {
            setNotification({ message: 'Lỗi khi lưu coupon: ' + error.message, type: 'error' })
        }
    }

    const handleDelete = (code) => {
        setConfirmDelete(code)
    }

    const confirmDeleteCoupon = async (code) => {
        try {
            const success = await deleteCoupon(code)
            if (success) {
                // Pagination logic after delete
                const currentTotalItems = filteredCoupons.length;
                const newTotalItems = currentTotalItems - 1;
                const newTotalPages = Math.ceil(newTotalItems / ITEMS_PER_PAGE);
                const itemsOnCurrentPage = currentCoupons.length;
                const isLastItemOnPage = itemsOnCurrentPage === 1;

                if (currentPage > newTotalPages && newTotalPages > 0) {
                    setCurrentPage(1);
                } else if (isLastItemOnPage && currentPage > 1) {
                    setCurrentPage(currentPage - 1);
                }

                loadCoupons()
                setNotification({ message: 'Xóa coupon thành công', type: 'success' })
            } else {
                setNotification({ message: 'Xóa coupon thất bại', type: 'error' })
            }
        } catch (error) {
            setNotification({ message: 'Lỗi khi xóa coupon: ' + error.message, type: 'error' })
        } finally {
            setConfirmDelete(null)
        }
    }

    const handleHide = async (code) => {
        try {
            const result = await hideCoupon(code)
            if (result.success) {
                loadCoupons()
                const statusText = result.newStatus === 'active' ? 'kích hoạt' : 'ẩn'
                setNotification({ message: `Đã ${statusText} coupon thành công`, type: 'success' })
            } else {
                setNotification({ message: result.message, type: 'error' })
            }
        } catch (error) {
            setNotification({ message: 'Lỗi khi thay đổi trạng thái: ' + error.message, type: 'error' })
        }
    }

    // Search & Pagination
    const filterData = () => {
        if (!searchTerm.trim()) return coupons
        return coupons.filter(item => {
            const searchLower = searchTerm.toLowerCase()
            switch (searchCriteria) {
                case 'code':
                    return item.code.toLowerCase().includes(searchLower)
                case 'description':
                    return item.description.toLowerCase().includes(searchLower)
                case 'status':
                    return item.status.toLowerCase().includes(searchLower)
                case 'all':
                    return (
                        item.code.toLowerCase().includes(searchLower) ||
                        item.description.toLowerCase().includes(searchLower) ||
                        item.status.toLowerCase().includes(searchLower)
                    )
                default:
                    return true
            }
        })
    }

    const filteredCoupons = filterData()
    const totalPages = Math.ceil(filteredCoupons.length / ITEMS_PER_PAGE)

    const validCurrentPage = totalPages > 0 ? Math.min(currentPage, totalPages) : 1;
    if (validCurrentPage !== currentPage) {
        setCurrentPage(validCurrentPage);
    }

    const startIndex = (validCurrentPage - 1) * ITEMS_PER_PAGE
    const endIndex = startIndex + ITEMS_PER_PAGE
    const currentCoupons = filteredCoupons.slice(startIndex, endIndex)

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
                        <p>Bạn có chắc chắn muốn xóa coupon <b>{confirmDelete}</b>?</p>
                        <div className="promotions-form-actions">
                            <button className="promotions-btn promotions-btn-danger" onClick={() => confirmDeleteCoupon(confirmDelete)}>Xóa</button>
                            <button className="promotions-btn promotions-btn-secondary" onClick={() => setConfirmDelete(null)}>Hủy</button>
                        </div>
                    </div>
                </div>
            )}
            <div className="promotions-page-header">
                <h1 className="promotions-page-title">Quản lý Coupon (Mã giảm giá)</h1>
                <button
                    className="promotions-btn promotions-btn-primary"
                    onClick={handleAdd}
                >
                    Thêm Coupon
                </button>
            </div>

            <div className="admin-search-container">
                <input
                    type="text"
                    placeholder="Nhập mã hoặc mô tả..."
                    value={searchTerm}
                    onChange={(e) => {
                        setSearchTerm(e.target.value)
                        setCurrentPage(1)
                    }}
                    className="admin-search-input"
                />
                <select
                    value={searchCriteria}
                    onChange={(e) => {
                        setSearchCriteria(e.target.value)
                        setCurrentPage(1)
                    }}
                    className="admin-search-select"
                >
                    <option value="all">Tất cả</option>
                    <option value="code">Mã Coupon</option>
                    <option value="description">Mô tả</option>
                    <option value="status">Trạng thái</option>
                </select>
            </div>

            {showForm && (
                <div className="promotions-modal-overlay">
                    <div className="promotions-modal">
                        <h2>{formType === 'add' ? 'Thêm Coupon mới' : 'Sửa Coupon'}</h2>
                        <form onSubmit={handleSubmit} className="promotions-form">
                            <div className="promotions-form-group">
                                <label className="promotions-form-label">Mã Coupon (Code):</label>
                                <input
                                    type="text"
                                    className="promotions-form-input"
                                    value={formData.code}
                                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                    required
                                    readOnly={formType === 'edit'}
                                    style={formType === 'edit' ? { backgroundColor: '#f5f5f5', cursor: 'not-allowed' } : {}}
                                    placeholder="VD: SALE50, TET2025"
                                />
                            </div>

                            <div className="promotions-form-group">
                                <label className="promotions-form-label">Mô tả:</label>
                                <textarea
                                    className="promotions-form-input"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    required
                                    rows="2"
                                />
                            </div>

                            <div className="promotions-form-group" style={{ display: 'flex', gap: '10px' }}>
                                <div style={{ flex: 1 }}>
                                    <label className="promotions-form-label">Loại giảm giá:</label>
                                    <select
                                        className="promotions-form-input"
                                        value={formData.discount_type}
                                        onChange={(e) => setFormData({ ...formData, discount_type: e.target.value })}
                                    >
                                        <option value="percent">Phần trăm (%)</option>
                                        <option value="fixed">Số tiền cố định (VND)</option>
                                    </select>
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label className="promotions-form-label">Giá trị giảm:</label>
                                    <input
                                        type="number"
                                        className="promotions-form-input"
                                        value={formData.discount_value}
                                        onChange={(e) => setFormData({ ...formData, discount_value: e.target.value })}
                                        min="0"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="promotions-form-group">
                                <label className="promotions-form-label">Đơn hàng tối thiểu (VND):</label>
                                <input
                                    type="number"
                                    className="promotions-form-input"
                                    value={formData.min_order_value}
                                    onChange={(e) => setFormData({ ...formData, min_order_value: e.target.value })}
                                    min="0"
                                />
                            </div>

                            <div className="promotions-form-group">
                                <label className="promotions-form-label">Số lượng:</label>
                                <input
                                    type="number"
                                    className="promotions-form-input"
                                    value={formData.quantity}
                                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                                    min="0"
                                    required
                                />
                            </div>

                            <div className="promotions-form-group">
                                <label className="promotions-form-label">Ngày hết hạn:</label>
                                <input
                                    type="date"
                                    className="promotions-form-input"
                                    value={formData.expiry_date}
                                    onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
                                    required
                                />
                            </div>

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
                            <th>Mã Code</th>
                            <th>Mô tả</th>
                            <th>Giảm giá</th>
                            <th>Đơn tối thiểu</th>
                            <th>Hết hạn</th>
                            <th>SL</th>
                            <th>Trạng thái</th>
                            <th>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentCoupons.map((coupon) => (
                            <tr key={coupon.code}>
                                <td style={{ fontWeight: 'bold', color: '#2c3e50' }}>{coupon.code}</td>
                                <td>{coupon.description}</td>
                                <td>
                                    {parseFloat(coupon.discount_value).toLocaleString()}
                                    {coupon.discount_type === 'percent' ? '%' : ' VND'}
                                </td>
                                <td>{parseFloat(coupon.min_order_value).toLocaleString()} VND</td>
                                <td>{coupon.expiry_date}</td>
                                <td>{coupon.quantity}</td>
                                <td>
                                    <span className={`promotions-status-badge ${coupon.status === 'active' ? 'active' : 'inactive'}`}>
                                        {coupon.status === 'active' ? 'Hoạt động' : 'Đã ẩn'}
                                    </span>
                                </td>
                                <td>
                                    <button
                                        className="promotions-btn promotions-btn-primary promotions-btn-sm"
                                        onClick={() => handleEdit(coupon)}
                                    >
                                        Sửa
                                    </button>
                                    <button
                                        className="promotions-btn promotions-btn-info promotions-btn-sm"
                                        onClick={() => handleHide(coupon.code)}
                                    >
                                        {coupon.status === 'active' ? 'Ẩn' : 'Hiện'}
                                    </button>
                                    <button
                                        className="promotions-btn promotions-btn-secondary promotions-btn-sm"
                                        onClick={() => handleDelete(coupon.code)}
                                    >
                                        Xóa
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {currentCoupons.length === 0 && (
                            <tr>
                                <td colSpan="8" style={{ textAlign: 'center', padding: '20px' }}>Chưa có coupon nào</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            {renderPagination()}
        </div>
    )
}

export default Coupons
