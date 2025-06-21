<?php
// Bật hiển thị lỗi để debug
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Cấu hình CORS và Content-Type
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Xử lý preflight request (OPTIONS)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Kiểm tra phương thức request
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(["success" => false, "message" => "Chỉ chấp nhận phương thức POST"]);
    exit();
}

require_once '../../config/Database.php';

// Lấy dữ liệu từ body
$data = json_decode(file_get_contents("php://input"), true);

// Kiểm tra dữ liệu đầu vào
if (!isset($data['namePromotion'], $data['descriptionPromotion'], $data['discountPromotion'], $data['startDay'], $data['endDay'])) {
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
    // Chuẩn bị truy vấn thêm promotion
    $stmt = $conn->prepare("INSERT INTO promotion (namePromotion, descriptionPromotion, discountPromotion, startDay, endtDay, status) VALUES (?, ?, ?, ?, ?, 'Hoạt động')");
    
    if ($stmt === false) {
        echo json_encode([
            "success" => false,
            "message" => "Lỗi chuẩn bị truy vấn: " . $conn->error
        ]);
        exit();
    }
    
    $stmt->bind_param(
        "ssdss",
        $data['namePromotion'],
        $data['descriptionPromotion'],
        $data['discountPromotion'],
        $data['startDay'],
        $data['endDay']
    );

    if ($stmt->execute()) {
        echo json_encode([
            "success" => true,
            "message" => "Thêm khuyến mãi thành công",
            "idPromotion" => $conn->insert_id
        ]);
    } else {
        echo json_encode([
            "success" => false,
            "message" => "Lỗi khi thêm khuyến mãi: " . $stmt->error
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
