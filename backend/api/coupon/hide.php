<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: PUT, OPTIONS");
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

    $data = json_decode(file_get_contents("php://input"));

    if (!isset($data->code)) {
        throw new Exception("Thiếu mã coupon");
    }

    // Get current status
    $stmt = $conn->prepare("SELECT status FROM coupon WHERE code = ?");
    $stmt->bind_param("s", $data->code);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        throw new Exception("Coupon không tồn tại");
    }

    $row = $result->fetch_assoc();
    $newStatus = ($row['status'] === 'active') ? 'inactive' : 'active';

    // Update status
    $updateStmt = $conn->prepare("UPDATE coupon SET status = ? WHERE code = ?");
    $updateStmt->bind_param("ss", $newStatus, $data->code);
    
    if ($updateStmt->execute()) {
        echo json_encode(['success' => true, 'message' => 'Thay đổi trạng thái thành công', 'newStatus' => $newStatus]);
    } else {
        throw new Exception("Lỗi khi cập nhật trạng thái");
    }

} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>
