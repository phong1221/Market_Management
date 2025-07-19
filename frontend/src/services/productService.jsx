const API_URL = "http://localhost/market_management/backend/api/product/getProduct.php";
const API_URL_ADD = "http://localhost/market_management/backend/api/product/addProduct.php";
const API_URL_DELETE = "http://localhost/market_management/backend/api/product/deleteProduct.php";
const API_URL_UPDATE = "http://localhost/market_management/backend/api/product/updateProduct.php";
import Product from '../models/product';

export async function fetchProduct() {
    try {
        console.log('=== FETCH PRODUCT DEBUG ===');
        console.log('Calling API URL:', API_URL);
        
        const response = await fetch(API_URL);
        console.log('Response status:', response.status);
        console.log('Response ok:', response.ok);
        
        const data = await response.json();
        console.log("API response:", data);
        console.log("API response.success:", data.success);
        console.log("API response.data:", data.data);
        console.log("API response.data length:", data.data ? data.data.length : 'no data');
        
        // Trả về dữ liệu gốc từ API thay vì tạo object Product
        const result = data.data || [];
        console.log("Returning result:", result);
        return result;
    } catch (error) {
        console.error("Lỗi khi gọi API:", error);
        console.error("Error details:", error.message);
        return [];
    }
}

export async function addProduct(formData) {
    try {
        const response = await fetch(API_URL_ADD, {
            method: "POST",
            body: formData // Send FormData directly
        });

        const result = await response.json();
        console.log("Server response on add:", result);
        return result;
    } catch (error) {
        console.error("Lỗi khi thêm sản phẩm:", error);
        return { success: false, message: "Lỗi khi thêm sản phẩm: " + error.message };
    }
}

export async function deleteProduct(idProduct) {
    try {
        const response = await fetch(API_URL_DELETE + `?idProduct=${idProduct}`, {
            method: "DELETE"
        });
        const data = await response.json();
        console.log("API response:", data);
        
        if (data.success) {
            return { success: true, message: data.message || "Xóa sản phẩm thành công!" };
        } else {
            return { success: false, message: data.message || "Lỗi khi xóa sản phẩm" };
        }
    } catch (error) {
        console.error("Lỗi khi gọi API:", error);
        return { success: false, message: "Lỗi khi xóa sản phẩm: " + error.message };
    }
}

export async function updateProduct(formData) {
    try {
        const response = await fetch(API_URL_UPDATE, {
            method: "POST", // Use POST for FormData with file uploads
            body: formData // Send FormData directly
        });
        
        const result = await response.json();
        console.log("Server response on update:", result);
        return result;
    } catch (error) {
        console.error("Lỗi khi cập nhật sản phẩm:", error);
        return { success: false, message: "Lỗi khi cập nhật sản phẩm: " + error.message };
    }
}
