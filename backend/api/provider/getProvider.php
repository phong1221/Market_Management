<?php
// Bật hiển thị lỗi để debug
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Cấu hình CORS và Content-Type
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Xử lý preflight request (OPTIONS)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
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

// Tạo truy vấn SQL
$sql = "SELECT * FROM provider";
$result = $conn->query($sql);

if ($result) {
    $providers = [];
    while ($row = $result->fetch_assoc()) {
        $providers[] = [
            "idProvider" => $row["idProvider"],
            "nameProvider" => $row["nameProvider"],
            "addressProvider" => $row["addressProvider"],
            "phoneProvider" => $row["phoneProvider"],
            "emailProvider" => $row["emailProvider"]
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
