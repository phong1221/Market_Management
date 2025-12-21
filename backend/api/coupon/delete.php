<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

header("Content-Type: application/json; charset=UTF-8");
require_once '../../config/Database.php';

try {
    $database = new Database();
    $conn = $database->getConnection();

    $code = isset($_GET['code']) ? $_GET['code'] : null;

    if (!$code) {
        throw new Exception("Thiếu mã coupon");
    }

    $query = "DELETE FROM coupon WHERE code = ?";
    $stmt = $conn->prepare($query);
    $stmt->bind_param("s", $code);

    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'message' => 'Xóa coupon thành công']);
    } else {
        throw new Exception("Lỗi khi xóa coupon: " . $stmt->error);
    }
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>
