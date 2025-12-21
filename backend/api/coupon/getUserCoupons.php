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
    if (!isset($_GET['idUser'])) {
        throw new Exception("Thiếu idUser");
    }
    $idUser = intval($_GET['idUser']);

    $database = new Database();
    $conn = $database->getConnection();

    $query = "SELECT 
                c.*, 
                uc.status as user_coupon_status 
              FROM user_coupon uc
              JOIN coupon c ON uc.coupon_code = c.code (
              WHERE uc.idUser = ? AND uc.status = 'available' AND c.expiry_date >= CURDATE() AND c.status = 'active'";
    
    // Fix syntax above: remove accidental parenthesis
    $query = "SELECT 
                c.*, 
                uc.status as user_coupon_status 
              FROM user_coupon uc
              JOIN coupon c ON uc.coupon_code = c.code 
              WHERE uc.idUser = ? AND uc.status = 'available' AND c.expiry_date >= CURDATE() AND c.status = 'active'";

    $stmt = $conn->prepare($query);
    $stmt->bind_param("i", $idUser);
    $stmt->execute();
    $result = $stmt->get_result();

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
