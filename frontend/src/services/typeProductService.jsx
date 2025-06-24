import TypeProduct from '../models/typeProduct';

const API_URL = "http://localhost/market_management/backend/api/typeProduct/getTypeProduct.php";
const API_URL_ADD = "http://localhost/market_management/backend/api/typeProduct/addTypeProduct.php";
const API_URL_DELETE = "http://localhost/market_management/backend/api/typeProduct/deleteTypeProduct.php";
const API_URL_UPDATE = "http://localhost/market_management/backend/api/typeProduct/updateTypeProduct.php";

export async function fetchTypeProducts() {
    try {
        const response = await fetch(API_URL);
        const data = await response.json();
        if (data.success && Array.isArray(data.data)) {
            return data.data.map(item => new TypeProduct(
                item.idType,
                item.nameType,
                item.descriptionType,
                item.inventory,
                item.typeSell
            ));
        }
        console.error("API response format is not as expected:", data);
        return [];
    } catch (error) {
        console.error("Lỗi khi gọi API:", error);
        return [];
    }
}

export async function addTypeProduct(typeProductDTO) {
    if (
        !typeProductDTO.nameType ||
        !typeProductDTO.descriptionType ||
        typeProductDTO.inventory === undefined ||
        !typeProductDTO.typeSell
    ) {
        console.error("Dữ liệu không hợp lệ:", typeProductDTO);
        return { success: false, message: "Dữ liệu không hợp lệ hoặc thiếu thông tin" };
    }

    try {
        const dataToSend = {
            nameType: typeProductDTO.nameType,
            descriptionType: typeProductDTO.descriptionType,
            inventory: typeProductDTO.inventory,
            typeSell: typeProductDTO.typeSell
        };

        const response = await fetch(API_URL_ADD, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify(dataToSend)
        });

        const result = await response.json();
        return result;

    } catch (error) {
        console.error("Lỗi khi thêm loại sản phẩm:", error);
        return { success: false, message: "Lỗi khi thêm loại sản phẩm: " + error.message };
    }
}

export async function updateTypeProduct(typeProductDTO) {
    if (
        !typeProductDTO.idType ||
        !typeProductDTO.nameType ||
        !typeProductDTO.descriptionType ||
        typeProductDTO.inventory === undefined ||
        !typeProductDTO.typeSell
    ) {
        console.error("Dữ liệu không hợp lệ:", typeProductDTO);
        return { success: false, message: "Dữ liệu không hợp lệ hoặc thiếu thông tin" };
    }

    try {
        const dataToSend = {
            idType: typeProductDTO.idType,
            nameType: typeProductDTO.nameType,
            descriptionType: typeProductDTO.descriptionType,
            inventory: typeProductDTO.inventory,
            typeSell: typeProductDTO.typeSell
        };

        const response = await fetch(API_URL_UPDATE, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify(dataToSend)
        });
        
        const result = await response.json();
        return result;

    } catch (error) {
        console.error("Lỗi khi cập nhật loại sản phẩm:", error);
        return { success: false, message: "Lỗi khi cập nhật loại sản phẩm: " + error.message };
    }
}

export async function deleteTypeProduct(idType) {
    try {
        const response = await fetch(API_URL_DELETE, {
            method: "POST",
             headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify({ idType: idType })
        });
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Lỗi khi gọi API:", error);
        return { success: false, message: "Lỗi khi xóa loại sản phẩm: " + error.message };
    }
}