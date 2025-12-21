<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

header("Content-Type: application/json; charset=UTF-8");

require_once '../../config/Database.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'message' => 'Method not allowed'
    ]);
    exit();
}

try {
    $database = new Database();
    $conn = $database->getConnection();

    if (!$conn) {
        throw new Exception('Không thể kết nối cơ sở dữ liệu');
    }

    $query = "SELECT * FROM `order` ORDER BY idOrder DESC";
    $result = $conn->query($query);

    $orders = [];
    if ($result) {
        while ($row = $result->fetch_assoc()) {
            $idOrder = $row['idOrder'];
            
            // Get order details
            $detailQuery = "SELECT 
                              od.idProduct,
                              p.nameProduct,
                              od.quantity,
                              od.unitPrice as price,
                              od.totalPrice
                            FROM `order_detail` od
                            LEFT JOIN `product` p ON od.idProduct = p.idProduct
                            WHERE od.idOrder = ?";
            
            $detailStmt = $conn->prepare($detailQuery);
            if ($detailStmt) {
                $detailStmt->bind_param("i", $idOrder);
                $detailStmt->execute();
                $detailResult = $detailStmt->get_result();
                
                $details = [];
                if ($detailResult) {
                     while ($detailRow = $detailResult->fetch_assoc()) {
                         $details[] = $detailRow;
                     }
                }
                $detailStmt->close();
            }
            
            $row['details'] = $details;
            $orders[] = $row;
        }
    }

    echo json_encode([
        'success' => true,
        'data' => $orders
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>
