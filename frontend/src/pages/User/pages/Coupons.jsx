import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from '../../../hooks/useAuth.js';
import '../css/Coupons.css';

const Coupons = () => {
    const { user } = useAuth();
    const [coupons, setCoupons] = useState([]);
    const [loading, setLoading] = useState(true);

    // Load backend URL from environment or constant
    const API_BASE_URL = 'http://localhost/market_management/backend/api';

    const fetchCoupons = async () => {
        try {
            // Pass idUser to check if claimed
            const userIdParam = user ? `?idUser=${user.idUser}` : '';
            const response = await axios.get(`${API_BASE_URL}/coupon/getAll.php${userIdParam}`);
            if (response.data.success) {
                setCoupons(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching coupons:', error);
            toast.error('Không thể tải danh sách mã giảm giá');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCoupons();
    }, [user]);

    const handleClaim = async (code) => {
        if (!user) {
            toast.warn('Vui lòng đăng nhập để nhận mã!');
            return;
        }

        try {
            const response = await axios.post(`${API_BASE_URL}/coupon/claim.php`, {
                idUser: user.idUser,
                code: code
            });

            if (response.data.success) {
                toast.success('Nhận mã thành công!');
                fetchCoupons(); // Reload to update status
            } else {
                toast.error(response.data.message || 'Không thể nhận mã');
            }
        } catch (error) {
            console.error('Claim error:', error);
            const msg = error.response?.data?.message || 'Lỗi khi nhận mã';
            toast.error(msg);
        }
    };

    if (loading) return <div className="coupons-loading">Đang tải mã giảm giá...</div>;

    return (
        <div className="coupons-page-container">
            <h2 className="coupons-title">Mã Giảm Giá Của Tôi</h2>
            <div className="coupons-list">
                {coupons.length === 0 ? (
                    <p>Hiện chưa có mã giảm giá nào.</p>
                ) : (
                    coupons.map((coupon) => (
                        <div key={coupon.code} className={`coupon-card ${coupon.isClaimed ? 'claimed' : ''}`}>
                            <div className="coupon-left">
                                <div className="coupon-code">{coupon.code}</div>
                                <div className="coupon-desc">{coupon.description}</div>
                                <div className="coupon-expiry">HSD: {coupon.expiry_date}</div>
                            </div>
                            <div className="coupon-right">
                                {coupon.isClaimed ? (
                                    <button className="coupon-btn disabled" disabled>Đã nhận</button>
                                ) : (
                                    <button
                                        className="coupon-btn"
                                        onClick={() => handleClaim(coupon.code)}
                                    >
                                        Nhận
                                    </button>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Coupons;
