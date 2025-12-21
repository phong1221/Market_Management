
const API_URL = "http://localhost/market_management/backend/api/coupon/list.php";
const API_URL_ADD = "http://localhost/market_management/backend/api/coupon/create.php";
const API_URL_DELETE = "http://localhost/market_management/backend/api/coupon/delete.php";
const API_URL_UPDATE = "http://localhost/market_management/backend/api/coupon/update.php";
const API_URL_HIDE = "http://localhost/market_management/backend/api/coupon/hide.php";

export async function fetchCoupons() {
    try {
        const response = await fetch(API_URL);
        const data = await response.json();

        if (data.success) {
            return data.data || [];
        } else {
            console.error("Error fetching coupons:", data.message);
            return [];
        }
    } catch (error) {
        console.error("Lỗi khi gọi API coupon:", error);
        return [];
    }
}

export async function addCoupon(couponDTO) {
    if (
        !couponDTO.code ||
        !couponDTO.description ||
        !couponDTO.discount_type ||
        !couponDTO.discount_value ||
        !couponDTO.expiry_date ||
        !couponDTO.quantity
    ) {
        return { success: false, message: "Thiếu thông tin bắt buộc" };
    }

    try {
        const response = await fetch(API_URL_ADD, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify(couponDTO)
        });

        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Lỗi khi thêm coupon:", error);
        return { success: false, message: "Lỗi kết nối: " + error.message };
    }
}

export async function deleteCoupon(code) {
    try {
        const response = await fetch(API_URL_DELETE + `?code=${code}`, {
            method: "DELETE"
        });
        const data = await response.json();
        return data.success;
    } catch (error) {
        console.error("Lỗi khi xóa coupon:", error);
        return false;
    }
}

export async function updateCoupon(couponDTO) {
    if (!couponDTO.code) {
        return { success: false, message: "Thiếu mã coupon" };
    }

    try {
        const response = await fetch(API_URL_UPDATE, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify(couponDTO)
        });

        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Lỗi khi cập nhật coupon:", error);
        return { success: false, message: "Lỗi kết nối: " + error.message };
    }
}

export async function hideCoupon(code) {
    try {
        const response = await fetch(API_URL_HIDE, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify({ code: code })
        });

        const data = await response.json();
        return { success: data.success, message: data.message, newStatus: data.newStatus };
    } catch (error) {
        console.error("Lỗi khi ẩn/hiện coupon:", error);
        return { success: false, message: "Lỗi kết nối: " + error.message };
    }
}
