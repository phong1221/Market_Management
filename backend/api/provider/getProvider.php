<?php
// Bật hiển thị lỗi để debug
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Cấu hình CORS và Content-Type

header("Access-Control-Allow-Origin: *");
// SỬA DÒNG NÀY: Thêm chữ DELETE vào
header("Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS"); 
header("Access-Control-Allow-Headers: Content-Type, Authorization");
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

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

// Tạo truy vấn SQL với JOIN để lấy thông tin loại sản phẩm
$sql = "SELECT p.*, tp.nameType FROM provider p 
        LEFT JOIN typeproduct tp ON p.idType = tp.idType";
$result = $conn->query($sql);

if ($result) {
    $providers = [];
    while ($row = $result->fetch_assoc()) {
        $providers[] = [
            "idProvider" => $row["idProvider"],
            "nameProvider" => $row["nameProvider"],
            "addressProvider" => $row["addressProvider"],
            "phoneProvider" => $row["phoneProvider"],
            "emailProvider" => $row["emailProvider"],
            "idType" => $row["idType"],
            "nameType" => $row["nameType"]
        ];
    }
    echo json_encode([
        "success" => true,
        "data" => $providers
    ]);
} else {
    echo json_encode([
        "success" => false,
        "message" => "Lỗi khi lấy danh sách nhà cung cấp: " . $conn->error
    ]);
}

// Đóng kết nối
$conn->close();
?>
