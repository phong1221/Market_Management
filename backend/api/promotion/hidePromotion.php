<?php
// Bật hiển thị lỗi để debug
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Cấu hình CORS và Content-Type

header("Access-Control-Allow-Origin: *");
// SỬA DÒNG NÀY: Thêm chữ DELETE vào
header("Access-Control-Allow-Methods:PUT, GET, POST, DELETE, OPTIONS"); 
header("Access-Control-Allow-Headers: Content-Type, Authorization");
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
if (!isset($data['idPromotion'])) {
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
    // Đầu tiên, lấy trạng thái hiện tại của promotion
    $stmt = $conn->prepare("SELECT status FROM promotion WHERE idPromotion = ?");
    $stmt->bind_param("i", $data['idPromotion']);
    
    if ($stmt->execute()) {
        $result = $stmt->get_result();
        if ($result->num_rows > 0) {
            $row = $result->fetch_assoc();
            $currentStatus = $row['status'];
            
            // Đảo ngược trạng thái
            $newStatus = ($currentStatus === 'Hoạt động') ? 'Không hoạt động' : 'Hoạt động';
            
            // Cập nhật trạng thái mới
            $updateStmt = $conn->prepare("UPDATE promotion SET status = ? WHERE idPromotion = ?");
            $updateStmt->bind_param("si", $newStatus, $data['idPromotion']);
            
            if ($updateStmt->execute()) {
                $statusText = ($newStatus === 'Hoạt động') ? 'kích hoạt' : 'ẩn';
                echo json_encode([
                    "success" => true,
                    "message" => "Đã $statusText khuyến mãi thành công",
                    "newStatus" => $newStatus
                ]);
            } else {
                echo json_encode([
                    "success" => false,
                    "message" => "Lỗi khi cập nhật trạng thái: " . $updateStmt->error
                ]);
            }
            $updateStmt->close();
        } else {
            echo json_encode([
                "success" => false,
                "message" => "Không tìm thấy khuyến mãi"
            ]);
        }
    } else {
        echo json_encode([
            "success" => false,
            "message" => "Lỗi khi kiểm tra trạng thái: " . $stmt->error
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
