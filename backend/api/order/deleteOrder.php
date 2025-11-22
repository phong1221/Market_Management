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

if ($_SERVER['REQUEST_METHOD'] !== 'DELETE') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit();
}

$idOrder = isset($_GET['id']) ? intval($_GET['id']) : 0;

if ($idOrder <= 0) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'ID đơn hàng không hợp lệ']);
    exit();
}

try {
    $database = new Database();
    $conn = $database->getConnection();

    if (!$conn) {
        throw new Exception('Không thể kết nối cơ sở dữ liệu');
    }

    $conn->begin_transaction();

    $detailStmt = $conn->prepare("DELETE FROM order_detail WHERE idOrder = ?");
    $detailStmt->bind_param("i", $idOrder);
    if (!$detailStmt->execute()) {
        throw new Exception('Lỗi khi xóa chi tiết đơn hàng: ' . $detailStmt->error);
    }

    $orderStmt = $conn->prepare("DELETE FROM `order` WHERE idOrder = ?");
    $orderStmt->bind_param("i", $idOrder);

    if (!$orderStmt->execute()) {
        throw new Exception('Lỗi khi xóa đơn hàng: ' . $orderStmt->error);
    }

    if ($orderStmt->affected_rows === 0) {
        throw new Exception('Không tìm thấy đơn hàng để xóa');
    }

    $conn->commit();

    echo json_encode([
        'success' => true,
        'message' => 'Xóa đơn hàng thành công'
    ]);
} catch (Exception $e) {
    if (isset($conn) && $conn->errno === 0) {
        $conn->rollback();
    }

    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
} finally {
    if (isset($detailStmt)) {
        $detailStmt->close();
    }
    if (isset($orderStmt)) {
        $orderStmt->close();
    }
    if (isset($conn)) {
        $conn->close();
    }
}
?>
