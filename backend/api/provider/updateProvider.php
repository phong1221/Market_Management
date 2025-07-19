<?php
// Bật hiển thị lỗi để debug
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Cấu hình CORS và Content-Type
header("Access-Control-Allow-Origin: *");
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
if (!isset($data['idProvider'], $data['nameProvider'], $data['addressProvider'], $data['phoneProvider'], $data['emailProvider'], $data['idType'])) {
    echo json_encode([
        "success" => false,
        "message" => "Thiếu thông tin nhà cung cấp"
    ]);
    exit();
}

$database = new Database();
$conn = $database->getConnection();
if (!$conn) {
    echo json_encode(["success" => false, "message" => "Lỗi kết nối cơ sở dữ liệu"]);
    exit();
}

$stmt = $conn->prepare("UPDATE provider SET nameProvider = ?, addressProvider = ?, phoneProvider = ?, emailProvider = ?, idType = ? WHERE idProvider = ?");
$stmt->bind_param(
    "ssssii",
    $data['nameProvider'],
    $data['addressProvider'],
    $data['phoneProvider'],
    $data['emailProvider'],
    $data['idType'],
    $data['idProvider']
);

if ($stmt->execute()) {
    if ($stmt->affected_rows > 0) {
        echo json_encode(["success" => true, "message" => "Cập nhật nhà cung cấp thành công"]);
    } else {
        echo json_encode(["success" => false, "message" => "Không tìm thấy nhà cung cấp hoặc dữ liệu không thay đổi"]);
    }
} else {
    echo json_encode(["success" => false, "message" => "Lỗi khi cập nhật nhà cung cấp: " . $stmt->error]);
}

$stmt->close();
$conn->close();
?>
