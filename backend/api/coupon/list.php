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

try {
    $database = new Database();
    $conn = $database->getConnection();

    $query = "SELECT * FROM coupon ORDER BY expiry_date DESC";
    $result = $conn->query($query);

    $coupons = [];
    if ($result) {
        while ($row = $result->fetch_assoc()) {
            $coupons[] = $row;
        }
    }

    echo json_encode(['success' => true, 'data' => $coupons]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>
