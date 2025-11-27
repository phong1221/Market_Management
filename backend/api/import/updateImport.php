<?php
// Bật hiển thị lỗi để debug
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Cấu hình CORS và Content-Type
header("Access-Control-Allow-Origin: *");
// SỬA DÒNG NÀY: Thêm chữ DELETE vào
header("Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS"); 
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Chấp nhận POST hoặc PUT
if ($_SERVER['REQUEST_METHOD'] !== 'POST' && $_SERVER['REQUEST_METHOD'] !== 'PUT') {
    echo json_encode(["success" => false, "message" => "Chỉ chấp nhận phương thức POST hoặc PUT"]);
    exit();
}

require_once '../../config/Database.php';

// Lấy dữ liệu từ body
$data = json_decode(file_get_contents("php://input"), true);

// Kiểm tra dữ liệu đầu vào
if (!isset($data['idImport'], $data['idProvider'], $data['items']) || 
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
    // 1. Cập nhật import header
    $importSql = "UPDATE import SET importDate = ?, idProvider = ? WHERE idImport = ?";
    $importStmt = $conn->prepare($importSql);
    
    $importDate = isset($data['importDate']) ? $data['importDate'] : date('Y-m-d H:i:s');
    
    $importStmt->bind_param("sii",
        $importDate,
        $data['idProvider'],
        $data['idImport']
    );
    
    if (!$importStmt->execute()) {
        throw new Exception("Lỗi khi cập nhật import: " . $importStmt->error);
    }
    
    // 2. Xóa tất cả chi tiết cũ
    // 2.1. Trước khi xóa chi tiết cũ, trừ số lượng khỏi sản phẩm
    $selectOldDetailsSql = "SELECT idProduct, quantity FROM import_detail WHERE idImport = ?";
    $selectOldDetailsStmt = $conn->prepare($selectOldDetailsSql);
    $selectOldDetailsStmt->bind_param("i", $data['idImport']);
    $selectOldDetailsStmt->execute();
    $oldDetailsResult = $selectOldDetailsStmt->get_result();
    while ($row = $oldDetailsResult->fetch_assoc()) {
        $updateProductSql = "UPDATE product SET amountProduct = amountProduct - ? WHERE idProduct = ?";
        $updateProductStmt = $conn->prepare($updateProductSql);
        $updateProductStmt->bind_param("di", $row['quantity'], $row['idProduct']);
        if (!$updateProductStmt->execute()) {
            throw new Exception("Lỗi khi cập nhật số lượng sản phẩm cũ: " . $updateProductStmt->error);
        }
        $updateProductStmt->close();

        // Lấy idType của sản phẩm để cập nhật tồn kho danh mục
        $getTypeSql = "SELECT idType FROM product WHERE idProduct = ?";
        $getTypeStmt = $conn->prepare($getTypeSql);
        $getTypeStmt->bind_param("i", $row['idProduct']);
        $getTypeStmt->execute();
        $getTypeResult = $getTypeStmt->get_result();
        if ($rowType = $getTypeResult->fetch_assoc()) {
            require_once '../typeProduct/updateInventory.php';
            updateInventory($conn, $rowType['idType']);
        }
        $getTypeStmt->close();
    }
    $selectOldDetailsStmt->close();
    
    // 3. Thêm chi tiết sản phẩm mới
    $detailSql = "INSERT INTO import_detail (idImport, idProduct, quantity, importPrice, exportPrice, totalPrice, notes) VALUES (?, ?, ?, ?, ?, ?, ?)";
    $detailStmt = $conn->prepare($detailSql);
    
    $totalAmount = 0;
    
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
            $data['idImport'],
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
        
        // Sau khi thêm chi tiết mới, cộng số lượng vào sản phẩm
        $updateProductSql = "UPDATE product SET amountProduct = amountProduct + ? WHERE idProduct = ?";
        $updateProductStmt = $conn->prepare($updateProductSql);
        $updateProductStmt->bind_param("di", $item['quantity'], $item['idProduct']);
        if (!$updateProductStmt->execute()) {
            throw new Exception("Lỗi khi cập nhật số lượng sản phẩm mới: " . $updateProductStmt->error);
        }
        $updateProductStmt->close();

        // Lấy idType của sản phẩm để cập nhật tồn kho danh mục
        $getTypeSql = "SELECT idType FROM product WHERE idProduct = ?";
        $getTypeStmt = $conn->prepare($getTypeSql);
        $getTypeStmt->bind_param("i", $item['idProduct']);
        $getTypeStmt->execute();
        $getTypeResult = $getTypeStmt->get_result();
        if ($rowType = $getTypeResult->fetch_assoc()) {
            require_once '../typeProduct/updateInventory.php';
            updateInventory($conn, $rowType['idType']);
        }
        $getTypeStmt->close();
    }
    
    // 4. Cập nhật tổng tiền import
    $updateSql = "UPDATE import SET totalAmount = ? WHERE idImport = ?";
    $updateStmt = $conn->prepare($updateSql);
    $updateStmt->bind_param("di", $totalAmount, $data['idImport']);
    
    if (!$updateStmt->execute()) {
        throw new Exception("Lỗi khi cập nhật tổng tiền: " . $updateStmt->error);
    }
    
    // Commit transaction
    $conn->commit();
    
    echo json_encode([
        "success" => true,
        "message" => "Cập nhật import thành công",
        "totalAmount" => $totalAmount
    ]);
    
} catch (Exception $e) {
    // Rollback transaction nếu có lỗi
    $conn->rollback();
    
    echo json_encode([
        "success" => false,
        "message" => "Lỗi khi cập nhật import: " . $e->getMessage()
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
