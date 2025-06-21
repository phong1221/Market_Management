<?php
// Bật hiển thị lỗi để debug
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Cấu hình CORS và Content-Type
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: DELETE, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Xử lý preflight request (OPTIONS)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Chấp nhận DELETE hoặc GET
if ($_SERVER['REQUEST_METHOD'] !== 'DELETE' && $_SERVER['REQUEST_METHOD'] !== 'GET') {
    echo json_encode(["success" => false, "message" => "Chỉ chấp nhận phương thức DELETE hoặc GET"]);
    exit();
}

require_once '../../config/Database.php';

// Lấy idEmployee từ query string
$idEmployee = isset($_GET['idEmployee']) ? intval($_GET['idEmployee']) : null;
if ($idEmployee === null || $idEmployee <= 0) {
    echo json_encode(["success" => false, "message" => "Thiếu idEmployee hoặc id không hợp lệ"]);
    exit();
}

$database = new Database();
$conn = $database->getConnection();
if (!$conn) {
    echo json_encode(["success" => false, "message" => "Lỗi kết nối cơ sở dữ liệu"]);
    exit();
}

$stmt = $conn->prepare("DELETE FROM employee WHERE idEmployee = ?");
$stmt->bind_param("i", $idEmployee);

if ($stmt->execute()) {
    if ($stmt->affected_rows > 0) {
        echo json_encode(["success" => true, "message" => "Xóa nhân viên thành công"]);
    } else {
        echo json_encode(["success" => false, "message" => "Không tìm thấy nhân viên để xóa"]);
    }
} else {
    echo json_encode(["success" => false, "message" => "Lỗi khi xóa nhân viên: " . $stmt->error]);
}

$stmt->close();
$conn->close();
?>
