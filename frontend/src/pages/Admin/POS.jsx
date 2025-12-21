import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import './css/POS.css';

const POS = () => {
    // State
    const [products, setProducts] = useState([]);
    const [users, setUsers] = useState([]);
    const [cart, setCart] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUser, setSelectedUser] = useState(null); // { idUser, nameUser, phone, address }
    const [paymentMethod, setPaymentMethod] = useState('cash'); // 'cash' | 'bank'
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);

    // API URLs
    const API_BASE = 'http://localhost/market_management/backend/api';

    // 1. Fetch Data
    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            const [prodRes, userRes] = await Promise.all([
                axios.get(`${API_BASE}/product/getProduct.php`),
                axios.get(`${API_BASE}/user/getUsersSimple.php`)
            ]);

            if (prodRes.data && (prodRes.data.data || Array.isArray(prodRes.data))) {
                setProducts(prodRes.data.data || prodRes.data);
            }

            if (userRes.data && userRes.data.success) {
                setUsers(userRes.data.data);
            }
        } catch (error) {
            console.error("Error fetching POS data", error);
            toast.error("Lỗi tải dữ liệu sản phẩm hoặc khách hàng");
        } finally {
            setLoading(false);
        }
    };

    // 2. Cart Logic
    const addToCart = (product) => {
        setCart(prev => {
            const exist = prev.find(item => item.idProduct === product.idProduct);
            if (exist) {
                return prev.map(item =>
                    item.idProduct === product.idProduct
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            } else {
                // IMPORTANT: Map correct fields from DB to Cart Item
                return [...prev, {
                    ...product,
                    quantity: 1,
                    // Ensure we save the price explicitly to avoid property name confusion
                    price: Number(product.exportCost || 0)
                }];
            }
        });
        toast.success(`Đã thêm ${product.nameProduct}`, { autoClose: 500 });
    };

    const updateQuantity = (idProduct, delta) => {
        setCart(prev => prev.map(item => {
            if (item.idProduct === idProduct) {
                const newQty = Math.max(1, item.quantity + delta);
                return { ...item, quantity: newQty };
            }
            return item;
        }));
    };

    const removeFromCart = (idProduct) => {
        setCart(prev => prev.filter(item => item.idProduct !== idProduct));
    };

    const calculateTotal = () => {
        return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    };

    // 3. Checkout Logic
    const handleCheckout = async () => {
        if (cart.length === 0) {
            toast.warn("Giỏ hàng trống!");
            return;
        }
        if (!selectedUser) {
            toast.warn("Vui lòng chọn khách hàng!");
            return;
        }

        setProcessing(true);
        try {
            const totalAmount = calculateTotal();

            // Normalize cart for backend
            const standardizedCart = cart.map(item => ({
                idProduct: item.idProduct,
                quantity: item.quantity,
                price: item.price
            }));

            const payload = {
                idUser: selectedUser.idUser,
                name: selectedUser.nameUser,
                address: selectedUser.address,
                phone: selectedUser.phone,
                payment: paymentMethod,
                totalAmount: totalAmount,
                cart: standardizedCart,
                couponCode: null,
                discountAmount: 0
            };

            const res = await axios.post(`${API_BASE}/vnpay/create_order.php`, payload);

            if (res.data.status === 'success') {
                toast.success(`Tạo đơn thành công! #${res.data.idOrder}`);
                setCart([]);
                setSelectedUser(null);
            } else {
                toast.error(res.data.message || "Lỗi tạo đơn hàng");
            }

        } catch (error) {
            console.error("Checkout error", error);
            toast.error("Lỗi kết nối server");
        } finally {
            setProcessing(false);
        }
    };

    // 4. Filtering
    const filteredProducts = products.filter(p =>
        p.nameProduct.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.idProduct && p.idProduct.toString().includes(searchTerm))
    );

    if (loading) return <div className="pos-loading">Đang tải dữ liệu...</div>;

    return (
        <div className="pos-container">
            {/* LEFT SIDE: PRODUCTS */}
            <div className="pos-left">
                <div className="pos-header">
                    <h2>Bán Hàng Tại Quầy</h2>
                    <input
                        className="pos-search"
                        placeholder="Tìm kiếm sản phẩm..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="pos-grid">
                    {filteredProducts.map(prod => (
                        <div key={prod.idProduct} className="pos-product-card" onClick={() => addToCart(prod)}>
                            <div className="pos-prod-img-wrapper">
                                {/* Use prod.picture instead of prod.Image */}
                                <img
                                    src={`http://localhost/market_management/backend/uploads/${prod.picture}`}
                                    alt={prod.nameProduct}
                                    onError={e => e.target.src = 'data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22150%22%20height%3D%22150%22%20viewBox%3D%220%200%20150%20150%22%3E%3Crect%20fill%3D%22%23ddd%22%20width%3D%22150%22%20height%3D%22150%22%2F%3E%3Ctext%20fill%3D%22rgba(0,0,0,0.5)%22%20font-family%3D%22sans-serif%22%20font-size%3D%2230%22%20dy%3D%2210.5%22%20font-weight%3D%22bold%22%20x%3D%2250%25%22%20y%3D%2250%25%22%20text-anchor%3D%22middle%22%3Eimg%3C%2Ftext%3E%3C%2Fsvg%3E'}
                                />
                            </div>
                            <div className="pos-prod-info">
                                <div className="pos-prod-name">{prod.nameProduct}</div>
                                {/* Use prod.exportCost instead of prod.Price */}
                                <div className="pos-prod-price">{Number(prod.exportCost).toLocaleString('vi-VN')} đ</div>
                                {/* Use prod.amountProduct instead of prod.Quality */}
                                <div className="pos-prod-stock">Kho: {prod.amountProduct}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* RIGHT SIDE: CART & CHECKOUT */}
            <div className="pos-right">
                <div className="pos-user-select">
                    <label>Khách hàng:</label>
                    <select
                        value={selectedUser ? selectedUser.idUser : ''}
                        onChange={e => {
                            const uid = e.target.value;
                            const u = users.find(User => User.idUser == uid);
                            setSelectedUser(u || null);
                        }}
                        className="pos-select"
                    >
                        <option value="">-- Chọn khách hàng --</option>
                        {users.map(u => (
                            <option key={u.idUser} value={u.idUser}>{u.nameUser} - {u.phone}</option>
                        ))}
                    </select>
                    {selectedUser && (
                        <div className="pos-user-info">
                            <small>{selectedUser.address}</small>
                        </div>
                    )}
                </div>

                <div className="pos-cart-list">
                    {cart.length === 0 ? (
                        <div className="pos-empty-cart">Giỏ hàng trống</div>
                    ) : (
                        cart.map(item => (
                            <div key={item.idProduct} className="pos-cart-item">
                                <div className="pos-cart-name">
                                    {item.nameProduct}
                                    <br />
                                    {/* Use item.price which we normalized in addToCart */}
                                    <small>{Number(item.price).toLocaleString('vi-VN')}</small>
                                </div>
                                <div className="pos-cart-qty">
                                    <button onClick={() => updateQuantity(item.idProduct, -1)}>-</button>
                                    <span>{item.quantity}</span>
                                    <button onClick={() => updateQuantity(item.idProduct, 1)}>+</button>
                                </div>
                                <div className="pos-cart-total">
                                    {(item.quantity * Number(item.price)).toLocaleString('vi-VN')}
                                    <button className="pos-remove-btn" onClick={() => removeFromCart(item.idProduct)}>×</button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="pos-footer">
                    <div className="pos-total-row">
                        <span>Tổng tiền:</span>
                        <span className="pos-total-amount">{calculateTotal().toLocaleString('vi-VN')} đ</span>
                    </div>

                    <div className="pos-payment-methods">
                        <label>
                            <input
                                type="radio"
                                name="payment"
                                value="cash"
                                checked={paymentMethod === 'cash'}
                                onChange={() => setPaymentMethod('cash')}
                            /> Tiền mặt
                        </label>
                        <label>
                            <input
                                type="radio"
                                name="payment"
                                value="bank"
                                checked={paymentMethod === 'bank'}
                                onChange={() => setPaymentMethod('bank')}
                            /> Chuyển khoản
                        </label>
                    </div>

                    <button
                        className="pos-checkout-btn"
                        onClick={handleCheckout}
                        disabled={processing}
                    >
                        {processing ? 'Đang xử lý...' : 'Thanh Toán'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default POS;
