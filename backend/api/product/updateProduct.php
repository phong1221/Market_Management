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

// Kiểm tra phương thức request
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(["success" => false, "message" => "Chỉ chấp nhận phương thức POST"]);
    exit();
}

require_once '../../config/Database.php';
require_once '../typeProduct/updateInventory.php';

// Khởi tạo kết nối database
$database = new Database();
$conn = $database->getConnection();

// Kiểm tra kết nối
if (!$conn) {
    echo json_encode([
        "success" => false,
        "message" => "Lỗi kết nối cơ sở dữ liệu"
    ]);
    exit();
}

// Lấy dữ liệu từ form-data
$data = $_POST;
$picture_file = isset($_FILES['picture']) ? $_FILES['picture'] : null;

// Kiểm tra dữ liệu đầu vào
if (empty($data)) {
    echo json_encode([
        "success" => false,
        "message" => "Dữ liệu không hợp lệ"
    ]);
    exit();
}

// Kiểm tra idProduct
if (!isset($data['idProduct']) || !is_numeric($data['idProduct'])) {
    echo json_encode([
        "success" => false,
        "message" => "ID sản phẩm không hợp lệ"
    ]);
    exit();
}

// Lấy idType cũ của sản phẩm trước khi cập nhật
$oldIdType = null;
$stmt_get_old = $conn->prepare("SELECT idType, picture FROM product WHERE idProduct = ?");
$stmt_get_old->bind_param("i", $data['idProduct']);
$stmt_get_old->execute();
$result_old = $stmt_get_old->get_result();
if ($result_old->num_rows > 0) {
    $old_product = $result_old->fetch_assoc();
    $oldIdType = $old_product['idType'];
    $existing_picture_name = $old_product['picture'];
}
$stmt_get_old->close();

// Kiểm tra sản phẩm có tồn tại không
$checkSql = "SELECT idProduct FROM product WHERE idProduct = ?";
$checkStmt = $conn->prepare($checkSql);
$checkStmt->bind_param("i", $data['idProduct']);
$checkStmt->execute();
$checkResult = $checkStmt->get_result();

if ($checkResult->num_rows === 0) {
    echo json_encode([
        "success" => false,
        "message" => "Sản phẩm không tồn tại"
    ]);
    exit();
}
$checkStmt->close();

// Handle file upload
$picture_name = $existing_picture_name ?? "";
if ($picture_file && $picture_file['error'] == 0) {
    $target_dir = "../../uploads/";
    // Create directory if it doesn't exist
    if (!is_dir($target_dir)) {
        mkdir($target_dir, 0777, true);
    }
    $picture_name = basename($picture_file["name"]);
    $target_file = $target_dir . $picture_name;
    
    // Create a unique filename if needed
    if (file_exists($target_file)) {
      $picture_name = time() . "_" . $picture_name;
      $target_file = $target_dir . $picture_name;
    }

    if (move_uploaded_file($picture_file["tmp_name"], $target_file)) {
      // Optionally, delete the old picture if it's different
      if (!empty($existing_picture_name) && $existing_picture_name != $picture_name && file_exists($target_dir . $existing_picture_name)) {
          unlink($target_dir . $existing_picture_name);
      }
    } else {
        echo json_encode(["success" => false, "message" => "Lỗi khi tải ảnh lên."]);
        exit();
    }
}

// Validate required fields
$required_fields = ['nameProduct', 'descriptionProduct', 'idProvider', 'idType', 'importCost', 'exportCost', 'idBrand'];
foreach ($required_fields as $field) {
    if (!isset($data[$field]) || (is_string($data[$field]) && empty($data[$field]))) {
        echo json_encode([
            "success" => false,
            "message" => "Thiếu thông tin bắt buộc: " . $field
        ]);
        exit();
    }
}

// Validate amountProduct (có thể = 0)
if (!isset($data['amountProduct']) || !is_numeric($data['amountProduct'])) {
    echo json_encode([
        "success" => false,
        "message" => "Số lượng sản phẩm phải là số hợp lệ"
    ]);
    exit();
}

// Validate numeric fields
if (!is_numeric($data['idProvider']) || !is_numeric($data['idType']) || 
    !is_numeric($data['importCost']) || !is_numeric($data['exportCost']) || 
    !is_numeric($data['idBrand'])) {
    echo json_encode([
        "success" => false,
        "message" => "Các trường số phải là giá trị số hợp lệ"
    ]);
    exit();
}

// Validate amountProduct >= 0
if ($data['amountProduct'] < 0) {
    echo json_encode([
        "success" => false,
        "message" => "Số lượng sản phẩm không thể âm"
    ]);
    exit();
}

// Validate costs > 0
if ($data['importCost'] <= 0 || $data['exportCost'] <= 0) {
    echo json_encode([
        "success" => false,
        "message" => "Giá nhập và giá bán phải lớn hơn 0"
    ]);
    exit();
}

// Chuẩn bị câu lệnh SQL UPDATE
$sql = "UPDATE product SET 
        nameProduct = ?, 
        picture = ?, 
        descriptionProduct = ?, 
        idProvider = ?, 
        amountProduct = ?, 
        idType = ?, 
        importCost = ?, 
        exportCost = ?, 
        idPromotion = ?, 
        idBrand = ? 
        WHERE idProduct = ?";

$stmt = $conn->prepare($sql);

if (!$stmt) {
    echo json_encode([
        "success" => false,
        "message" => "Lỗi chuẩn bị câu lệnh: " . $conn->error
    ]);
    exit();
}

// Bind parameters
$idPromotion = isset($data['idPromotion']) ? ($data['idPromotion'] === 'null' ? null : $data['idPromotion']) : null;
$stmt->bind_param("sssiiiddiii", 
    $data['nameProduct'],
    $picture_name,
    $data['descriptionProduct'],
    $data['idProvider'],
    $data['amountProduct'],
    $data['idType'],
    $data['importCost'],
    $data['exportCost'],
    $idPromotion,
    $data['idBrand'],
    $data['idProduct']
);

// Thực thi câu lệnh
if ($stmt->execute()) {
    if ($stmt->affected_rows > 0) {
        // Cập nhật tồn kho cho loại sản phẩm mới
        updateInventory($conn, $data['idType']);

        // Nếu loại sản phẩm đã thay đổi, cập nhật cả loại sản phẩm cũ
        if ($oldIdType !== null && $oldIdType != $data['idType']) {
            updateInventory($conn, $oldIdType);
        }

        echo json_encode([
            "success" => true,
            "message" => "Cập nhật sản phẩm thành công",
            "data" => [
                "idProduct" => $data['idProduct'],
                "nameProduct" => $data['nameProduct'],
                "picture" => $picture_name,
                "descriptionProduct" => $data['descriptionProduct'],
                "idProvider" => $data['idProvider'],
                "amountProduct" => $data['amountProduct'],
                "idType" => $data['idType'],
                "importCost" => $data['importCost'],
                "exportCost" => $data['exportCost'],
                "idPromotion" => $idPromotion,
                "idBrand" => $data['idBrand']
            ]
        ]);
    } else {
        echo json_encode([
            "success" => false,
            "message" => "Không có thay đổi nào được thực hiện"
        ]);
    }
} else {
    echo json_encode([
        "success" => false,
        "message" => "Lỗi khi cập nhật sản phẩm: " . $stmt->error
    ]);
}

// Đóng statement và kết nối
$stmt->close();
$conn->close();
?>
