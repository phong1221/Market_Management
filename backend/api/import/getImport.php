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
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    echo json_encode(["success" => false, "message" => "Chỉ chấp nhận phương thức GET"]);
    exit();
}

require_once '../../config/Database.php';

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

// Lấy idImport từ query string nếu có (để lấy chi tiết)
$idImport = isset($_GET['idImport']) ? intval($_GET['idImport']) : null;

if ($idImport) {
    // Lấy chi tiết import cụ thể
    $sql = "SELECT 
                i.*,
                p.nameProvider as providerName
            FROM import i
            LEFT JOIN provider p ON i.idProvider = p.idProvider
            WHERE i.idImport = ?";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $idImport);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result && $result->num_rows > 0) {
        $importData = $result->fetch_assoc();
        
        // Lấy chi tiết sản phẩm
        $detailSql = "SELECT 
                        pr.nameProduct,
                        id.*,
                        pr.picture as productPicture
                    FROM import_detail id
                    LEFT JOIN product pr ON id.idProduct = pr.idProduct
                    WHERE id.idImport = ?";
        
        $detailStmt = $conn->prepare($detailSql);
        $detailStmt->bind_param("i", $idImport);
        $detailStmt->execute();
        $detailResult = $detailStmt->get_result();
        
        $details = [];
        while ($detail = $detailResult->fetch_assoc()) {
            $details[] = $detail;
        }
        
        echo json_encode([
            "success" => true,
            "data" => [
                "import" => $importData,
                "details" => $details
            ]
        ]);
    } else {
        echo json_encode([
            "success" => false,
            "message" => "Không tìm thấy import với ID: " . $idImport
        ]);
    }
    
    $stmt->close();
    if (isset($detailStmt)) $detailStmt->close();
} else {
    // Lấy danh sách tất cả import
    $sql = "SELECT 
                i.*,
                p.nameProvider as providerName,
                COUNT(id.idImportDetail) as itemCount
            FROM import i
            LEFT JOIN provider p ON i.idProvider = p.idProvider
            LEFT JOIN import_detail id ON i.idImport = id.idImport
            GROUP BY i.idImport
            ORDER BY i.importDate DESC";
    
    $result = $conn->query($sql);
    
    if ($result) {
        $imports = [];
        while ($row = $result->fetch_assoc()) {
            $imports[] = [
                "idImport" => $row["idImport"],
                "importDate" => $row["importDate"],
                "idProvider" => $row["idProvider"],
                "totalAmount" => $row["totalAmount"],
                "providerName" => $row["providerName"],
                "itemCount" => $row["itemCount"]
            ];
        }
        echo json_encode([
            "success" => true,
            "data" => $imports
        ]);
    } else {
        echo json_encode([
            "success" => false,
            "message" => "Lỗi khi lấy danh sách import: " . $conn->error
        ]);
    }
}

// Đóng kết nối
$conn->close();
?>
