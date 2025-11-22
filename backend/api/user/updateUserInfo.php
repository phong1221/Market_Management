<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once '../../config/Database.php';

try {
    $input = json_decode(file_get_contents('php://input'), true);
    
    $idUser = $input['idUser'] ?? null;
    $fullName = $input['fullName'] ?? '';
    $age = $input['age'] ?? 0;
    $address = $input['address'] ?? '';
    $phone = $input['phone'] ?? 0;
    
    if (!$idUser) {
        throw new Exception('User ID is required');
    }

    $database = new Database();
    $db = $database->getConnection();

    // Check if user exists
    $check_query = "SELECT * FROM useraccount WHERE idUser = ?";
    $check_stmt = $db->prepare($check_query);
    $check_stmt->bind_param("i", $idUser);
    $check_stmt->execute();
    $check_result = $check_stmt->get_result();
    
    if ($check_result->num_rows === 0) {
        throw new Exception('User not found');
    }

    // Check if user info already exists
    $info_query = "SELECT * FROM inforuser WHERE idUser = ?";
    $info_stmt = $db->prepare($info_query);
    $info_stmt->bind_param("i", $idUser);
    $info_stmt->execute();
    $info_result = $info_stmt->get_result();
    $existing_info = $info_result->fetch_assoc();

    if ($existing_info) {
        // Update existing user info
        $update_query = "UPDATE inforuser SET fullName = ?, age = ?, address = ?, phone = ? WHERE idUser = ?";
        $update_stmt = $db->prepare($update_query);
        $update_stmt->bind_param("sisii", $fullName, $age, $address, $phone, $idUser);
        $update_stmt->execute();
        
        if ($update_stmt->affected_rows >= 0) {
            $response = [
                'success' => true,
                'message' => 'User info updated successfully'
            ];
        } else {
            throw new Exception('Failed to update user info');
        }
    } else {
        // Create new user info
        $insert_query = "INSERT INTO inforuser (idUser, fullName, age, address, phone) VALUES (?, ?, ?, ?, ?)";
        $insert_stmt = $db->prepare($insert_query);
        $insert_stmt->bind_param("isisi", $idUser, $fullName, $age, $address, $phone);
        $insert_stmt->execute();
        
        if ($insert_stmt->affected_rows > 0) {
            $response = [
                'success' => true,
                'message' => 'User info created successfully'
            ];
        } else {
            throw new Exception('Failed to create user info');
        }
    }

    echo json_encode($response);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error: ' . $e->getMessage()
    ]);
}
?> 