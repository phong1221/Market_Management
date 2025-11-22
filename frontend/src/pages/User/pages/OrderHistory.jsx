import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth.js';
import { fetchUserOrders } from '../../../services/orderService.jsx';
import { fetchProduct } from '../../../services/productService';
import { FaShoppingBag, FaCalendarAlt, FaMapMarkerAlt, FaPhone, FaCreditCard, FaCheckCircle, FaClock, FaTimesCircle } from 'react-icons/fa';
import '../css/orderHistory.css';

const statusLabel = {
  'Pending': 'Chờ xử lý',
  'Not Confirm': 'Chờ xác nhận',
  'Confirmed': 'Đã xác nhận',
  'Shipping': 'Đang giao',
  'Completed': 'Hoàn thành',
  'Cancelled': 'Đã hủy',
  'Paid': 'Đã thanh toán'
};

const statusIcon = {
  'Pending': <FaClock className="status-icon" />,
  'Not Confirm': <FaClock className="status-icon" />,
  'Confirmed': <FaCheckCircle className="status-icon" />,
  'Shipping': <FaCheckCircle className="status-icon" />,
  'Completed': <FaCheckCircle className="status-icon" />,
  'Cancelled': <FaTimesCircle className="status-icon" />,
  'Paid': <FaCheckCircle className="status-icon" />
};

const OrderHistory = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [orderProducts, setOrderProducts] = useState({});
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    if (user && user.idUser) {
      loadOrders();
    } else {
      setLoading(false);
    }
  }, [user]);

  // Reload orders when component becomes visible (e.g., after payment)
  useEffect(() => {
    const handleFocus = () => {
      if (user && user.idUser) {
        loadOrders();
      }
    };
    
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [user]);

  const loadOrders = async () => {
    if (!user) {
      console.error('OrderHistory: User is missing');
      setLoading(false);
      return;
    }

    // Convert idUser to number if it's a string
    const userId = user.idUser ? parseInt(user.idUser, 10) : null;
    
    if (!userId || isNaN(userId) || userId <= 0) {
      console.error('OrderHistory: Invalid idUser', { 
        idUser: user.idUser, 
        userId, 
        type: typeof user.idUser 
      });
      setLoading(false);
      return;
    }
    
    setLoading(true);
    try {
      console.log('OrderHistory: Loading orders for user:', userId);
      console.log('OrderHistory: Full user object:', JSON.stringify(user, null, 2));
      
      // Fetch orders and products in parallel
      const [ordersData, allProducts] = await Promise.all([
        fetchUserOrders(userId),
        fetchProduct()
      ]);
      
      console.log('OrderHistory: Received orders:', ordersData);
      console.log('OrderHistory: Number of orders:', ordersData?.length || 0);
      
      if (!Array.isArray(ordersData)) {
        console.error('OrderHistory: ordersData is not an array:', typeof ordersData, ordersData);
      }
      
      setOrders(Array.isArray(ordersData) ? ordersData : []);
      
      // Create products map
      const productsMap = {};
      if (Array.isArray(allProducts)) {
        allProducts.forEach(product => {
          productsMap[product.idProduct] = product;
        });
      }
      setOrderProducts(productsMap);
    } catch (error) {
      console.error('Lỗi khi tải lịch sử đơn hàng:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetail = (order) => {
    setSelectedOrder(order);
    setShowDetailModal(true);
  };

  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return '0 ₫';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const formatDateTime = (dateValue, orderId) => {
    // Nếu không có created_at, dùng idOrder để hiển thị thông tin
    if (!dateValue) {
      return `Đơn hàng #${orderId}`;
    }
    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) {
      return `Đơn hàng #${orderId}`;
    }
    return date.toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredOrders = orders.filter(order => {
    if (filterStatus === 'all') return true;
    return (order.Status || '').toLowerCase() === filterStatus.toLowerCase();
  });

  if (!user) {
    return (
      <div className="order-history-page">
        <div className="order-history-empty">
          <FaShoppingBag className="empty-icon" />
          <h2>Vui lòng đăng nhập để xem lịch sử đơn hàng</h2>
        </div>
      </div>
    );
  }

  // Debug: Log user info
  console.log('OrderHistory - User object:', user);
  console.log('OrderHistory - User idUser:', user.idUser);
  console.log('OrderHistory - User idUser type:', typeof user.idUser);

  if (loading) {
    return (
      <div className="order-history-page">
        <div className="order-history-loading">Đang tải lịch sử đơn hàng...</div>
      </div>
    );
  }

  return (
    <div className="order-history-page">
      <div className="order-history-header">
        <h1 className="order-history-title">
          <FaShoppingBag className="title-icon" />
          Lịch Sử Đơn Hàng
        </h1>
        <p className="order-history-subtitle">Xem lại các đơn hàng bạn đã đặt</p>
      </div>

      <div className="order-history-filter">
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="order-history-filter-select"
        >
          <option value="all">Tất cả trạng thái</option>
          {Object.keys(statusLabel).map((key) => (
            <option key={key} value={key}>
              {statusLabel[key]}
            </option>
          ))}
        </select>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="order-history-empty">
          <FaShoppingBag className="empty-icon" />
          <h2>Bạn chưa có đơn hàng nào</h2>
          <p>Hãy bắt đầu mua sắm để tạo đơn hàng đầu tiên!</p>
        </div>
      ) : (
        <div className="order-history-list">
          {filteredOrders.map((order) => (
            <div key={order.idOrder} className="order-history-card">
              <div className="order-card-header">
                <div className="order-card-info">
                  <h3 className="order-card-title">
                    Đơn hàng #{order.idOrder}
                  </h3>
                  <div className="order-card-meta">
                    <span className="order-meta-item">
                      <FaCalendarAlt /> {formatDateTime(order.created_at, order.idOrder)}
                    </span>
                    <span className={`order-status-badge status-${(order.Status || 'pending').toLowerCase().replace(/\s+/g, '-')}`}>
                      {statusIcon[order.Status] || <FaClock />}
                      {statusLabel[order.Status] || order.Status || 'Chờ xử lý'}
                    </span>
                  </div>
                </div>
                <div className="order-card-amount">
                  <span className="order-amount-label">Tổng tiền</span>
                  <span className="order-amount-value">
                    {formatCurrency(order.totalAmount || 0)}
                  </span>
                </div>
              </div>

              <div className="order-card-body">
                <div className="order-card-details">
                  <div className="order-detail-item">
                    <FaMapMarkerAlt className="detail-icon" />
                    <span>{order.address || 'N/A'}</span>
                  </div>
                  <div className="order-detail-item">
                    <FaPhone className="detail-icon" />
                    <span>{order.phone || 'N/A'}</span>
                  </div>
                  <div className="order-detail-item">
                    <FaCreditCard className="detail-icon" />
                    <span>{order.methodpayment === 'Banking' ? 'Chuyển khoản' : 'Tiền mặt'}</span>
                  </div>
                </div>

                {order.orderDetails && order.orderDetails.length > 0 && (
                  <div className="order-products-preview">
                    <h4>Sản phẩm ({order.orderDetails.length})</h4>
                    <div className="order-products-list">
                      {order.orderDetails.slice(0, 3).map((detail, idx) => {
                        const product = orderProducts[detail.idProduct];
                        return (
                          <div key={idx} className="order-product-item">
                            {product && (
                              <img 
                                src={`http://localhost/market_management/backend/uploads/${product.picture}`} 
                                alt={product.nameProduct}
                                className="order-product-image"
                                onError={(e) => {
                                  e.target.src = 'https://via.placeholder.com/50';
                                }}
                              />
                            )}
                            <div className="order-product-info">
                              <span className="order-product-name">
                                {product ? product.nameProduct : `Sản phẩm #${detail.idProduct}`}
                              </span>
                              <span className="order-product-quantity">
                                x{detail.quantity} - {formatCurrency(detail.totalPrice)}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                      {order.orderDetails.length > 3 && (
                        <div className="order-products-more">
                          +{order.orderDetails.length - 3} sản phẩm khác
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="order-card-footer">
                <button
                  className="order-detail-btn"
                  onClick={() => handleViewDetail(order)}
                >
                  Xem chi tiết
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showDetailModal && selectedOrder && (
        <div className="order-detail-modal-overlay" onClick={() => setShowDetailModal(false)}>
          <div className="order-detail-modal" onClick={(e) => e.stopPropagation()}>
            <div className="order-detail-modal-header">
              <h2>Chi tiết đơn hàng #{selectedOrder.idOrder}</h2>
              <button
                className="order-detail-modal-close"
                onClick={() => setShowDetailModal(false)}
              >
                ×
              </button>
            </div>

            <div className="order-detail-modal-body">
              <div className="order-detail-section">
                <h3>Thông tin đơn hàng</h3>
                <div className="order-detail-grid">
                  <div className="order-detail-item-full">
                    <strong>Mã đơn hàng:</strong> #{selectedOrder.idOrder}
                  </div>
                  <div className="order-detail-item-full">
                    <strong>Ngày đặt:</strong> {formatDateTime(selectedOrder.created_at, selectedOrder.idOrder)}
                  </div>
                  <div className="order-detail-item-full">
                    <strong>Trạng thái:</strong>
                    <span className={`order-status-badge status-${(selectedOrder.Status || 'pending').toLowerCase().replace(/\s+/g, '-')}`}>
                      {statusIcon[selectedOrder.Status] || <FaClock />}
                      {statusLabel[selectedOrder.Status] || selectedOrder.Status || 'Chờ xử lý'}
                    </span>
                  </div>
                  <div className="order-detail-item-full">
                    <strong>Tổng tiền:</strong>
                    <span className="order-total-amount">
                      {formatCurrency(selectedOrder.totalAmount || 0)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="order-detail-section">
                <h3>Thông tin giao hàng</h3>
                <div className="order-detail-grid">
                  <div className="order-detail-item-full">
                    <FaMapMarkerAlt className="detail-icon" />
                    <strong>Địa chỉ:</strong> {selectedOrder.address || 'N/A'}
                  </div>
                  <div className="order-detail-item-full">
                    <FaPhone className="detail-icon" />
                    <strong>Số điện thoại:</strong> {selectedOrder.phone || 'N/A'}
                  </div>
                  <div className="order-detail-item-full">
                    <FaCreditCard className="detail-icon" />
                    <strong>Hình thức thanh toán:</strong> {selectedOrder.methodpayment === 'Banking' ? 'Chuyển khoản' : 'Tiền mặt'}
                  </div>
                </div>
              </div>

              {selectedOrder.orderDetails && selectedOrder.orderDetails.length > 0 && (
                <div className="order-detail-section">
                  <h3>Sản phẩm đã đặt</h3>
                  <div className="order-detail-products">
                    {selectedOrder.orderDetails.map((detail, idx) => {
                      const product = orderProducts[detail.idProduct];
                      return (
                        <div key={idx} className="order-detail-product-item">
                          {product && (
                            <img 
                              src={`http://localhost/market_management/backend/uploads/${product.picture}`} 
                              alt={product.nameProduct}
                              className="order-detail-product-image"
                              onError={(e) => {
                                e.target.src = 'https://via.placeholder.com/80';
                              }}
                            />
                          )}
                          <div className="order-detail-product-info">
                            <h4>{product ? product.nameProduct : `Sản phẩm #${detail.idProduct}`}</h4>
                            <div className="order-detail-product-meta">
                              <span>Số lượng: {detail.quantity}</span>
                              <span>Đơn giá: {formatCurrency(detail.unitPrice)}</span>
                              <span className="order-detail-product-total">
                                Thành tiền: {formatCurrency(detail.totalPrice)}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderHistory;

