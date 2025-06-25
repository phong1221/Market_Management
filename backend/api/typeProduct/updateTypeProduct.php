<?php
// Set CORS headers
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, PUT, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit;
}

require_once '../../config/Database.php';
header('Content-Type: application/json');

$data = json_decode(file_get_contents('php://input'), true);
if (!isset($data['idType']) || !isset($data['nameType']) || !isset($data['descriptionType']) || !isset($data['inventory']) || !isset($data['typeSell'])) {
    echo json_encode(['success' => false, 'message' => 'Thiếu dữ liệu đầu vào!']);
    exit;
}

$idType = $data['idType'];
$nameType = $data['nameType'];
$descriptionType = $data['descriptionType'];
$inventory = $data['inventory'];
$typeSell = $data['typeSell'];

$db = new Database();
$conn = $db->getConnection();

$stmt = $conn->prepare('UPDATE typeproduct SET nameType=?, descriptionType=?, inventory=?, typeSell=? WHERE idType=?');
$stmt->bind_param('ssisi', $nameType, $descriptionType, $inventory, $typeSell, $idType);

if ($stmt->execute()) {
    echo json_encode(['success' => true, 'message' => 'Cập nhật loại sản phẩm thành công!']);
} else {
    echo json_encode(['success' => false, 'message' => 'Cập nhật loại sản phẩm thất bại!']);
}
$stmt->close();
$conn->close();
