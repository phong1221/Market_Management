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

    // Get user detailed info from inforuser (old table)
    $detail_query = "SELECT * FROM inforuser WHERE idUser = ?";
    $detail_stmt = $db->prepare($detail_query);
    $detail_stmt->bind_param("i", $idUser);
    $detail_stmt->execute();
    $detail_result = $detail_stmt->get_result();
    $userInfo = $detail_result->fetch_assoc();

    // If not found in inforuser, check customer table (new table)
    if (!$userInfo) {
        $customer_query = "SELECT fullName, phoneNumber as phone, address, email FROM customer WHERE idUser = ?";
        $customer_stmt = $db->prepare($customer_query);
        $customer_stmt->bind_param("i", $idUser);
        $customer_stmt->execute();
        $customer_result = $customer_stmt->get_result();
        $userInfo = $customer_result->fetch_assoc();
    }

    // Backend returns 'userInfo' but frontend expects the merged object or handles it.
    // Looking at Users.jsx: setSelectedUser(prevUser => ({ ...prevUser, ...details }));
    // And userService.js: if (data.success) return data.data;
    // But this API returns 'user' and 'userInfo'.
    // Wait, userService.js line 62 says: return data.data; 
    // BUT this API returns { 'success': true, 'message': ..., 'user': ..., 'userInfo': ... }
    // It does NOT return a 'data' field. This is a BUG in the API/Frontend contract.
    // UserService expects `data.data` but API returns root fields.
    
    // I will fix the API to return 'data' which contains the merged info or just userInfo, 
    // OR I will fix userService. 
    // Let's look at Users.jsx again. It expects `details` to have `fullName`, `age`, `address`, `phone`.
    
    // Let's restructure the response to match what userService probably expects, OR fix userService.
    // Actually, checking userService.js again:
    // export async function fetchUserDetails(idUser) {
    //     const response = await fetch(`${API_URL_DETAIL}?idUser=${idUser}`);
    //     const data = await response.json();
    //     if (data.success) {
    //         return data.data; 
    //     }
    // ...
    
    // So the API MUST return `data` field. 
    
    $response = [
        'success' => true,
        'message' => 'User info retrieved successfully',
        'data' => $userInfo ? $userInfo : [] // Return just the details object
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