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
    $inputJSON = file_get_contents('php://input');
    $data = json_decode($inputJSON, true);

    if (!isset($data['idUser']) || !isset($data['code'])) {
        throw new Exception("Thiếu thông tin user hoặc mã coupon");
    }

    $idUser = intval($data['idUser']);
    $code = $data['code'];

    $database = new Database();
    $conn = $database->getConnection();

    // 1. Check if coupon fits criteria
    $query = "SELECT * FROM coupon WHERE code = ? AND status = 'active' AND quantity > 0 AND expiry_date >= CURDATE()";
    $stmt = $conn->prepare($query);
    $stmt->bind_param("s", $code);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        throw new Exception("Mã giảm giá không tồn tại hoặc đã hết hạn");
    }
    $coupon = $result->fetch_assoc();
    $stmt->close();

    // 2. Check if already claimed
    $checkQuery = "SELECT id FROM user_coupon WHERE idUser = ? AND coupon_code = ?";
    $checkStmt = $conn->prepare($checkQuery);
    $checkStmt->bind_param("is", $idUser, $code);
    $checkStmt->execute();
    if ($checkStmt->get_result()->num_rows > 0) {
        throw new Exception("Bạn đã nhận mã này rồi");
    }
    $checkStmt->close();

    // 3. Claim it transactionally
    $conn->begin_transaction();

    try {
        // Decrement quantity
        $updateQuery = "UPDATE coupon SET quantity = quantity - 1 WHERE code = ?";
        $updateStmt = $conn->prepare($updateQuery);
        $updateStmt->bind_param("s", $code);
        $updateStmt->execute();

        // Insert user_coupon
        $insertQuery = "INSERT INTO user_coupon (idUser, coupon_code, status) VALUES (?, ?, 'available')";
        $insertStmt = $conn->prepare($insertQuery);
        $insertStmt->bind_param("is", $idUser, $code);
        $insertStmt->execute();

        $conn->commit();
        echo json_encode(['success' => true, 'message' => 'Nhận mã giảm giá thành công']);
    } catch (Exception $ex) {
        $conn->rollback();
        throw $ex;
    }

} catch (Exception $e) {
    http_response_code(400); // Bad Request for logical errors
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>
