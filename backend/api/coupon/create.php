<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
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

    if (
        !isset($data->code) ||
        !isset($data->description) ||
        !isset($data->discount_type) ||
        !isset($data->discount_value) ||
        !isset($data->expiry_date) ||
        !isset($data->quantity)
    ) {
        throw new Exception("Thiếu thông tin bắt buộc");
    }

    // Check if code exists
    $checkQuery = "SELECT code FROM coupon WHERE code = ?";
    $checkStmt = $conn->prepare($checkQuery);
    $checkStmt->bind_param("s", $data->code);
    $checkStmt->execute();
    if ($checkStmt->get_result()->num_rows > 0) {
        throw new Exception("Mã coupon đã tồn tại");
    }
    $checkStmt->close();

    $query = "INSERT INTO coupon (code, description, discount_type, discount_value, min_order_value, expiry_date, quantity, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
    $stmt = $conn->prepare($query);

    $min_order_value = isset($data->min_order_value) ? $data->min_order_value : 0;
    $status = isset($data->status) ? $data->status : 'active';

    $stmt->bind_param(
        "sssddsis",
        $data->code,
        $data->description,
        $data->discount_type,
        $data->discount_value,
        $min_order_value,
        $data->expiry_date,
        $data->quantity,
        $status
    );

    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'message' => 'Tạo coupon thành công', 'code' => $data->code]);
    } else {
        throw new Exception("Lỗi khi tạo coupon: " . $stmt->error);
    }
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>
