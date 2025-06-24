import Salary from '../models/salary';

const API_URL = "http://localhost/market_management/backend/api/salary/getSalary.php";
const API_URL_ADD = "http://localhost/market_management/backend/api/salary/addSalary.php";
const API_URL_DELETE = "http://localhost/market_management/backend/api/salary/deleteSalary.php";
const API_URL_UPDATE = "http://localhost/market_management/backend/api/salary/updateSalary.php";

export async function fetchSalary() {
    try {
        const response = await fetch(API_URL);
        const data = await response.json();
        console.log("API response:", data);
        return (data.data || []).map(item => new Salary(
            item.idSalary,
            item.idEmployee,
            item.basicSalary,
            item.bonus,
            item.totalSalary,
            item.deduction,
            item.salaryMonth
        ));
    } catch (error) {
        console.error("Lỗi khi gọi API:", error);
        return [];
    }
}

export async function addSalary(salaryDTO) {
    // Kiểm tra dữ liệu đầu vào dựa trên class Salary
    if (
        !salaryDTO.idEmployee ||
        !salaryDTO.basicSalary ||
        !salaryDTO.bonus ||
        !salaryDTO.deduction ||
        !salaryDTO.salaryMonth
    ) {
        console.error("Dữ liệu không hợp lệ:", salaryDTO);
        return { success: false, message: "Dữ liệu không hợp lệ hoặc thiếu thông tin" };
    }

    // In ra dữ liệu trước khi gửi
    console.log("Dữ liệu gửi đi:", salaryDTO);

    try {
        // Tạo đối tượng dữ liệu để gửi
        const dataToSend = {
            idEmployee: salaryDTO.idEmployee,
            basicSalary: salaryDTO.basicSalary,
            bonus: salaryDTO.bonus,
            deduction: salaryDTO.deduction,
            salaryMonth: salaryDTO.salaryMonth
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
            return { 
                success: true, 
                message: "Thêm lương thành công!", 
                idSalary: data.idSalary,
                totalSalary: data.totalSalary
            };
        } else {
            return { success: false, message: data.message || "Lỗi khi thêm lương" };
        }
    } catch (error) {
        console.error("Lỗi khi thêm lương:", error);
        return { success: false, message: "Lỗi khi thêm lương: " + error.message };
    }
}

export async function deleteSalary(idSalary) {
    try {
        const response = await fetch(API_URL_DELETE + `?idSalary=${idSalary}`, {
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

export async function updateSalary(salaryDTO) {
    // Kiểm tra dữ liệu đầu vào dựa trên class Salary
    if (
        !salaryDTO.idSalary ||
        !salaryDTO.idEmployee ||
        !salaryDTO.basicSalary ||
        !salaryDTO.bonus ||
        !salaryDTO.deduction ||
        !salaryDTO.salaryMonth
    ) {
        console.error("Dữ liệu không hợp lệ:", salaryDTO);
        return { success: false, message: "Dữ liệu không hợp lệ hoặc thiếu thông tin" };
    }

    // In ra dữ liệu trước khi gửi
    console.log("Dữ liệu gửi đi:", salaryDTO);

    try {
        // Tạo đối tượng dữ liệu để gửi
        const dataToSend = {
            idSalary: salaryDTO.idSalary,
            idEmployee: salaryDTO.idEmployee,
            basicSalary: salaryDTO.basicSalary,
            bonus: salaryDTO.bonus,
            deduction: salaryDTO.deduction,
            salaryMonth: salaryDTO.salaryMonth
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
            return { 
                success: true, 
                message: "Cập nhật lương thành công!",
                totalSalary: data.totalSalary
            };
        } else {
            return { success: false, message: data.message || "Lỗi khi cập nhật lương" };
        }
    } catch (error) {
        console.error("Lỗi khi cập nhật lương:", error);
        return { success: false, message: "Lỗi khi cập nhật lương: " + error.message };
    }
}

// Function để lấy thông tin nhân viên cho dropdown
export async function getEmployeeInfo() {
    try {
        const response = await fetch("http://localhost/market_management/backend/api/employee/getEmployee.php");
        const data = await response.json();
        return (data.data || []).map(employee => ({
            idEmployee: employee.idEmployee,
            nameEmployee: employee.nameEmployee,
            roleEmployee: employee.roleEmployee
        }));
    } catch (error) {
        console.error("Lỗi khi lấy thông tin nhân viên:", error);
        return [];
    }
}
