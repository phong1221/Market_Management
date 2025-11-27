<?php
// Bật hiển thị lỗi để debug
error_reporting(E_ALL);
ini_set('display_errors', 1);

header("Access-Control-Allow-Origin: *");
// SỬA DÒNG NÀY: Thêm chữ DELETE vào
header("Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS"); 
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}
header("Content-Type: application/json; charset=UTF-8");

// Chấp nhận DELETE hoặc GET
if ($_SERVER['REQUEST_METHOD'] !== 'DELETE' && $_SERVER['REQUEST_METHOD'] !== 'GET') {
    echo json_encode(["success" => false, "message" => "Chỉ chấp nhận phương thức DELETE hoặc GET"]);
    exit();
}

require_once '../../config/Database.php';

// Lấy idEmployee từ query string
$idEmployee = isset($_GET['idEmployee']) ? intval($_GET['idEmployee']) : null;
if ($idEmployee === null || $idEmployee <= 0) {
    echo json_encode(["success" => false, "message" => "Thiếu idEmployee hoặc id không hợp lệ"]);
    exit();
}

$database = new Database();
$conn = $database->getConnection();
if (!$conn) {
    echo json_encode(["success" => false, "message" => "Lỗi kết nối cơ sở dữ liệu"]);
    exit();
}

// Kiểm tra xem nhân viên có tồn tại không
$checkStmt = $conn->prepare("SELECT idEmployee, nameEmployee FROM employee WHERE idEmployee = ?");
$checkStmt->bind_param("i", $idEmployee);
$checkStmt->execute();
$result = $checkStmt->get_result();

if ($result->num_rows === 0) {
    echo json_encode(["success" => false, "message" => "Không tìm thấy nhân viên với ID: " . $idEmployee]);
    $checkStmt->close();
    $conn->close();
    exit();
}

$employee = $result->fetch_assoc();
$checkStmt->close();

// Kiểm tra xem nhân viên có lương trong bảng salary không
$salaryCheckStmt = $conn->prepare("SELECT COUNT(*) as count FROM salary WHERE idEmployee = ?");
$salaryCheckStmt->bind_param("i", $idEmployee);
$salaryCheckStmt->execute();
$salaryResult = $salaryCheckStmt->get_result();
$salaryCount = $salaryResult->fetch_assoc()['count'];
$salaryCheckStmt->close();

if ($salaryCount > 0) {
    echo json_encode([
        "success" => false, 
        "message" => "Không thể xóa nhân viên '" . $employee['nameEmployee'] . "' vì nhân viên này có dữ liệu lương. Vui lòng xóa dữ liệu lương trước."
    ]);
    $conn->close();
    exit();
}

// Thực hiện xóa nhân viên
$stmt = $conn->prepare("DELETE FROM employee WHERE idEmployee = ?");
$stmt->bind_param("i", $idEmployee);

if ($stmt->execute()) {
    if ($stmt->affected_rows > 0) {
        echo json_encode([
            "success" => true, 
            "message" => "Xóa nhân viên '" . $employee['nameEmployee'] . "' thành công"
        ]);
    } else {
        echo json_encode(["success" => false, "message" => "Không tìm thấy nhân viên để xóa"]);
    }
} else {
    echo json_encode(["success" => false, "message" => "Lỗi khi xóa nhân viên: " . $stmt->error]);
}

$stmt->close();
$conn->close();
?>
