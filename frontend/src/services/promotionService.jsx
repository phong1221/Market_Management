import Promotion from '../models/promotion';

const API_URL = "http://localhost/market_management/backend/api/promotion/getPromotion.php";
const API_URL_ADD = "http://localhost/market_management/backend/api/promotion/addPromotion.php";
const API_URL_DELETE = "http://localhost/market_management/backend/api/promotion/deletePromotion.php";
const API_URL_UPDATE = "http://localhost/market_management/backend/api/promotion/updatePromotion.php";
const API_URL_HIDE = "http://localhost/market_management/backend/api/promotion/hidePromotion.php";

export async function fetchPromotion() {
    try {
        const response = await fetch(API_URL);
        const data = await response.json();
        console.log("API response:", data);
        return (data.data || []).map(item => new Promotion(
            item.idPromotion,
            item.namePromotion,
            item.descriptionPromotion,
            item.discountPromotion,
            item.startDay,
            item.endDay,
            item.status
        ));
    } catch (error) {
        console.error("Lỗi khi gọi API:", error);
        return [];
    }
}

export async function addPromotion(promotionDTO) {
    // Kiểm tra dữ liệu đầu vào dựa trên class Promotion
    if (
        !promotionDTO.namePromotion ||
        !promotionDTO.descriptionPromotion ||
        !promotionDTO.discountPromotion ||
        !promotionDTO.startDay ||
        !promotionDTO.endDay
    ) {
        console.error("Dữ liệu không hợp lệ:", promotionDTO);
        return { success: false, message: "Dữ liệu không hợp lệ hoặc thiếu thông tin" };
    }

    // In ra dữ liệu trước khi gửi
    console.log("Dữ liệu gửi đi:", promotionDTO);

    try {
        // Tạo đối tượng dữ liệu để gửi
        const dataToSend = {
            namePromotion: promotionDTO.namePromotion,
            descriptionPromotion: promotionDTO.descriptionPromotion,
            discountPromotion: promotionDTO.discountPromotion,
            startDay: promotionDTO.startDay,
            endDay: promotionDTO.endDay
        };

        // In ra dữ liệu JSON trước khi gửi
        console.log("JSON gửi đi:", JSON.stringify(dataToSend));

        const response = await fetch(API_URL_ADD, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify(dataToSend)
        });

        // Thử parse phản hồi về JSON, nếu lỗi sẽ bắt ở catch
        const text = await response.text();
        let data;
        try {
            data = JSON.parse(text);
        } catch (err) {
            console.error("Phản hồi không phải JSON:", text);
            return { success: false, message: "Phản hồi server không phải JSON hợp lệ" };
        }

        console.log("Phản hồi từ server:", data);

        // Xử lý kết quả từ API
        if (data.success) {
            return { success: true, message: "Thêm khuyến mãi thành công!", idPromotion: data.idPromotion };
        } else {
            return { success: false, message: data.message || "Lỗi khi thêm khuyến mãi" };
        }
    } catch (error) {
        console.error("Lỗi khi thêm khuyến mãi:", error);
        return { success: false, message: "Lỗi khi thêm khuyến mãi: " + error.message };
    }
}

export async function deletePromotion(idPromotion) {
    try {
        const response = await fetch(API_URL_DELETE + `?idPromotion=${idPromotion}`, {
            method: "DELETE"
        });
        const data = await response.json();
        console.log("API response:", data);
        return data.success;
    } catch (error) {
        console.error("Lỗi khi gọi API:", error);
        return false;
    }
}

export async function updatePromotion(promotionDTO) {
    // Kiểm tra dữ liệu đầu vào dựa trên class Promotion
    if (
        !promotionDTO.idPromotion ||
        !promotionDTO.namePromotion ||
        !promotionDTO.descriptionPromotion ||
        !promotionDTO.discountPromotion ||
        !promotionDTO.startDay ||
        !promotionDTO.endDay
    ) {
        console.error("Dữ liệu không hợp lệ:", promotionDTO);
        return { success: false, message: "Dữ liệu không hợp lệ hoặc thiếu thông tin" };
    }

    // In ra dữ liệu trước khi gửi
    console.log("Dữ liệu gửi đi:", promotionDTO);

    try {
        // Tạo đối tượng dữ liệu để gửi
        const dataToSend = {
            idPromotion: promotionDTO.idPromotion,
            namePromotion: promotionDTO.namePromotion,
            descriptionPromotion: promotionDTO.descriptionPromotion,
            discountPromotion: promotionDTO.discountPromotion,
            startDay: promotionDTO.startDay,
            endDay: promotionDTO.endDay
        };

        // In ra dữ liệu JSON trước khi gửi
        console.log("JSON gửi đi:", JSON.stringify(dataToSend));

        const response = await fetch(API_URL_UPDATE, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify(dataToSend)
        });

        // Thử parse phản hồi về JSON, nếu lỗi sẽ bắt ở catch
        const text = await response.text();
        let data;
        try {
            data = JSON.parse(text);
        } catch (err) {
            console.error("Phản hồi không phải JSON:", text);
            return { success: false, message: "Phản hồi server không phải JSON hợp lệ" };
        }

        console.log("Phản hồi từ server:", data);

        // Xử lý kết quả từ API
        if (data.success) {
            return { success: true, message: "Cập nhật khuyến mãi thành công!" };
        } else {
            return { success: false, message: data.message || "Lỗi khi cập nhật khuyến mãi" };
        }
    } catch (error) {
        console.error("Lỗi khi cập nhật khuyến mãi:", error);
        return { success: false, message: "Lỗi khi cập nhật khuyến mãi: " + error.message };
    }
}

export async function hidePromotion(idPromotion) {
    try {
        const response = await fetch(API_URL_HIDE, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify({ idPromotion: idPromotion })
        });

        const text = await response.text();
        let data;
        try {
            data = JSON.parse(text);
        } catch (err) {
            console.error("Phản hồi không phải JSON:", text);
            return { success: false, message: "Phản hồi server không phải JSON hợp lệ" };
        }

        console.log("API response:", data);
        return { success: data.success, message: data.message, newStatus: data.newStatus };
    } catch (error) {
        console.error("Lỗi khi gọi API:", error);
        return { success: false, message: "Lỗi khi thay đổi trạng thái khuyến mãi: " + error.message };
    }
}
