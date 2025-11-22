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
header("Content-Type: application/json; charset=UTF-8");

// Chấp nhận POST hoặc PUT
if ($_SERVER['REQUEST_METHOD'] !== 'POST' && $_SERVER['REQUEST_METHOD'] !== 'PUT') {
    echo json_encode(["success" => false, "message" => "Chỉ chấp nhận phương thức POST hoặc PUT"]);
    exit();
}

require_once '../../config/Database.php';

// Lấy dữ liệu từ body
$data = json_decode(file_get_contents("php://input"), true);

// Kiểm tra dữ liệu đầu vào
if (!isset($data['idEmployee'], $data['nameEmployee'], $data['genderEmployee'], $data['addressEmployee'], $data['phoneEmployee'], $data['roleEmployee'])) {
    echo json_encode([
        "success" => false,
        "message" => "Thiếu thông tin nhân viên"
    ]);
    exit();
}

$database = new Database();
$conn = $database->getConnection();
if (!$conn) {
    echo json_encode(["success" => false, "message" => "Lỗi kết nối cơ sở dữ liệu"]);
    exit();
}

$stmt = $conn->prepare("UPDATE employee SET nameEmployee = ?, genderEmployee = ?, addressEmployee = ?, phoneEmployee = ?, roleEmployee = ? WHERE idEmployee = ?");
$stmt->bind_param(
    "sssssi",
    $data['nameEmployee'],
    $data['genderEmployee'],
    $data['addressEmployee'],
    $data['phoneEmployee'],
    $data['roleEmployee'],
    $data['idEmployee']
);

if ($stmt->execute()) {
    if ($stmt->affected_rows > 0) {
        echo json_encode(["success" => true, "message" => "Cập nhật nhân viên thành công"]);
    } else {
        echo json_encode(["success" => false, "message" => "Không tìm thấy nhân viên hoặc dữ liệu không thay đổi"]);
    }
} else {
    echo json_encode(["success" => false, "message" => "Lỗi khi cập nhật nhân viên: " . $stmt->error]);
}

$stmt->close();
$conn->close();
?>
