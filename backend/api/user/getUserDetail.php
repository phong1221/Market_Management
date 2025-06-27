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

require_once '../../config/Database.php';

// Khởi tạo kết nối database
$database = new Database();
$conn = $database->getConnection();

// Kiểm tra kết nối
if (!$conn) {
    echo json_encode(["success" => false, "message" => "Lỗi kết nối cơ sở dữ liệu"]);
    exit();
}

// Lấy idUser từ query parameter
$idUser = isset($_GET['idUser']) ? intval($_GET['idUser']) : 0;

if ($idUser <= 0) {
    echo json_encode(["success" => false, "message" => "ID người dùng không hợp lệ"]);
    exit();
}

// Truy vấn thông tin chi tiết người dùng
// Giả sử bảng tên là `infor_user` và các cột khớp với model
$sql = "SELECT idInfor, idUser, fullName, age, address, phone FROM inforuser WHERE idUser = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $idUser);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    $userDetails = $result->fetch_assoc();
    echo json_encode(["success" => true, "data" => $userDetails]);
} else {
    // Nếu không có thông tin, trả về data: null để frontend xử lý
    echo json_encode(["success" => true, "data" => null]);
}

$stmt->close();
$conn->close();
?> 