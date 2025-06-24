<?php
// Set CORS headers
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit;
}

require_once '../../config/Database.php';
header('Content-Type: application/json');

$db = new Database();
$conn = $db->getConnection();

$sql = 'SELECT * FROM typeproduct';
$result = $conn->query($sql);
$typeProducts = [];
if ($result && $result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        $typeProducts[] = $row;
    }
}
echo json_encode(['success' => true, 'data' => $typeProducts]);
$conn->close();
