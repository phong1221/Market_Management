<?php
// Bật hiển thị lỗi để debug
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Cấu hình CORS và Content-Type
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}
header("Content-Type: application/json; charset=UTF-8");

// Kiểm tra phương thức request
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    echo json_encode(["success" => false, "message" => "Chỉ chấp nhận phương thức GET"]);
    exit();
}

require_once '../../config/Database.php';

// Khởi tạo kết nối database
$database = new Database();
$conn = $database->getConnection();

// Kiểm tra kết nối
if (!$conn) {
    echo json_encode([
        "success" => false,
        "message" => "Lỗi kết nối cơ sở dữ liệu"
    ]);
    exit();
}

// Tạo truy vấn SQL
$sql = "SELECT idEmployee, nameEmployee, genderEmployee, addressEmployee, phoneEmployee, roleEmployee FROM employee ORDER BY idEmployee";
$result = $conn->query($sql);

if ($result) {
    $employees = [];
    while ($row = $result->fetch_assoc()) {
        $employees[] = [
            "idEmployee" => $row["idEmployee"],
            "nameEmployee" => $row["nameEmployee"],
            "genderEmployee" => $row["genderEmployee"],
            "addressEmployee" => $row["addressEmployee"],
            "phoneEmployee" => $row["phoneEmployee"],
            "roleEmployee" => $row["roleEmployee"]
        ];
    }
    echo json_encode([
        "success" => true,
        "data" => $employees
    ]);
} else {
    echo json_encode([
        "success" => false,
        "message" => "Lỗi khi lấy danh sách nhân viên: " . $conn->error
    ]);
}

// Đóng kết nối
$conn->close();
?>
