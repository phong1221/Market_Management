<?php
// Bật hiển thị lỗi để debug
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Cấu hình CORS và Content-Type
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Xử lý preflight request (OPTIONS)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Kiểm tra phương thức request
if ($_SERVER['REQUEST_METHOD'] !== 'DELETE') {
    echo json_encode(["success" => false, "message" => "Chỉ chấp nhận phương thức DELETE"]);
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

// Lấy ID sản phẩm từ URL parameter hoặc request body
$idProduct = null;

// Thử lấy từ URL parameter
if (isset($_GET['idProduct'])) {
    $idProduct = $_GET['idProduct'];
} else {
    // Thử lấy từ request body
    $data = json_decode(file_get_contents("php://input"), true);
    if ($data && isset($data['idProduct'])) {
        $idProduct = $data['idProduct'];
    }
}

// Kiểm tra ID sản phẩm
if (!$idProduct || !is_numeric($idProduct)) {
    echo json_encode([
        "success" => false,
        "message" => "ID sản phẩm không hợp lệ"
    ]);
    exit();
}

// Lấy idType của sản phẩm trước khi xóa
$idType = null;
$stmt_get_type = $conn->prepare("SELECT idType FROM product WHERE idProduct = ?");
$stmt_get_type->bind_param("i", $idProduct);
$stmt_get_type->execute();
$result_type = $stmt_get_type->get_result();
if ($result_type->num_rows > 0) {
    $idType = $result_type->fetch_assoc()['idType'];
}
$stmt_get_type->close();

// Kiểm tra sản phẩm có tồn tại không và lấy thông tin số lượng
$checkSql = "SELECT idProduct, nameProduct, amountProduct FROM product WHERE idProduct = ?";
$checkStmt = $conn->prepare($checkSql);
$checkStmt->bind_param("i", $idProduct);
$checkStmt->execute();
$checkResult = $checkStmt->get_result();

if ($checkResult->num_rows === 0) {
    echo json_encode([
        "success" => false,
        "message" => "Sản phẩm không tồn tại"
    ]);
    exit();
}

$productInfo = $checkResult->fetch_assoc();
$checkStmt->close();

// Kiểm tra quy tắc kinh doanh: Không thể xóa sản phẩm nếu số lượng chưa về 0
if ($productInfo['amountProduct'] > 0) {
    echo json_encode([
        "success" => false,
        "message" => "Không thể xóa sản phẩm '" . $productInfo['nameProduct'] . "' vì vẫn còn " . $productInfo['amountProduct'] . " sản phẩm trong kho. Vui lòng bán hết sản phẩm trước khi xóa."
    ]);
    exit();
}

// Chuẩn bị câu lệnh SQL DELETE
$sql = "DELETE FROM product WHERE idProduct = ?";
$stmt = $conn->prepare($sql);

if (!$stmt) {
    echo json_encode([
        "success" => false,
        "message" => "Lỗi chuẩn bị câu lệnh: " . $conn->error
    ]);
    exit();
}

// Bind parameter
$stmt->bind_param("i", $idProduct);

// Thực thi câu lệnh
if ($stmt->execute()) {
    if ($stmt->affected_rows > 0) {
        // Cập nhật tồn kho
        if ($idType !== null) {
            updateInventory($conn, $idType);
        }

        echo json_encode([
            "success" => true,
            "message" => "Xóa sản phẩm '" . $productInfo['nameProduct'] . "' thành công",
            "data" => [
                "idProduct" => $idProduct,
                "nameProduct" => $productInfo['nameProduct']
            ]
        ]);
    } else {
        echo json_encode([
            "success" => false,
            "message" => "Không thể xóa sản phẩm"
        ]);
    }
} else {
    echo json_encode([
        "success" => false,
        "message" => "Lỗi khi xóa sản phẩm: " . $stmt->error
    ]);
}

// Đóng statement và kết nối
$stmt->close();
$conn->close();
?>
