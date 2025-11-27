<?php

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS"); 
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once '../../config/Database.php';
header('Content-Type: application/json');

$data = json_decode(file_get_contents('php://input'), true);
if (!isset($data['idType'])) {
    echo json_encode(['success' => false, 'message' => 'Thiếu idType!']);
    exit;
}
$idType = $data['idType'];

$db = new Database();
$conn = $db->getConnection();

// Kiểm tra tồn kho
$stmt = $conn->prepare('SELECT inventory FROM typeproduct WHERE idType=?');
$stmt->bind_param('i', $idType);
$stmt->execute();
$stmt->bind_result($inventory);
if ($stmt->fetch() === null) {
    echo json_encode(['success' => false, 'message' => 'Không tìm thấy loại sản phẩm!']);
    $stmt->close();
    $conn->close();
    exit;
}
$stmt->close();

if ($inventory > 0) {
    echo json_encode(['success' => false, 'message' => 'Chỉ được xóa khi tồn kho bằng 0!']);
    $conn->close();
    exit;
}

$stmt = $conn->prepare('DELETE FROM typeproduct WHERE idType=?');
$stmt->bind_param('i', $idType);
if ($stmt->execute()) {
    echo json_encode(['success' => true, 'message' => 'Xóa loại sản phẩm thành công!']);
} else {
    echo json_encode(['success' => false, 'message' => 'Xóa loại sản phẩm thất bại!']);
}
$stmt->close();
$conn->close();
