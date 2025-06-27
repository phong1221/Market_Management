import React, { useState, useEffect } from 'react';
import '../../css/order.css'; // Sẽ tạo file này ở bước sau

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  
  // Dữ liệu mẫu
  const mockOrders = [
    {
      idOrder: 101,
      nameUser: 'Nguyễn Văn A',
      address: '123 Đường ABC, Quận 1, TP.HCM',
      phone: '0901234567',
      methodpayment: 'Cash',
      Status: 'Confirmed',
      exportOrderPayment: 550000,
      orderDate: '2025-06-28T10:30:00',
      details: [
        { idProduct: 1, nameProduct: 'Táo', quantity: 2, price: 25000, totalPrice: 50000 },
        { idProduct: 11, nameProduct: 'Gà Rán', quantity: 10, price: 50000, totalPrice: 500000 },
      ]
    },
    {
      idOrder: 102,
      nameUser: 'Trần Thị B',
      address: '456 Đường XYZ, Quận 2, TP.HCM',
      phone: '0987654321',
      methodpayment: 'Banking',
      Status: 'Not Confirm',
      exportOrderPayment: 13000,
      orderDate: '2025-06-27T15:00:00',
      details: [
        { idProduct: 12, nameProduct: 'Coca', quantity: 1, price: 13000, totalPrice: 13000 },
      ]
    },
    {
        idOrder: 103,
        nameUser: 'Lê Văn C',
        address: '789 Đường LMN, Quận 3, TP.HCM',
        phone: '0912345678',
        methodpayment: 'Cash',
        Status: 'Completed',
        exportOrderPayment: 45000,
        orderDate: '2025-06-26T12:00:00',
        details: [
          { idProduct: 13, nameProduct: 'Hamburger', quantity: 1, price: 45000, totalPrice: 45000 },
        ]
      }
  ];

  useEffect(() => {
    // Giả lập việc fetch data
    setTimeout(() => {
      setOrders(mockOrders);
      setLoading(false);
    }, 1000);
  }, []);

  const handleViewDetail = (order) => {
    setSelectedOrder(order);
    setShowDetailModal(true);
  };

  const handleUpdateStatus = (order) => {
    setSelectedOrder(order);
    setShowStatusModal(true);
  };

  const saveStatus = () => {
    if (!selectedOrder) return;
    // Cập nhật trạng thái trong danh sách (giả lập)
    const updatedOrders = orders.map(o => 
      o.idOrder === selectedOrder.idOrder ? selectedOrder : o
    );
    setOrders(updatedOrders);
    setShowStatusModal(false);
    // Ở đây sẽ có thêm logic gọi API
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  if (loading) return <div className="orders-loading">Đang tải dữ liệu đơn hàng...</div>;

  return (
    <div className="orders-page">
      <div className="orders-page-header">
        <h1 className="orders-page-title">Quản lý Đơn hàng</h1>
      </div>

      {/* Bảng danh sách đơn hàng */}
      <div className="orders-table-container">
        <table className="orders-data-table">
          <thead>
            <tr>
              <th>ID Đơn hàng</th>
              <th>Tên khách hàng</th>
              <th>Ngày đặt</th>
              <th>Tổng tiền</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.idOrder}>
                <td>#{order.idOrder}</td>
                <td>{order.nameUser}</td>
                <td>{new Date(order.orderDate).toLocaleDateString('vi-VN')}</td>
                <td>{formatCurrency(order.exportOrderPayment)}</td>
                <td>
                  <span className={`orders-status-badge status-${order.Status.toLowerCase().replace(' ', '-')}`}>
                    {order.Status === 'Not Confirm' ? 'Chờ xác nhận' : 
                     order.Status === 'Confirmed' ? 'Đã xác nhận' : 
                     'Hoàn thành'}
                  </span>
                </td>
                <td>
                  <div className="orders-action-buttons">
                    <button 
                      className="orders-btn orders-btn-info" 
                      onClick={() => handleViewDetail(order)}>
                      Chi tiết
                    </button>
                    <button 
                      className="orders-btn orders-btn-warning" 
                      onClick={() => handleUpdateStatus(order)}>
                      Cập nhật
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Chi tiết đơn hàng */}
      {showDetailModal && selectedOrder && (
        <div className="orders-modal-overlay">
          <div className="orders-modal">
            <h2>Chi tiết Đơn hàng #{selectedOrder.idOrder}</h2>
            <div className="orders-detail-grid">
              <div><strong>Khách hàng:</strong> {selectedOrder.nameUser}</div>
              <div><strong>Điện thoại:</strong> {selectedOrder.phone}</div>
              <div><strong>Địa chỉ:</strong> {selectedOrder.address}</div>
              <div><strong>Thanh toán:</strong> {selectedOrder.methodpayment}</div>
            </div>
            <h4>Các sản phẩm đã đặt:</h4>
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
                {selectedOrder.details.map((item, index) => (
                  <tr key={index}>
                    <td>{item.nameProduct}</td>
                    <td>{item.quantity}</td>
                    <td>{formatCurrency(item.price)}</td>
                    <td>{formatCurrency(item.totalPrice)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="orders-form-actions">
              <button className="orders-btn orders-btn-secondary" onClick={() => setShowDetailModal(false)}>Đóng</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Cập nhật trạng thái */}
      {showStatusModal && selectedOrder && (
        <div className="orders-modal-overlay">
          <div className="orders-modal" style={{maxWidth: '500px'}}>
            <h2>Cập nhật Trạng thái Đơn hàng #{selectedOrder.idOrder}</h2>
            <div className="orders-form-group">
              <label className="orders-form-label">Trạng thái:</label>
              <select 
                className="orders-form-input"
                value={selectedOrder.Status}
                onChange={(e) => setSelectedOrder({...selectedOrder, Status: e.target.value})}
              >
                <option value="Not Confirm">Chờ xác nhận</option>
                <option value="Confirmed">Đã xác nhận</option>
                <option value="Completed">Hoàn thành</option>
                <option value="Cancelled">Đã hủy</option>
              </select>
            </div>
            <div className="orders-form-actions">
              <button className="orders-btn orders-btn-primary" onClick={saveStatus}>Lưu</button>
              <button className="orders-btn orders-btn-secondary" onClick={() => setShowStatusModal(false)}>Hủy</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
