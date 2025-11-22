<?php
// Bật hiển thị lỗi để debug
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Cấu hình CORS và Content-Type

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

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
if (!isset($data['nameUser'], $data['passWord'], $data['roleUser'])) {
    echo json_encode([
        "success" => false,
        "message" => "Thiếu thông tin người dùng"
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

// Chuẩn bị truy vấn thêm người dùng
$stmt = $conn->prepare("INSERT INTO useraccount (nameUser, passWord, roleUser) VALUES (?, ?, ?)");
$stmt->bind_param(
    "sss",
    $data['nameUser'],
    $data['passWord'],
    $data['roleUser']
);

if ($stmt->execute()) {
    echo json_encode([
        "success" => true,
        "message" => "Thêm người dùng thành công",
        "idUser" => $conn->insert_id
    ]);
} else {
    echo json_encode([
        "success" => false,
        "message" => "Lỗi khi thêm người dùng: " . $stmt->error
    ]);
}

$stmt->close();
$conn->close();
?>
