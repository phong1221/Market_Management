<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit();
}

$input = file_get_contents('php://input');
$data = json_decode($input, true);

if (json_last_error() !== JSON_ERROR_NONE) {
    $data = $_POST; // fallback form-data
}

if (empty($data)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Dữ liệu không hợp lệ']);
    exit();
}

$idOrder = isset($data['idOrder']) ? intval($data['idOrder']) : 0;

if ($idOrder <= 0) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'ID đơn hàng không hợp lệ']);
    exit();
}

$allowedFields = [
    'idUser' => 'i',
    'address' => 's',
    'phone' => 's',
    'methodpayment' => 's',
    'Status' => 's',
    'totalAmount' => 'd',
    'nameUser' => 's'
];

$setParts = [];
$values = [];
$types = '';

foreach ($allowedFields as $field => $type) {
    if (isset($data[$field]) && $data[$field] !== '') {
        $setParts[] = ($field === 'Status' ? "`Status`" : $field) . " = ?";
        if ($type === 'i') {
            $values[] = intval($data[$field]);
        } elseif ($type === 'd') {
            $values[] = (float) $data[$field];
        } else {
            $values[] = $data[$field];
        }
        $types .= $type;
    }
}

if (empty($setParts)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Không có dữ liệu để cập nhật']);
    exit();
}

require_once '../../config/Database.php';

try {
    $database = new Database();
    $conn = $database->getConnection();

    if (!$conn) {
        throw new Exception('Không thể kết nối cơ sở dữ liệu');
    }

    $sql = "UPDATE `order` SET " . implode(', ', $setParts) . " WHERE idOrder = ?";
    $stmt = $conn->prepare($sql);

    if (!$stmt) {
        throw new Exception('Lỗi chuẩn bị câu lệnh: ' . $conn->error);
    }

    $types .= 'i';
    $values[] = $idOrder;

    $stmt->bind_param($types, ...$values);

    if (!$stmt->execute()) {
        throw new Exception('Lỗi khi cập nhật đơn hàng: ' . $stmt->error);
    }

    if ($stmt->affected_rows === 0) {
        echo json_encode([
            'success' => false,
            'message' => 'Không tìm thấy đơn hàng hoặc dữ liệu không thay đổi'
        ]);
    } else {
        echo json_encode([
            'success' => true,
            'message' => 'Cập nhật đơn hàng thành công'
        ]);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
} finally {
    if (isset($stmt)) {
        $stmt->close();
    }
    if (isset($conn)) {
        $conn->close();
    }
}
?>
