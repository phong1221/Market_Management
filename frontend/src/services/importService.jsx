const API_URL = "http://localhost/market_management/backend/api/import/getImport.php";
const API_URL_ADD = "http://localhost/market_management/backend/api/import/addImport.php";
const API_URL_DELETE = "http://localhost/market_management/backend/api/import/deleteImport.php";
const API_URL_UPDATE = "http://localhost/market_management/backend/api/import/updateImport.php";

import Import from '../models/import';
import ImportDetail from '../models/importDetail';

export async function fetchImports() {
    try {
        const response = await fetch(API_URL);
        const data = await response.json();
        console.log("API response:", data);
        // Trả về dữ liệu thô để có thể hiển thị providerName và itemCount
        return data.data || [];
    } catch (error) {
        console.error("Lỗi khi gọi API:", error);
        return [];
    }
}

export async function fetchImportById(idImport) {
    try {
        const response = await fetch(`${API_URL}?idImport=${idImport}`);
        const data = await response.json();
        console.log("API response:", data);
        
        if (data.success && data.data) {
            // Trả về dữ liệu thô cho import header để có providerName
            const importHeader = data.data.import;

            // Tạo danh sách ImportDetail từ dữ liệu chi tiết
            const importDetails = (data.data.details || []).map(detail => new ImportDetail(
                detail.idImportDetail,
                detail.idImport,
                detail.idProduct,
                detail.quantity,
                detail.importPrice,
                detail.exportPrice,
                detail.totalPrice,
                detail.notes,
                detail.nameProduct
            ));

            return {
                import: importHeader,
                details: importDetails
            };
        } else {
            throw new Error(data.message || "Không tìm thấy import");
        }
    } catch (error) {
        console.error("Lỗi khi gọi API:", error);
        throw error;
    }
}

export async function addImport(importData) {
    // Kiểm tra dữ liệu đầu vào
    if (!importData.idProvider || !importData.items || importData.items.length === 0) {
        console.error("Dữ liệu không hợp lệ:", importData);
        return { success: false, message: "Dữ liệu không hợp lệ hoặc thiếu thông tin" };
    }

    // In ra dữ liệu trước khi gửi
    console.log("Dữ liệu gửi đi:", importData);

    try {
        // Tạo đối tượng dữ liệu để gửi
        const dataToSend = {
            idProvider: importData.idProvider,
            importDate: importData.importDate,
            items: importData.items.map(item => ({
                idProduct: item.idProduct,
                quantity: item.quantity,
                importPrice: item.importPrice,
                exportPrice: item.exportPrice,
                notes: item.notes || ''
            }))
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
            return { success: true, message: "Thêm import thành công!", idImport: data.idImport, totalAmount: data.totalAmount };
        } else {
            return { success: false, message: data.message || "Lỗi khi thêm import" };
        }
    } catch (error) {
        console.error("Lỗi khi thêm import:", error);
        return { success: false, message: "Lỗi khi thêm import: " + error.message };
    }
}

export async function updateImport(idImport, importData) {
    // Kiểm tra dữ liệu đầu vào
    if (!idImport || !importData.idProvider || !importData.items || importData.items.length === 0) {
        console.error("Dữ liệu không hợp lệ:", importData);
        return { success: false, message: "Dữ liệu không hợp lệ hoặc thiếu thông tin" };
    }

    // In ra dữ liệu trước khi gửi
    console.log("Dữ liệu gửi đi:", importData);

    try {
        // Tạo đối tượng dữ liệu để gửi
        const dataToSend = {
            idImport: idImport,
            idProvider: importData.idProvider,
            importDate: importData.importDate,
            items: importData.items.map(item => ({
                idProduct: item.idProduct,
                quantity: item.quantity,
                importPrice: item.importPrice,
                exportPrice: item.exportPrice,
                notes: item.notes || ''
            }))
        };

        // In ra dữ liệu JSON trước khi gửi
        console.log("JSON gửi đi:", JSON.stringify(dataToSend));

        const response = await fetch(API_URL_UPDATE, {
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
            return { success: true, message: "Cập nhật import thành công!", totalAmount: data.totalAmount };
        } else {
            return { success: false, message: data.message || "Lỗi khi cập nhật import" };
        }
    } catch (error) {
        console.error("Lỗi khi cập nhật import:", error);
        return { success: false, message: "Lỗi khi cập nhật import: " + error.message };
    }
}

export async function deleteImport(idImport) {
    try {
        const response = await fetch(API_URL_DELETE, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify({ idImport: idImport })
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
        return data;
    } catch (error) {
        console.error("Lỗi khi gọi API:", error);
        return { success: false, message: "Lỗi khi xóa import: " + error.message };
    }
}

// Utility functions
export function generateImportCode() {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `IMP${timestamp}${random}`;
}

export function formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(amount || 0);
}

export function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
} 