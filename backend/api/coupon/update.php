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

    $query = "UPDATE coupon SET description = ?, discount_type = ?, discount_value = ?, min_order_value = ?, expiry_date = ?, quantity = ?, status = ? WHERE code = ?";
    $stmt = $conn->prepare($query);

    $min_order_value = isset($data->min_order_value) ? $data->min_order_value : 0;
    $status = isset($data->status) ? $data->status : 'active';

    $stmt->bind_param(
        "ssddsiss",
        $data->description,
        $data->discount_type,
        $data->discount_value,
        $min_order_value,
        $data->expiry_date,
        $data->quantity,
        $status,
        $data->code
    );

    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'message' => 'Cập nhật coupon thành công']);
    } else {
        throw new Exception("Lỗi khi cập nhật coupon: " . $stmt->error);
    }
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>
