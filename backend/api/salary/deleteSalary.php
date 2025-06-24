<?php
// Bật hiển thị lỗi để debug
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Headers
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Access-Control-Allow-Headers,Content-Type,Access-Control-Allow-Methods, Authorization, X-Requested-With');

// Handle preflight request (OPTIONS)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

include_once '../../config/Database.php';

$database = new Database();
$db = $database->getConnection();

$idSalary = isset($_GET['idSalary']) ? $_GET['idSalary'] : die();

$query = 'DELETE FROM salary WHERE idSalary = ?';

$stmt = $db->prepare($query);

if($stmt === false){
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Lỗi chuẩn bị câu lệnh SQL.']);
    exit();
}

$idSalary = htmlspecialchars(strip_tags($idSalary));

$stmt->bind_param('i', $idSalary);

if($stmt->execute()) {
    if($stmt->affected_rows > 0){
        echo json_encode(
            array('success' => true, 'message' => 'Xóa lương thành công.')
        );
    } else {
        echo json_encode(
            array('success' => false, 'message' => 'Không tìm thấy lương để xóa.')
        );
    }
} else {
  echo json_encode(
    array('success' => false, 'message' => 'Lỗi khi xóa lương.')
  );
}
?>
