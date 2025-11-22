<?php
// Bật hiển thị lỗi để debug
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Headers

header("Access-Control-Allow-Origin: *");
// SỬA DÒNG NÀY: Thêm chữ DELETE vào
header("Access-Control-Allow-Methods: DELETE, OPTIONS"); 
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}
$database = new Database();
$db = $database->getConnection();

// Get raw posted data
$data = json_decode(file_get_contents("php://input"));

$stmt = $conn->prepare("DELETE FROM salary WHERE idSalary = ?");
$stmt->bind_param("i", $idSalary);

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
