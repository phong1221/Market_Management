<?php
// Bật hiển thị lỗi để debug
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Cấu hình CORS và Content-Type
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

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

// Handle file upload
$picture_name = "";
if ($picture_file && $picture_file['error'] == 0) {
    $target_dir = "../../uploads/"; // Corrected path
    if (!is_dir($target_dir)) {
        mkdir($target_dir, 0777, true);
    }
    $picture_name = basename($picture_file["name"]);
    $target_file = $target_dir . $picture_name;
    
    if (file_exists($target_file)) {
      $picture_name = time() . "_" . $picture_name;
      $target_file = $target_dir . $picture_name;
    }

    if (!move_uploaded_file($picture_file["tmp_name"], $target_file)) {
        echo json_encode(["success" => false, "message" => "Lỗi khi tải ảnh lên."]);
        exit();
    }
} else if (isset($data['picture']) && !empty($data['picture'])) {
    $picture_name = basename($data['picture']);
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

// Chuẩn bị câu lệnh SQL
$sql = "INSERT INTO product (nameProduct, picture, descriptionProduct, idProvider, amountProduct, idType, importCost, exportCost, idPromotion, idBrand) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

$stmt = $conn->prepare($sql);

if (!$stmt) {
    echo json_encode([
        "success" => false,
        "message" => "Lỗi chuẩn bị câu lệnh: " . $conn->error
    ]);
    exit();
}

// Bind parameters
$idPromotion = isset($data['idPromotion']) && $data['idPromotion'] !== 'null' && !empty($data['idPromotion']) ? $data['idPromotion'] : null;
$stmt->bind_param("sssiiiddii", 
    $data['nameProduct'],
    $picture_name,
    $data['descriptionProduct'],
    $data['idProvider'],
    $data['amountProduct'],
    $data['idType'],
    $data['importCost'],
    $data['exportCost'],
    $idPromotion,
    $data['idBrand']
);

// Thực thi câu lệnh
if ($stmt->execute()) {
    $newId = $conn->insert_id;

    // Update inventory for the product type
    updateInventory($conn, $data['idType']);

    echo json_encode([
        "success" => true,
        "message" => "Thêm sản phẩm thành công",
        "data" => [
            "idProduct" => $newId,
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
        "message" => "Lỗi khi thêm sản phẩm: " . $stmt->error
    ]);
}

// Đóng statement và kết nối
$stmt->close();
$conn->close();
?>
