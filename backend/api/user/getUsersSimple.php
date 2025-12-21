<?php
// getUsersSimple.php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

include_once '../../config/Database.php';

try {
    $database = new Database();
    $db = $database->getConnection();

    // Select directly from customer table as requested
    $query = "SELECT idUser, fullName as nameUser, phoneNumber as phone, address FROM customer ORDER BY fullName ASC";
    $stmt = $db->prepare($query);
    $stmt->execute();
    $result = $stmt->get_result();

    $users = [];
    if ($result->num_rows > 0) {
        while ($row = $result->fetch_assoc()) {
            $users[] = $row;
        }
    }

    echo json_encode([
        'success' => true,
        'data' => $users
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>
