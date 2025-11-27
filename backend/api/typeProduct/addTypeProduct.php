<?php
// Set CORS headers

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
if (!isset($data['nameType']) || !isset($data['descriptionType']) || !isset($data['inventory']) || !isset($data['typeSell'])) {
    echo json_encode(['success' => false, 'message' => 'Thiếu dữ liệu đầu vào!']);
    exit;
}

$nameType = $data['nameType'];
$descriptionType = $data['descriptionType'];
$inventory = $data['inventory'];
$typeSell = $data['typeSell'];

$db = new Database();
$conn = $db->getConnection();

$stmt = $conn->prepare('INSERT INTO typeproduct (nameType, descriptionType, inventory, typeSell) VALUES (?, ?, ?, ?)');
$stmt->bind_param('ssis', $nameType, $descriptionType, $inventory, $typeSell);

if ($stmt->execute()) {
    echo json_encode(['success' => true, 'message' => 'Thêm loại sản phẩm thành công!']);
} else {
    echo json_encode(['success' => false, 'message' => 'Thêm loại sản phẩm thất bại!']);
}
$stmt->close();
$conn->close();
