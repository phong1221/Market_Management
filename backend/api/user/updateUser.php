<?php
// Bật hiển thị lỗi để debug
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Cấu hình CORS và Content-Type
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, PUT, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Xử lý preflight request (OPTIONS)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Chấp nhận POST hoặc PUT
if ($_SERVER['REQUEST_METHOD'] !== 'POST' && $_SERVER['REQUEST_METHOD'] !== 'PUT') {
    echo json_encode(["success" => false, "message" => "Chỉ chấp nhận phương thức POST hoặc PUT"]);
    exit();
}

require_once '../../config/Database.php';

// Lấy dữ liệu từ body
$data = json_decode(file_get_contents("php://input"), true);

// Kiểm tra dữ liệu đầu vào
if (!isset($data['idUser'], $data['nameUser'], $data['passWord'], $data['roleUser'])) {
    echo json_encode([
        "success" => false,
        "message" => "Thiếu thông tin người dùng"
    ]);
    exit();
}

$database = new Database();
$conn = $database->getConnection();
if (!$conn) {
    echo json_encode(["success" => false, "message" => "Lỗi kết nối cơ sở dữ liệu"]);
    exit();
}

$stmt = $conn->prepare("UPDATE useraccount SET nameUser = ?, passWord = ?, roleUser = ? WHERE idUser = ?");
$stmt->bind_param(
    "sssi",
    $data['nameUser'],
    $data['passWord'],
    $data['roleUser'],
    $data['idUser']
);

if ($stmt->execute()) {
    if ($stmt->affected_rows > 0) {
        echo json_encode(["success" => true, "message" => "Cập nhật người dùng thành công"]);
    } else {
        echo json_encode(["success" => false, "message" => "Không tìm thấy người dùng hoặc dữ liệu không thay đổi"]);
    }
} else {
    echo json_encode(["success" => false, "message" => "Lỗi khi cập nhật người dùng: " . $stmt->error]);
}

$stmt->close();
$conn->close();
?>
