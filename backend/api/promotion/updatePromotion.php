<?php
// Bật hiển thị lỗi để debug
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Cấu hình CORS và Content-Type

header("Access-Control-Allow-Origin: *");
// SỬA DÒNG NÀY: Thêm chữ DELETE vào
header("Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS"); 
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Methods: PUT, OPTIONS");
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Kiểm tra phương thức request
if ($_SERVER['REQUEST_METHOD'] !== 'PUT') {
    echo json_encode(["success" => false, "message" => "Chỉ chấp nhận phương thức PUT"]);
    exit();
}

require_once '../../config/Database.php';

// Lấy dữ liệu từ body
$data = json_decode(file_get_contents("php://input"), true);

// Kiểm tra dữ liệu đầu vào
if (!isset($data['idPromotion'], $data['namePromotion'], $data['descriptionPromotion'], $data['discountPromotion'], $data['startDay'], $data['endDay'])) {
    echo json_encode([
        "success" => false,
        "message" => "Thiếu thông tin khuyến mãi"
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
    // Chuẩn bị truy vấn cập nhật promotion
    $stmt = $conn->prepare("UPDATE promotion SET namePromotion = ?, descriptionPromotion = ?, discountPromotion = ?, startDay = ?, endtDay = ? WHERE idPromotion = ?");
    
    if ($stmt === false) {
        echo json_encode([
            "success" => false,
            "message" => "Lỗi chuẩn bị truy vấn: " . $conn->error
        ]);
        exit();
    }
    
    $stmt->bind_param(
        "ssdssi",
        $data['namePromotion'],
        $data['descriptionPromotion'],
        $data['discountPromotion'],
        $data['startDay'],
        $data['endDay'],
        $data['idPromotion']
    );

    if ($stmt->execute()) {
        if ($stmt->affected_rows > 0) {
            echo json_encode([
                "success" => true,
                "message" => "Cập nhật khuyến mãi thành công"
            ]);
        } else {
            echo json_encode([
                "success" => false,
                "message" => "Không tìm thấy khuyến mãi để cập nhật"
            ]);
        }
    } else {
        echo json_encode([
            "success" => false,
            "message" => "Lỗi khi cập nhật khuyến mãi: " . $stmt->error
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
