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

    $idUser = isset($_GET['idUser']) ? intval($_GET['idUser']) : 0;

    // Fetch all active coupons
    $query = "SELECT * FROM coupon WHERE status = 'active' AND quantity > 0 AND expiry_date >= CURDATE()";
    $result = $conn->query($query);

    $coupons = [];
    if ($result) {
        while ($row = $result->fetch_assoc()) {
            // Check if user has already claimed this coupon
            $isClaimed = false;
            if ($idUser > 0) {
                $checkQuery = "SELECT id FROM user_coupon WHERE idUser = ? AND coupon_code = ?";
                $stmt = $conn->prepare($checkQuery);
                $stmt->bind_param("is", $idUser, $row['code']);
                $stmt->execute();
                $checkResult = $stmt->get_result();
                if ($checkResult->num_rows > 0) {
                    $isClaimed = true;
                }
                $stmt->close();
            }
            $row['isClaimed'] = $isClaimed;
            $coupons[] = $row;
        }
    }

    echo json_encode(['success' => true, 'data' => $coupons]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>
