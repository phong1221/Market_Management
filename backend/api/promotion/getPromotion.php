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

if (!$conn) {
    echo json_encode([
        "success" => false,
        "message" => "Lỗi kết nối cơ sở dữ liệu"
    ]);
    exit();
}

try {
    // Chuẩn bị truy vấn lấy tất cả promotions
    $stmt = $conn->prepare("SELECT idPromotion, namePromotion, descriptionPromotion, discountPromotion, startDay, endtDay, status FROM promotion ORDER BY idPromotion DESC");
    
    if ($stmt === false) {
        echo json_encode([
            "success" => false,
            "message" => "Lỗi chuẩn bị truy vấn: " . $conn->error
        ]);
        exit();
    }
    
    if ($stmt->execute()) {
        $result = $stmt->get_result();
        $promotions = [];
        
        while ($row = $result->fetch_assoc()) {
            $promotions[] = [
                "idPromotion" => $row['idPromotion'],
                "namePromotion" => $row['namePromotion'],
                "descriptionPromotion" => $row['descriptionPromotion'],
                "discountPromotion" => $row['discountPromotion'],
                "startDay" => $row['startDay'],
                "endDay" => $row['endtDay'], // Map từ endtDay sang endDay
                "status" => $row['status'] === 'Hoạt động' ? 'Active' : 'Inactive' // Map status
            ];
        }
        
        echo json_encode([
            "success" => true,
            "message" => "Lấy danh sách khuyến mãi thành công",
            "data" => $promotions
        ]);
    } else {
        echo json_encode([
            "success" => false,
            "message" => "Lỗi khi lấy danh sách khuyến mãi: " . $stmt->error
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
