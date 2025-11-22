const API_URL = "http://localhost/market_management/backend/api/brand/getBrand.php";
const API_URL_ADD = "http://localhost/market_management/backend/api/brand/addBrand.php";
const API_URL_DELETE = "http://localhost/market_management/backend/api/brand/deleteBrand.php";
const API_URL_UPDATE = "http://localhost/market_management/backend/api/brand/updateBrand.php";

export async function fetchBrand() {
    try {
        const res = await fetch('http://localhost/market_management/backend/api/brand/getBrand.php');
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
            return data.data;
        }
        return [];
    } catch (e) {
        return [];
    }
}

export async function addBrand(brandDTO) {
    // Kiểm tra dữ liệu đầu vào
    if (!brandDTO.nameBrand) {
        console.error("Dữ liệu không hợp lệ:", brandDTO);
        return { success: false, message: "Tên nhãn hàng không được để trống" };
    }

    // In ra dữ liệu trước khi gửi
    console.log("Dữ liệu gửi đi:", brandDTO);

    try {
        // Tạo FormData object
        const formData = new FormData();
        formData.append('nameBrand', brandDTO.nameBrand);
        
        // Nếu có file logo
        if (brandDTO.logoFile) {
            formData.append('logoBrand', brandDTO.logoFile);
        } else if (brandDTO.logoBrand) {
            // Nếu có URL logo
            formData.append('logoBrand', brandDTO.logoBrand);
        }
        // Nếu không có logo, không append gì cả - backend sẽ xử lý chuỗi rỗng

        // In ra dữ liệu FormData
        console.log("FormData gửi đi:", formData);

        const response = await fetch(API_URL_ADD, {
            method: "POST",
            body: formData
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
            return { success: true, message: "Thêm nhãn hàng thành công!", idBrand: data.data?.idBrand };
        } else {
            return { success: false, message: data.message || "Lỗi khi thêm nhãn hàng" };
        }
    } catch (error) {
        console.error("Lỗi khi thêm nhãn hàng:", error);
        return { success: false, message: "Lỗi khi thêm nhãn hàng: " + error.message };
    }
}

export async function deleteBrand(idBrand) {
    try {
        const response = await fetch(API_URL_DELETE + `?id=${idBrand}`, {
            method: "DELETE"
        });
        const data = await response.json();
        console.log("API response:", data);
        return data;
    } catch (error) {
        console.error("Lỗi khi gọi API:", error);
        return { success: false, message: "Lỗi khi xóa nhãn hàng: " + error.message };
    }
}

export async function updateBrand(brandDTO) {
    // Kiểm tra dữ liệu đầu vào
    if (!brandDTO.idBrand || !brandDTO.nameBrand) {
        console.error("Dữ liệu không hợp lệ:", brandDTO);
        return { success: false, message: "ID và tên nhãn hàng không được để trống" };
    }

    // In ra dữ liệu trước khi gửi
    console.log("Dữ liệu gửi đi:", brandDTO);

    try {
        // Tạo FormData object
        const formData = new FormData();
        formData.append('idBrand', brandDTO.idBrand);
        formData.append('nameBrand', brandDTO.nameBrand);
        
        // Nếu có file logo mới
        if (brandDTO.logoFile) {
            formData.append('logoBrand', brandDTO.logoFile);
        } else if (brandDTO.logoBrand) {
            // Nếu có URL logo
            formData.append('logoBrand', brandDTO.logoBrand);
        } else if (brandDTO.existingLogo) {
            // Giữ lại logo cũ
            formData.append('existing_logo', brandDTO.existingLogo);
        }
        // Nếu không có logo, không append gì cả - backend sẽ xử lý chuỗi rỗng

        // In ra dữ liệu FormData
        console.log("FormData gửi đi:", formData);

        const response = await fetch(API_URL_UPDATE, {
            method: "POST",
            body: formData
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
            return { success: true, message: "Cập nhật nhãn hàng thành công!" };
        } else {
            return { success: false, message: data.message || "Lỗi khi cập nhật nhãn hàng" };
        }
    } catch (error) {
        console.error("Lỗi khi cập nhật nhãn hàng:", error);
        return { success: false, message: "Lỗi khi cập nhật nhãn hàng: " + error.message };
    }
} 