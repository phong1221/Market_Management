import React, { useState, useEffect } from 'react';
import { fetchOrders, updateOrder, deleteOrder } from '../../services/orderService.jsx';
import '../../css/order.css';
import '../../css/notification.css';

const statusLabel = {
  'Pending': 'Chờ xử lý',
  'Not Confirm': 'Chờ xác nhận',
  'Confirmed': 'Đã xác nhận',
  'Shipping': 'Đang giao',
  'Completed': 'Hoàn thành',
  'Cancelled': 'Đã hủy',
  'Paid': 'Đã thanh toán'
};

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusValue, setStatusValue] = useState('Pending');
  const [notification, setNotification] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [saving, setSaving] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 5;

  useEffect(() => {
    loadOrders();
  }, []);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 2500);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const data = await fetchOrders();
      setOrders(Array.isArray(data) ? data : []);
    } catch (error) {
      setNotification({ type: 'error', message: 'Không thể tải danh sách đơn hàng' });
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetail = (order) => {
    setSelectedOrder(order);
    setShowDetailModal(true);
  };

  const handleUpdateStatus = (order) => {
    setSelectedOrder(order);
    setStatusValue(order.Status || 'Pending');
    setShowStatusModal(true);
  };

  const saveStatus = async () => {
    if (!selectedOrder) return;
    setSaving(true);
    const payload = {
      idOrder: selectedOrder.idOrder,
      Status: statusValue
    };
    const result = await updateOrder(payload);
    setSaving(false);

    if (result.success) {
      setNotification({ type: 'success', message: 'Cập nhật trạng thái thành công' });
      setShowStatusModal(false);
      loadOrders();
    } else {
      setNotification({ type: 'error', message: result.message || 'Cập nhật thất bại' });
    }
  };

  const handleDelete = (order) => {
    setConfirmDelete(order);
  };

  const confirmDeleteOrder = async () => {
    if (!confirmDelete) return;
    const result = await deleteOrder(confirmDelete.idOrder);
    if (result.success) {
      // Tính toán số trang mới sau khi xóa
      const currentTotalItems = filteredOrders.length;
      const newTotalItems = currentTotalItems - 1;
      const newTotalPages = Math.ceil(newTotalItems / ITEMS_PER_PAGE);
      
      // Kiểm tra xem phần tử bị xóa có phải là phần tử cuối cùng của trang hiện tại không
      const itemsOnCurrentPage = currentOrders.length;
      const isLastItemOnPage = itemsOnCurrentPage === 1;
      
      // Logic điều hướng trang sau khi xóa
      if (currentPage > newTotalPages && newTotalPages > 0) {
        setCurrentPage(1);
      } else if (isLastItemOnPage && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }
      
      setNotification({ type: 'success', message: 'Đã xóa đơn hàng' });
      loadOrders();
    } else {
      setNotification({ type: 'error', message: result.message || 'Xóa đơn hàng thất bại' });
    }
    setConfirmDelete(null);
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch =
      !searchTerm ||
      `${order.idOrder}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.nameUser || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === 'all' || (order.Status || '').toLowerCase() === filterStatus.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE);
  
  // Đảm bảo currentPage không vượt quá totalPages
  const validCurrentPage = totalPages > 0 ? Math.min(currentPage, totalPages) : 1;
  if (validCurrentPage !== currentPage) {
    setCurrentPage(validCurrentPage);
  }
  
  const startIndex = (validCurrentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentOrders = filteredOrders.slice(startIndex, endIndex);

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
          onClick={() => handlePageChange(i)}
          className={`orders-pagination-button ${currentPage === i ? 'active' : ''}`}
        >
          {i}
        </button>
      );
    }

    return (
      <div className="orders-pagination-container">
        <button
          onClick={() => handlePageChange(1)}
          disabled={currentPage === 1}
          className="orders-pagination-button"
        >
          &laquo;
        </button>
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="orders-pagination-button"
        >
          &lsaquo;
        </button>
        {pages}
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="orders-pagination-button"
        >
          &rsaquo;
        </button>
        <button
          onClick={() => handlePageChange(totalPages)}
          disabled={currentPage === totalPages}
          className="orders-pagination-button"
        >
          &raquo;
        </button>
        <span className="orders-pagination-info">
          Trang {currentPage} / {totalPages}
        </span>
      </div>
    );
  };

  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return '0 ₫';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const formatDateTime = (dateValue) => {
    if (!dateValue) return 'Không xác định';
    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) return dateValue;
    return date.toLocaleString('vi-VN');
  };

  if (loading) return <div className="orders-loading">Đang tải dữ liệu đơn hàng...</div>;

  return (
    <div className="orders-page">
      {notification && (
        <div className={`notification-container notification-${notification.type}`}>
          {notification.message}
        </div>
      )}

      <div className="orders-page-header">
        <div>
          <h1 className="orders-page-title">Quản lý Đơn hàng</h1>
          <p className="orders-page-subtitle">Theo dõi, cập nhật trạng thái và chi tiết đơn hàng</p>
        </div>
      </div>

      <div className="orders-filter-bar">
        <input
          type="text"
          placeholder="Tìm kiếm theo mã đơn hoặc tên khách hàng..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          className="orders-form-input"
        />
        <select
          value={filterStatus}
          onChange={(e) => {
            setFilterStatus(e.target.value);
            setCurrentPage(1);
          }}
          className="orders-form-input"
        >
          <option value="all">Tất cả trạng thái</option>
          {Object.keys(statusLabel).map((key) => (
            <option key={key} value={key}>
              {statusLabel[key]}
            </option>
          ))}
        </select>
      </div>

      <div className="orders-table-container">
        <table className="orders-data-table">
          <thead>
            <tr>
              <th>Mã đơn</th>
              <th>Khách hàng</th>
              <th>Ngày đặt</th>
              <th>Tổng tiền</th>
              <th>Trạng thái</th>
              <th>Thanh toán</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {currentOrders.length === 0 && (
              <tr>
                <td colSpan="7" className="orders-empty-row">
                  Không tìm thấy đơn hàng phù hợp.
                </td>
              </tr>
            )}
            {currentOrders.map((order) => (
              <tr key={order.idOrder}>
                <td>#{order.idOrder}</td>
                <td className="orders-customer-cell">
                  <span className="orders-customer-name">{order.nameUser || 'Không có tên'}</span>
                  <span className="orders-customer-phone">{order.phone}</span>
                </td>
                <td>{formatDateTime(order.created_at || order.orderDate)}</td>
                <td>{formatCurrency(order.totalAmount || 0)}</td>
                <td>
                  <span className={`orders-status-badge status-${(order.Status || 'pending').toLowerCase().replace(/\s+/g, '-')}`}>
                    {statusLabel[order.Status] || order.Status || 'Chờ xử lý'}
                  </span>
                </td>
                <td>
                  <span className={`orders-payment-badge payment-${(order.methodpayment || 'cash').toLowerCase()}`}>
                    {order.methodpayment || 'Cash'}
                  </span>
                </td>
                <td>
                  <div className="orders-action-buttons">
                    <button
                      className="orders-btn orders-btn-info"
                      onClick={() => handleViewDetail(order)}
                    >
                      Chi tiết
                    </button>
                    <button
                      className="orders-btn orders-btn-warning"
                      onClick={() => handleUpdateStatus(order)}
                    >
                      Cập nhật
                    </button>
                    <button
                      className="orders-btn orders-btn-danger"
                      onClick={() => handleDelete(order)}
                    >
                      Xóa
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {renderPagination()}

      {showDetailModal && selectedOrder && (
        <div className="orders-modal-overlay">
          <div className="orders-modal">
            <h2>Đơn hàng #{selectedOrder.idOrder}</h2>
            <div className="orders-detail-grid">
              <div><strong>Khách hàng:</strong> {selectedOrder.nameUser || 'Không có'}</div>
              <div><strong>Số điện thoại:</strong> {selectedOrder.phone || 'N/A'}</div>
              <div><strong>Địa chỉ:</strong> {selectedOrder.address || 'N/A'}</div>
              <div><strong>Hình thức thanh toán:</strong> {selectedOrder.methodpayment || 'N/A'}</div>
              <div><strong>Tổng tiền:</strong> {formatCurrency(selectedOrder.totalAmount || 0)}</div>
              <div><strong>Trạng thái:</strong> {statusLabel[selectedOrder.Status] || selectedOrder.Status || 'Chờ xử lý'}</div>
            </div>

            <div className="orders-products-section">
              <h4>Chi tiết sản phẩm</h4>
              {selectedOrder.details && selectedOrder.details.length > 0 ? (
                <table className="orders-data-table">
                  <thead>
                    <tr>
                      <th>Sản phẩm</th>
                      <th>Số lượng</th>
                      <th>Đơn giá</th>
                      <th>Thành tiền</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedOrder.details.map((item, idx) => (
                      <tr key={idx}>
                        <td>{item.nameProduct}</td>
                        <td>{item.quantity}</td>
                        <td>{formatCurrency(item.price)}</td>
                        <td>{formatCurrency(item.totalPrice)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="orders-empty-row">
                  Chưa có chi tiết sản phẩm cho đơn hàng này.
                </div>
              )}
            </div>

            <div className="orders-form-actions">
              <button className="orders-btn orders-btn-secondary" onClick={() => setShowDetailModal(false)}>Đóng</button>
            </div>
          </div>
        </div>
      )}

      {showStatusModal && selectedOrder && (
        <div className="orders-modal-overlay">
          <div className="orders-modal orders-modal-small">
            <h2>Cập nhật trạng thái #{selectedOrder.idOrder}</h2>
            <div className="orders-form-group">
              <label className="orders-form-label">Trạng thái</label>
              <select
                className="orders-form-input"
                value={statusValue}
                onChange={(e) => setStatusValue(e.target.value)}
              >
                {Object.keys(statusLabel).map((key) => (
                  <option key={key} value={key}>
                    {statusLabel[key]}
                  </option>
                ))}
              </select>
            </div>
            <div className="orders-form-actions">
              <button className="orders-btn orders-btn-primary" onClick={saveStatus} disabled={saving}>
                {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
              </button>
              <button className="orders-btn orders-btn-secondary" onClick={() => setShowStatusModal(false)}>Hủy</button>
            </div>
          </div>
        </div>
      )}

      {confirmDelete && (
        <div className="orders-modal-overlay">
          <div className="orders-modal orders-modal-small">
            <h2>Xóa đơn hàng</h2>
            <p>Bạn có chắc muốn xóa đơn hàng #{confirmDelete.idOrder}? Thao tác này không thể hoàn tác.</p>
            <div className="orders-form-actions">
              <button className="orders-btn orders-btn-danger" onClick={confirmDeleteOrder}>Xóa</button>
              <button className="orders-btn orders-btn-secondary" onClick={() => setConfirmDelete(null)}>Hủy</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
