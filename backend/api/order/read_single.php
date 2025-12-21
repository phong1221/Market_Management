<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

require_once '../../config/Database.php';

$id = isset($_GET['id']) ? $_GET['id'] : die();

try {
    $database = new Database();
    $conn = $database->getConnection();

    if (!$conn) {
        throw new Exception('Không thể kết nối cơ sở dữ liệu');
    }

    $query = "SELECT * FROM `order` WHERE idOrder = ?";
    $stmt = $conn->prepare($query);
    $stmt->bind_param("i", $id);
    $stmt->execute();
    $result = $stmt->get_result();
    $order = $result->fetch_assoc();

    if ($order) {
        // Get order details
        $detailQuery = "SELECT 
                          od.idProduct,
                          p.nameProduct,
                          od.quantity,
                          od.unitPrice,
                          od.totalPrice,
                          p.picture
                        FROM `order_detail` od
                        LEFT JOIN `product` p ON od.idProduct = p.idProduct
                        WHERE od.idOrder = ?";
        
        $detailStmt = $conn->prepare($detailQuery);
        $detailStmt->bind_param("i", $id);
        $detailStmt->execute();
        $detailResult = $detailStmt->get_result();
        
        $products = [];
        while ($row = $detailResult->fetch_assoc()) {
            $products[] = $row;
        }
        
        $order['products'] = $products; // Standardize as 'products' for frontend
        
        echo json_encode($order);
    } else {
        echo json_encode(['message' => 'Order not found']);
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['message' => $e->getMessage()]);
}
?>
