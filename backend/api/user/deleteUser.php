<?php
// Bật hiển thị lỗi để debug
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Cấu hình CORS và Content-Type

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: DELETE, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Chấp nhận DELETE hoặc GET
if ($_SERVER['REQUEST_METHOD'] !== 'DELETE' && $_SERVER['REQUEST_METHOD'] !== 'GET') {
    echo json_encode(["success" => false, "message" => "Chỉ chấp nhận phương thức DELETE hoặc GET"]);
    exit();
}

require_once '../../config/Database.php';

// Lấy idUser từ query string
$idUser = isset($_GET['idUser']) ? intval($_GET['idUser']) : null;
if ($idUser === null || $idUser <= 0) {
    echo json_encode(["success" => false, "message" => "Thiếu idUser hoặc id không hợp lệ"]);
    exit();
}

$database = new Database();
$conn = $database->getConnection();
if (!$conn) {
    echo json_encode(["success" => false, "message" => "Lỗi kết nối cơ sở dữ liệu"]);
    exit();
}

$stmt = $conn->prepare("DELETE FROM useraccount WHERE idUser = ?");
$stmt->bind_param("i", $idUser);

if ($stmt->execute()) {
    if ($stmt->affected_rows > 0) {
        echo json_encode(["success" => true, "message" => "Xóa người dùng thành công"]);
    } else {
        echo json_encode(["success" => false, "message" => "Không tìm thấy người dùng để xóa"]);
    }
} else {
    echo json_encode(["success" => false, "message" => "Lỗi khi xóa người dùng: " . $stmt->error]);
}

$stmt->close();
$conn->close();
?>
