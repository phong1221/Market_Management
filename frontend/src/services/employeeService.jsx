const API_URL = "http://localhost/market_management/backend/api/employee/getEmployee.php";
const API_URL_ADD = "http://localhost/market_management/backend/api/employee/addEmployee.php";
const API_URL_DELETE = "http://localhost/market_management/backend/api/employee/deleteEmployee.php";
const API_URL_UPDATE = "http://localhost/market_management/backend/api/employee/updateEmployee.php";
import employee from '../models/employee';

export async function fetchEmployee() {
    try {
        const response = await fetch(API_URL);
        const data = await response.json();
        console.log("API response:", data);
        return (data.data || []).map(item => new employee(
            item.idEmployee,
            item.nameEmployee,
            item.genderEmployee,
            item.addressEmployee,
            item.phoneEmployee,
            item.roleEmployee
        ));
    } catch (error) {
        console.error("Lỗi khi gọi API:", error);
        return [];
    }
}

export async function addEmployee(employeeDTO) {
    // Kiểm tra dữ liệu đầu vào dựa trên class employee
    if (
        !employeeDTO.nameEmployee ||
        !employeeDTO.genderEmployee ||
        !employeeDTO.addressEmployee ||
        !employeeDTO.phoneEmployee ||
        !employeeDTO.roleEmployee
    ) {
        console.error("Dữ liệu không hợp lệ:", employeeDTO);
        return { success: false, message: "Dữ liệu không hợp lệ hoặc thiếu thông tin" };
    }

    // In ra dữ liệu trước khi gửi
    console.log("Dữ liệu gửi đi:", employeeDTO);

    try {
        // Tạo đối tượng dữ liệu để gửi
        const dataToSend = {
            nameEmployee: employeeDTO.nameEmployee,
            genderEmployee: employeeDTO.genderEmployee,
            addressEmployee: employeeDTO.addressEmployee,
            phoneEmployee: employeeDTO.phoneEmployee,
            roleEmployee: employeeDTO.roleEmployee
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
            return { success: true, message: "Thêm nhân viên thành công!", idEmployee: data.idEmployee };
        } else {
            return { success: false, message: data.message || "Lỗi khi thêm nhân viên" };
        }
    } catch (error) {
        console.error("Lỗi khi thêm nhân viên:", error);
        return { success: false, message: "Lỗi khi thêm nhân viên: " + error.message };
    }
}

export async function deleteEmployee(idEmployee) {
    try {
        const response = await fetch(API_URL_DELETE + `?idEmployee=${idEmployee}`, {
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

export async function updateEmployee(employeeDTO) {
    // Kiểm tra dữ liệu đầu vào dựa trên class employee
    if (
        !employeeDTO.idEmployee ||
        !employeeDTO.nameEmployee ||
        !employeeDTO.genderEmployee ||
        !employeeDTO.addressEmployee ||
        !employeeDTO.phoneEmployee ||
        !employeeDTO.roleEmployee
    ) {
        console.error("Dữ liệu không hợp lệ:", employeeDTO);
        return { success: false, message: "Dữ liệu không hợp lệ hoặc thiếu thông tin" };
    }

    // In ra dữ liệu trước khi gửi
    console.log("Dữ liệu gửi đi:", employeeDTO);

    try {
        // Tạo đối tượng dữ liệu để gửi
        const dataToSend = {
            idEmployee: employeeDTO.idEmployee,
            nameEmployee: employeeDTO.nameEmployee,
            genderEmployee: employeeDTO.genderEmployee,
            addressEmployee: employeeDTO.addressEmployee,
            phoneEmployee: employeeDTO.phoneEmployee,
            roleEmployee: employeeDTO.roleEmployee
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
            return { success: true, message: "Cập nhật nhân viên thành công!" };
        } else {
            return { success: false, message: data.message || "Lỗi khi cập nhật nhân viên" };
        }
    } catch (error) {
        console.error("Lỗi khi cập nhật nhân viên:", error);
        return { success: false, message: "Lỗi khi cập nhật nhân viên: " + error.message };
    }
}