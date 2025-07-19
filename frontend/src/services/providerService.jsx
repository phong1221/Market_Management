import Provider from '../models/provider';

const API_URL = "http://localhost/market_management/backend/api/provider/getProvider.php";
const API_URL_ADD = "http://localhost/market_management/backend/api/provider/addProvider.php";
const API_URL_DELETE = "http://localhost/market_management/backend/api/provider/deleteProvider.php";
const API_URL_UPDATE = "http://localhost/market_management/backend/api/provider/updateProvider.php";

export async function fetchProvider() {
    try {
        const response = await fetch(API_URL);
        const data = await response.json();
        console.log("API response:", data);
        console.log("Raw data from API:", data.data);
        
        if (data.data && data.data.length > 0) {
            console.log("First provider data:", data.data[0]);
        }
        
        return (data.data || []).map(item => {
            console.log("Mapping provider item:", item);
            return new Provider(
                item.idProvider,
                item.nameProvider,
                item.addressProvider,
                item.phoneProvider,
                item.emailProvider,
                item.idType,
                item.nameType
            );
        });
    } catch (error) {
        console.error("Lỗi khi gọi API:", error);
        return [];
    }
}

export async function addProvider(providerDTO) {
    // Kiểm tra dữ liệu đầu vào dựa trên class Provider
    if (
        !providerDTO.nameProvider ||
        !providerDTO.addressProvider ||
        !providerDTO.phoneProvider ||
        !providerDTO.emailProvider ||
        !providerDTO.idType
    ) {
        console.error("Dữ liệu không hợp lệ:", providerDTO);
        return { success: false, message: "Dữ liệu không hợp lệ hoặc thiếu thông tin" };
    }

    // In ra dữ liệu trước khi gửi
    console.log("Dữ liệu gửi đi:", providerDTO);

    try {
        // Tạo đối tượng dữ liệu để gửi
        const dataToSend = {
            nameProvider: providerDTO.nameProvider,
            addressProvider: providerDTO.addressProvider,
            phoneProvider: providerDTO.phoneProvider,
            emailProvider: providerDTO.emailProvider,
            idType: parseInt(providerDTO.idType) || 1
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
            return { success: true, message: "Thêm nhà cung cấp thành công!", idProvider: data.idProvider };
        } else {
            return { success: false, message: data.message || "Lỗi khi thêm nhà cung cấp" };
        }
    } catch (error) {
        console.error("Lỗi khi thêm nhà cung cấp:", error);
        return { success: false, message: "Lỗi khi thêm nhà cung cấp: " + error.message };
    }
}

export async function deleteProvider(idProvider) {
    try {
        const response = await fetch(API_URL_DELETE + `?idProvider=${idProvider}`, {
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

export async function updateProvider(providerDTO) {
    // Kiểm tra dữ liệu đầu vào dựa trên class Provider
    if (
        !providerDTO.idProvider ||
        !providerDTO.nameProvider ||
        !providerDTO.addressProvider ||
        !providerDTO.phoneProvider ||
        !providerDTO.emailProvider ||
        !providerDTO.idType
    ) {
        console.error("Dữ liệu không hợp lệ:", providerDTO);
        return { success: false, message: "Dữ liệu không hợp lệ hoặc thiếu thông tin" };
    }

    // In ra dữ liệu trước khi gửi
    console.log("Dữ liệu gửi đi:", providerDTO);

    try {
        // Tạo đối tượng dữ liệu để gửi
        const dataToSend = {
            idProvider: providerDTO.idProvider,
            nameProvider: providerDTO.nameProvider,
            addressProvider: providerDTO.addressProvider,
            phoneProvider: providerDTO.phoneProvider,
            emailProvider: providerDTO.emailProvider,
            idType: parseInt(providerDTO.idType) || 1
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
            return { success: true, message: "Cập nhật nhà cung cấp thành công!" };
        } else {
            return { success: false, message: data.message || "Lỗi khi cập nhật nhà cung cấp" };
        }
    } catch (error) {
        console.error("Lỗi khi cập nhật nhà cung cấp:", error);
        return { success: false, message: "Lỗi khi cập nhật nhà cung cấp: " + error.message };
    }
}
