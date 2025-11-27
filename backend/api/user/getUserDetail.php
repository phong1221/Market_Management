<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS"); 
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once '../../config/Database.php';

try {
    $idUser = $_GET['idUser'] ?? null;
    
    if (!$idUser) {
        throw new Exception('User ID is required');
    }

    $database = new Database();
    $db = $database->getConnection();

    // Get user basic info
    $user_query = "SELECT * FROM useraccount WHERE idUser = ?";
    $user_stmt = $db->prepare($user_query);
    $user_stmt->bind_param("i", $idUser);
    $user_stmt->execute();
    $user_result = $user_stmt->get_result();
    $user = $user_result->fetch_assoc();

    if (!$user) {
        throw new Exception('User not found');
    }

    // Get user detailed info
    $detail_query = "SELECT * FROM inforuser WHERE idUser = ?";
    $detail_stmt = $db->prepare($detail_query);
    $detail_stmt->bind_param("i", $idUser);
    $detail_stmt->execute();
    $detail_result = $detail_stmt->get_result();
    $userInfo = $detail_result->fetch_assoc();

    $response = [
        'success' => true,
        'message' => 'User info retrieved successfully',
        'user' => $user,
        'userInfo' => $userInfo
    ];

    echo json_encode($response);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error: ' . $e->getMessage()
    ]);
}
?> 