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

// Lấy idProvider từ query string
$idProvider = isset($_GET['idProvider']) ? intval($_GET['idProvider']) : null;
if ($idProvider === null || $idProvider <= 0) {
    echo json_encode(["success" => false, "message" => "Thiếu idProvider hoặc id không hợp lệ"]);
    exit();
}

$database = new Database();
$conn = $database->getConnection();
if (!$conn) {
    echo json_encode(["success" => false, "message" => "Lỗi kết nối cơ sở dữ liệu"]);
    exit();
}

$stmt = $conn->prepare("DELETE FROM provider WHERE idProvider = ?");
$stmt->bind_param("i", $idProvider);

if ($stmt->execute()) {
    if ($stmt->affected_rows > 0) {
        echo json_encode(["success" => true, "message" => "Xóa nhà cung cấp thành công"]);
    } else {
        echo json_encode(["success" => false, "message" => "Không tìm thấy nhà cung cấp để xóa"]);
    }
} else {
    echo json_encode(["success" => false, "message" => "Lỗi khi xóa nhà cung cấp: " . $stmt->error]);
}

$stmt->close();
$conn->close();
?>
