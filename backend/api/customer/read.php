<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET");
header("Content-Type: application/json; charset=UTF-8");

include_once '../../config/Database.php';

$database = new Database();
$db = $database->getConnection();

$query = "SELECT * FROM customer ORDER BY created_at DESC";
$curr = $db->query($query);

if ($curr->num_rows > 0) {
    $customers = array();
    while ($row = $curr->fetch_assoc()) {
        array_push($customers, $row);
    }
    echo json_encode(["success" => true, "data" => $customers]);
} else {
    echo json_encode(["success" => true, "data" => []]);
}
?>
