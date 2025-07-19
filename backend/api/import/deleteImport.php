<?php
// Bật hiển thị lỗi để debug
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Cấu hình CORS và Content-Type
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=UTF-8");

// Xử lý preflight request (OPTIONS)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Chấp nhận DELETE, GET hoặc POST
if ($_SERVER['REQUEST_METHOD'] !== 'DELETE' && $_SERVER['REQUEST_METHOD'] !== 'GET' && $_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(["success" => false, "message" => "Chỉ chấp nhận phương thức DELETE, GET hoặc POST"]);
    exit();
}

require_once '../../config/Database.php';

// Lấy idImport từ query string hoặc body
$idImport = null;
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);
    $idImport = isset($data['idImport']) ? intval($data['idImport']) : null;
} else {
    $idImport = isset($_GET['idImport']) ? intval($_GET['idImport']) : null;
}

if ($idImport === null || $idImport <= 0) {
    echo json_encode(["success" => false, "message" => "Thiếu idImport hoặc id không hợp lệ"]);
    exit();
}

$database = new Database();
$conn = $database->getConnection();
if (!$conn) {
    echo json_encode(["success" => false, "message" => "Lỗi kết nối cơ sở dữ liệu"]);
    exit();
}

// Bắt đầu transaction
$conn->begin_transaction();

try {
    // 1. Kiểm tra xem import có tồn tại không
    $checkSql = "SELECT idImport, importDate, idProvider, totalAmount FROM import WHERE idImport = ?";
    $checkStmt = $conn->prepare($checkSql);
    $checkStmt->bind_param("i", $idImport);
    $checkStmt->execute();
    $result = $checkStmt->get_result();
    
    if ($result->num_rows === 0) {
        throw new Exception("Không tìm thấy import với ID: " . $idImport);
    }
    
    $importData = $result->fetch_assoc();
    
    // 2. Xóa chi tiết import
    $deleteDetailSql = "DELETE FROM import_detail WHERE idImport = ?";
    $deleteDetailStmt = $conn->prepare($deleteDetailSql);
    $deleteDetailStmt->bind_param("i", $idImport);
    
    if (!$deleteDetailStmt->execute()) {
        throw new Exception("Lỗi khi xóa chi tiết import: " . $deleteDetailStmt->error);
    }
    
    // 3. Xóa import header
    $deleteImportSql = "DELETE FROM import WHERE idImport = ?";
    $deleteImportStmt = $conn->prepare($deleteImportSql);
    $deleteImportStmt->bind_param("i", $idImport);
    
    if (!$deleteImportStmt->execute()) {
        throw new Exception("Lỗi khi xóa import: " . $deleteImportStmt->error);
    }
    
    if ($deleteImportStmt->affected_rows === 0) {
        throw new Exception("Không thể xóa import. Có thể đã bị xóa trước đó.");
    }
    
    // Commit transaction
    $conn->commit();
    
    echo json_encode([
        "success" => true,
        "message" => "Xóa import thành công. Import ID: " . $idImport
    ]);
    
} catch (Exception $e) {
    // Rollback transaction nếu có lỗi
    $conn->rollback();
    
    echo json_encode([
        "success" => false,
        "message" => "Lỗi khi xóa import: " . $e->getMessage()
    ]);
} finally {
    // Đóng các statement
    if (isset($checkStmt)) $checkStmt->close();
    if (isset($deleteDetailStmt)) $deleteDetailStmt->close();
    if (isset($deleteImportStmt)) $deleteImportStmt->close();
    
    // Đóng kết nối
    $conn->close();
}
?>
