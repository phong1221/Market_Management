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

    // Get user ID from query parameter
    $idUser = isset($_GET['idUser']) ? intval($_GET['idUser']) : 0;

    // Log for debugging
    error_log("getUserOrders - idUser: " . $idUser);

    if ($idUser <= 0) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'Thiếu idUser hoặc idUser không hợp lệ'
        ]);
        exit();
    }

    // Get orders for this user
    // Note: Bảng order chỉ có totalAmount, không có exportOrderPayment
    $query = "SELECT 
                idOrder,
                idUser,
                nameUser,
                address,
                phone,
                methodpayment,
                Status,
                COALESCE(totalAmount, 0) as totalAmount
              FROM `order`
              WHERE idUser = ?
              ORDER BY idOrder DESC";

    $stmt = $conn->prepare($query);
    if (!$stmt) {
        throw new Exception('Lỗi chuẩn bị truy vấn: ' . $conn->error);
    }

    $stmt->bind_param("i", $idUser);
    $stmt->execute();
    $result = $stmt->get_result();

    // Log number of orders found
    $orderCount = $result ? $result->num_rows : 0;
    error_log("getUserOrders - Found $orderCount orders for user $idUser");

    $orders = [];
    if ($result) {
        while ($row = $result->fetch_assoc()) {
            $idOrder = $row['idOrder'];
            
            // Get order details for this order
            $detailQuery = "SELECT 
                              idProduct,
                              quantity,
                              unitPrice,
                              totalPrice
                            FROM `order_detail`
                            WHERE idOrder = ?";
            
            $detailStmt = $conn->prepare($detailQuery);
            if ($detailStmt) {
                $detailStmt->bind_param("i", $idOrder);
                $detailStmt->execute();
                $detailResult = $detailStmt->get_result();
                
                $details = [];
                if ($detailResult) {
                    while ($detailRow = $detailResult->fetch_assoc()) {
                        $details[] = [
                            'idProduct' => intval($detailRow['idProduct']),
                            'quantity' => intval($detailRow['quantity']),
                            'unitPrice' => floatval($detailRow['unitPrice']),
                            'totalPrice' => floatval($detailRow['totalPrice'])
                        ];
                    }
                }
                $detailStmt->close();
            }
            
            $row['orderDetails'] = $details;
            $orders[] = $row;
        }
    }

    $stmt->close();

    // Log final result
    error_log("getUserOrders - Returning " . count($orders) . " orders");
    if (count($orders) > 0) {
        error_log("getUserOrders - First order: " . json_encode($orders[0]));
    }

    echo json_encode([
        'success' => true,
        'data' => $orders,
        'debug' => [
            'idUser' => $idUser,
            'orderCount' => count($orders)
        ]
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>

