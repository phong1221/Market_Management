const API_URL = "http://localhost/market_management/backend/api/product/getProduct.php";
const API_URL_ADD = "http://localhost/market_management/backend/api/product/addProduct.php";
const API_URL_DELETE = "http://localhost/market_management/backend/api/product/deleteProduct.php";
const API_URL_UPDATE = "http://localhost/market_management/backend/api/product/updateProduct.php";
import Product from '../models/product';

export async function fetchProduct() {
    try {
        const response = await fetch(API_URL);
        const data = await response.json();
        console.log("API response:", data);
        return (data.data || []).map(item => new Product(
            item.idProduct,
            item.nameProduct,
            item.picture,
            item.descriptionProduct,
            item.idProvider,
            item.amountProduct,
            item.idType,
            item.importCost,
            item.exportCost,
            item.idPromotion,
            item.idBrand
        ));
    } catch (error) {
        console.error("Lỗi khi gọi API:", error);
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
