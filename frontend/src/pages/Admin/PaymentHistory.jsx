import React, { useState, useEffect } from 'react';
import { fetchPaymentHistory } from '../../services/paymentService';
import { fetchOrderById } from '../../services/orderService'; // Reuse to get order details
import '../../css/admin-search.css'; // Standardized search styles
import '../../css/notification.css';
// Reuse order styles or create new one? reusing table styles usually defined in index or user.css/order.css
import '../../css/order.css';

const PaymentHistory = () => {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedPayment, setSelectedPayment] = useState(null);
    const [orderDetail, setOrderDetail] = useState(null); // Stores products of selected order
    const [showDetail, setShowDetail] = useState(false);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 10;

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        const data = await fetchPaymentHistory();
        setPayments(data);
        setLoading(false);
    };

    const handleViewDetail = async (payment) => {
        setSelectedPayment(payment);
        setShowDetail(true);
        setOrderDetail(null); // Reset prev detail

        try {
            // Fetch full order details including products
            const fullOrder = await fetchOrderById(payment.idOrder);
            setOrderDetail(fullOrder);
        } catch (error) {
            console.error("Error loading order detail", error);
        }
    };

    const closeDetail = () => {
        setShowDetail(false);
        setSelectedPayment(null);
        setOrderDetail(null);
    };

    // Filter
    const filteredPayments = payments.filter(item =>
        item.idOrder.toString().includes(searchTerm) ||
        (item.customerName && item.customerName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.vnp_TransactionNo && item.vnp_TransactionNo.includes(searchTerm))
    );

    // Pagination Logic
    const totalPages = Math.ceil(filteredPayments.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const currentItems = filteredPayments.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    const handlePageChange = (page) => setCurrentPage(page);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    return (
        <div className="admin-page-container" style={{ padding: '20px' }}>
            <h2 className="admin-page-title" style={{ marginBottom: '20px', color: '#181c32' }}>Lịch sử thanh toán</h2>

            {/* Stadardized Search Bar */}
            <div className="admin-search-container">
                <input
                    type="text"
                    className="admin-search-input"
                    placeholder="Tìm kiếm theo Mã đơn, Tên khách, Mã giao dịch..."
                    value={searchTerm}
                    onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                />
            </div>

            {/* Table */}
            <div className="table-container" style={{ background: 'white', padding: '15px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                {loading ? <p>Đang tải...</p> : (
                    <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: '#009ef7', color: 'white', borderBottom: '2px solid #eff2f5' }}>
                                <th style={{ padding: '12px', textAlign: 'left' }}>Mã Đơn</th>
                                <th style={{ padding: '12px', textAlign: 'left' }}>Khách hàng</th>
                                <th style={{ padding: '12px', textAlign: 'left' }}>Ngày thanh toán</th>
                                <th style={{ padding: '12px', textAlign: 'left' }}>Phương thức</th>
                                <th style={{ padding: '12px', textAlign: 'left' }}>Số tiền</th>
                                <th style={{ padding: '12px', textAlign: 'left' }}>Trạng thái</th>
                                <th style={{ padding: '12px', textAlign: 'center' }}>Chi tiết</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentItems.length > 0 ? currentItems.map(item => (
                                <tr key={item.idOrder} style={{ borderBottom: '1px solid #eee' }}>
                                    <td style={{ padding: '12px' }}>#{item.idOrder}</td>
                                    <td style={{ padding: '12px' }}>{item.customerName}</td>
                                    <td style={{ padding: '12px' }}>{item.paymentDateFormatted}</td>
                                    <td style={{ padding: '12px' }}>
                                        {item.methodpayment === 'Banking' ? (
                                            <span style={{ color: '#009ef7', fontWeight: '500' }}>VNPAY/Banking</span>
                                        ) : (
                                            <span style={{ color: '#38a169', fontWeight: '500' }}>Tiền mặt</span>
                                        )}
                                        {item.vnp_TransactionNo && <div style={{ fontSize: '0.8rem', color: '#718096' }}>Txn: {item.vnp_TransactionNo}</div>}
                                    </td>
                                    <td style={{ padding: '12px', fontWeight: 'bold' }}>{formatCurrency(item.totalAmount)}</td>
                                    <td style={{ padding: '12px' }}>
                                        <span className={`status-badge status-${item.orderStatus.toLowerCase()}`}
                                            style={{ padding: '4px 8px', borderRadius: '12px', fontSize: '0.85rem', background: '#def7ec', color: '#03543f' }}>
                                            {item.orderStatus}
                                        </span>
                                    </td>
                                    <td style={{ padding: '12px', textAlign: 'center' }}>
                                        <button
                                            onClick={() => handleViewDetail(item)}
                                            style={{
                                                background: '#009ef7', color: 'white', border: 'none',
                                                width: '32px', height: '32px', borderRadius: '6px', cursor: 'pointer'
                                            }}
                                            title="Xem chi tiết"
                                        >
                                            👁️
                                        </button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="7" style={{ padding: '20px', textAlign: 'center', color: '#718096' }}>Không tìm thấy dữ liệu</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Pagination (Simple inline implementation for speed) */}
            {totalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px', gap: '5px' }}>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                        <button
                            key={page}
                            onClick={() => handlePageChange(page)}
                            style={{
                                padding: '8px 12px',
                                border: '1px solid #e2e8f0',
                                background: currentPage === page ? '#009ef7' : 'white',
                                color: currentPage === page ? 'white' : '#2d3748',
                                borderRadius: '6px',
                                cursor: 'pointer'
                            }}
                        >
                            {page}
                        </button>
                    ))}
                </div>
            )}

            {/* Detail Modal */}
            {showDetail && selectedPayment && (
                <div className="modal-overlay" style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
                }}>
                    <div className="modal-content" style={{
                        background: 'white', padding: '24px', borderRadius: '12px', width: '90%', maxWidth: '600px',
                        maxHeight: '90vh', overflowY: 'auto'
                    }}>
                        <h3 style={{ marginTop: 0, borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
                            Chi tiết hóa đơn #{selectedPayment.idOrder}
                        </h3>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
                            <div><strong>Khách hàng:</strong> {selectedPayment.customerName}</div>
                            <div><strong>Ngày tạo:</strong> {selectedPayment.orderDate}</div>
                            <div><strong>Trạng thái:</strong> {selectedPayment.orderStatus}</div>
                            <div><strong>Tổng tiền:</strong> <span style={{ color: '#c53030', fontWeight: 'bold' }}>{formatCurrency(selectedPayment.totalAmount)}</span></div>
                            <div><strong>Hình thức:</strong> {selectedPayment.methodpayment}</div>
                            {selectedPayment.vnp_TransactionNo && (
                                <>
                                    <div><strong>Mã giao dịch:</strong> {selectedPayment.vnp_TransactionNo}</div>
                                    <div><strong>Ngân hàng:</strong> {selectedPayment.vnp_BankCode}</div>
                                </>
                            )}
                        </div>

                        <h4 style={{ marginBottom: '10px', color: '#009ef7' }}>Sản phẩm</h4>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                            <thead>
                                <tr style={{ background: '#f7fafc', borderBottom: '1px solid #edf2f7' }}>
                                    <th style={{ padding: '8px', textAlign: 'left' }}>Tên SP</th>
                                    <th style={{ padding: '8px', textAlign: 'center' }}>SL</th>
                                    <th style={{ padding: '8px', textAlign: 'right' }}>Đơn giá</th>
                                    <th style={{ padding: '8px', textAlign: 'right' }}>Thành tiền</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orderDetail && orderDetail.products ? orderDetail.products.map((prod, idx) => (
                                    <tr key={idx} style={{ borderBottom: '1px solid #edf2f7' }}>
                                        <td style={{ padding: '8px' }}>{prod.nameProduct}</td>
                                        <td style={{ padding: '8px', textAlign: 'center' }}>{prod.quantity}</td>
                                        <td style={{ padding: '8px', textAlign: 'right' }}>{formatCurrency(prod.unitPrice)}</td>
                                        <td style={{ padding: '8px', textAlign: 'right' }}>{formatCurrency(prod.totalPrice)}</td>
                                    </tr>
                                )) : (
                                    <tr><td colSpan="4" style={{ textAlign: 'center', padding: '10px' }}>Đang tải chi tiết...</td></tr>
                                )}
                            </tbody>
                        </table>

                        <div style={{ marginTop: '20px', textAlign: 'right' }}>
                            <button
                                onClick={closeDetail}
                                style={{
                                    padding: '8px 20px', background: '#718096', color: 'white',
                                    border: 'none', borderRadius: '6px', cursor: 'pointer'
                                }}
                            >
                                Đóng
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PaymentHistory;
