<?php

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}
header("Content-Type: application/json; charset=UTF-8");

require_once '../../config/Database.php';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        $database = new Database();
        $db = $database->getConnection();
        
        $query = "SELECT * FROM brand ORDER BY idBrand";
        $result = $db->query($query);
        
        $brands = [];
        if ($result) {
            while ($row = $result->fetch_assoc()) {
                $brands[] = $row;
            }
        }
        
        echo json_encode([
            'success' => true,
            'data' => $brands
        ]);
        
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => $e->getMessage()
        ]);
    }
} else {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
}
?> 