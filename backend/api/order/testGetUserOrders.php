<?php
// Test script để kiểm tra getUserOrders
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

require_once '../../config/Database.php';

try {
    $database = new Database();
    $conn = $database->getConnection();

    if (!$conn) {
        die(json_encode(['error' => 'Không thể kết nối database']));
    }

    // Test với idUser = 2 (có nhiều đơn hàng trong database)
    $idUser = isset($_GET['idUser']) ? intval($_GET['idUser']) : 2;

    echo "Testing getUserOrders for idUser = $idUser\n\n";

    // Test 1: Kiểm tra có đơn hàng nào không
    $testQuery = "SELECT COUNT(*) as count FROM `order` WHERE idUser = ?";
    $testStmt = $conn->prepare($testQuery);
    $testStmt->bind_param("i", $idUser);
    $testStmt->execute();
    $testResult = $testStmt->get_result();
    $count = $testResult->fetch_assoc()['count'];
    echo "Total orders for user $idUser: $count\n\n";

    // Test 2: Lấy một vài đơn hàng mẫu
    $sampleQuery = "SELECT idOrder, idUser, nameUser, Status, totalAmount 
                    FROM `order` 
                    WHERE idUser = ? 
                    ORDER BY idOrder DESC 
                    LIMIT 5";
    $sampleStmt = $conn->prepare($sampleQuery);
    $sampleStmt->bind_param("i", $idUser);
    $sampleStmt->execute();
    $sampleResult = $sampleStmt->get_result();
    
    echo "Sample orders:\n";
    while ($row = $sampleResult->fetch_assoc()) {
        echo "  - Order #{$row['idOrder']}: {$row['nameUser']}, Status: {$row['Status']}, Amount: {$row['totalAmount']}\n";
    }
    echo "\n";

    // Test 3: Chạy query chính
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
        die("Error preparing query: " . $conn->error);
    }

    $stmt->bind_param("i", $idUser);
    $stmt->execute();
    $result = $stmt->get_result();

    $orders = [];
    while ($row = $result->fetch_assoc()) {
        // Get order details
        $idOrder = $row['idOrder'];
        $detailQuery = "SELECT idProduct, quantity, unitPrice, totalPrice 
                        FROM `order_detail` 
                        WHERE idOrder = ?";
        $detailStmt = $conn->prepare($detailQuery);
        $detailStmt->bind_param("i", $idOrder);
        $detailStmt->execute();
        $detailResult = $detailStmt->get_result();
        
        $details = [];
        while ($detailRow = $detailResult->fetch_assoc()) {
            $details[] = $detailRow;
        }
        $detailStmt->close();
        
        $row['orderDetails'] = $details;
        $orders[] = $row;
    }

    $stmt->close();

    echo json_encode([
        'success' => true,
        'testUser' => $idUser,
        'totalOrders' => count($orders),
        'data' => $orders
    ], JSON_PRETTY_PRINT);

} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ], JSON_PRETTY_PRINT);
}
?>

