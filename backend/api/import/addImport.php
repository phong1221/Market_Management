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

// Kiểm tra phương thức request
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(["success" => false, "message" => "Chỉ chấp nhận phương thức POST"]);
    exit();
}

require_once '../../config/Database.php';

// Lấy dữ liệu từ body
$data = json_decode(file_get_contents("php://input"), true);

// Kiểm tra dữ liệu đầu vào
if (!isset($data['idProvider'], $data['items']) || 
    !is_array($data['items']) || empty($data['items'])) {
    echo json_encode([
        "success" => false,
        "message" => "Thiếu thông tin import hoặc danh sách sản phẩm"
    ]);
    exit();
}

// Khởi tạo kết nối database
$database = new Database();
$conn = $database->getConnection();

if (!$conn) {
    echo json_encode([
        "success" => false,
        "message" => "Lỗi kết nối cơ sở dữ liệu"
    ]);
    exit();
}

// Bắt đầu transaction
$conn->begin_transaction();

try {
    // 1. Tạo import header
    $importSql = "INSERT INTO import (importDate, idProvider, totalAmount) VALUES (?, ?, ?)";
    $importStmt = $conn->prepare($importSql);
    
    $importDate = isset($data['importDate']) ? $data['importDate'] : date('Y-m-d H:i:s');
    $totalAmount = 0; // Sẽ được cập nhật sau
    
    $importStmt->bind_param("sid",
        $importDate,
        $data['idProvider'],
        $totalAmount
    );
    
    if (!$importStmt->execute()) {
        throw new Exception("Lỗi khi tạo import: " . $importStmt->error);
    }
    
    $idImport = $conn->insert_id;
    
    // 2. Thêm chi tiết sản phẩm
    $detailSql = "INSERT INTO import_detail (idImport, idProduct, quantity, importPrice, exportPrice, totalPrice, notes) VALUES (?, ?, ?, ?, ?, ?, ?)";
    $detailStmt = $conn->prepare($detailSql);
    
    foreach ($data['items'] as $item) {
        // Kiểm tra dữ liệu sản phẩm
        if (!isset($item['idProduct'], $item['quantity'], $item['importPrice'], $item['exportPrice'])) {
            throw new Exception("Thiếu thông tin sản phẩm");
        }
        
        // Tính tổng tiền cho sản phẩm này
        $itemTotalPrice = $item['quantity'] * $item['importPrice'];
        $totalAmount += $itemTotalPrice;
        
        $itemNotes = isset($item['notes']) ? $item['notes'] : '';
        
        $detailStmt->bind_param("iidddds",
            $idImport,
            $item['idProduct'],
            $item['quantity'],
            $item['importPrice'],
            $item['exportPrice'],
            $itemTotalPrice,
            $itemNotes
        );
        
        if (!$detailStmt->execute()) {
            throw new Exception("Lỗi khi thêm chi tiết sản phẩm: " . $detailStmt->error);
        }
    }
    
    // 3. Cập nhật tổng tiền import
    $updateSql = "UPDATE import SET totalAmount = ? WHERE idImport = ?";
    $updateStmt = $conn->prepare($updateSql);
    $updateStmt->bind_param("di", $totalAmount, $idImport);
    
    if (!$updateStmt->execute()) {
        throw new Exception("Lỗi khi cập nhật tổng tiền: " . $updateStmt->error);
    }
    
    // Commit transaction
    $conn->commit();
    
    echo json_encode([
        "success" => true,
        "message" => "Tạo import thành công",
        "idImport" => $idImport,
        "totalAmount" => $totalAmount
    ]);
    
} catch (Exception $e) {
    // Rollback transaction nếu có lỗi
    $conn->rollback();
    
    echo json_encode([
        "success" => false,
        "message" => "Lỗi khi tạo import: " . $e->getMessage()
    ]);
} finally {
    // Đóng các statement
    if (isset($importStmt)) $importStmt->close();
    if (isset($detailStmt)) $detailStmt->close();
    if (isset($updateStmt)) $updateStmt->close();
    
    // Đóng kết nối
    $conn->close();
}
?>
