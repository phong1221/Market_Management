<?php
// Bật hiển thị lỗi để debug
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Cấu hình CORS và Content-Type
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Xử lý preflight request (OPTIONS)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Kiểm tra phương thức request
if ($_SERVER['REQUEST_METHOD'] !== 'DELETE') {
    echo json_encode(["success" => false, "message" => "Chỉ chấp nhận phương thức DELETE"]);
    exit();
}

require_once '../../config/Database.php';

// Lấy ID từ query parameter
$idPromotion = isset($_GET['idPromotion']) ? $_GET['idPromotion'] : null;

// Kiểm tra dữ liệu đầu vào
if (!$idPromotion) {
    echo json_encode([
        "success" => false,
        "message" => "Thiếu ID khuyến mãi"
    ]);
    exit();
}

// Khởi tạo kết nối database
$database = new Database();
$conn = $database->getConnection();

if (!$conn) {
    echo json_encode([
        "success" => false,
        "message" => "Lỗi kết nối cơ sở dữ liệu"
    ]);
    exit();
}

try {
    // Chuẩn bị truy vấn xóa promotion
    $stmt = $conn->prepare("DELETE FROM promotion WHERE idPromotion = ?");
    $stmt->bind_param("i", $idPromotion);

    if ($stmt->execute()) {
        if ($stmt->affected_rows > 0) {
            echo json_encode([
                "success" => true,
                "message" => "Xóa khuyến mãi thành công"
            ]);
        } else {
            echo json_encode([
                "success" => false,
                "message" => "Không tìm thấy khuyến mãi để xóa"
            ]);
        }
    } else {
        echo json_encode([
            "success" => false,
            "message" => "Lỗi khi xóa khuyến mãi: " . $stmt->error
        ]);
    }
} catch (Exception $e) {
    echo json_encode([
        "success" => false,
        "message" => "Lỗi: " . $e->getMessage()
    ]);
}

$stmt->close();
$conn->close();
?>
