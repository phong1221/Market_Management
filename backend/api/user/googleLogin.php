<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once '../../config/Database.php';

// Google OAuth Configuration
$GOOGLE_CLIENT_ID = '903101845353-uaktuct39n3fr8lse4hnp88bmh08tecq.apps.googleusercontent.com';
$GOOGLE_CLIENT_SECRET = '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';
$GOOGLE_REDIRECT_URI = 'http://localhost:3000/auth/google/callback';

try {
    // Get the authorization code from the request
    $input = json_decode(file_get_contents('php://input'), true);
    $code = $input['code'] ?? null;

    if (!$code) {
        throw new Exception('Authorization code is required');
    }

    // Log the request for debugging
    error_log('Google OAuth login attempt - Code: ' . substr($code, 0, 10) . '...');

    // Exchange authorization code for access token
    $token_url = 'https://oauth2.googleapis.com/token';
    $token_data = [
        'client_id' => $GOOGLE_CLIENT_ID,
        'client_secret' => $GOOGLE_CLIENT_SECRET,
        'code' => $code,
        'grant_type' => 'authorization_code',
        'redirect_uri' => $GOOGLE_REDIRECT_URI
    ];

    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $token_url);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($token_data));
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/x-www-form-urlencoded'
    ]);

    $token_response = curl_exec($ch);
    $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curl_error = curl_error($ch);
    curl_close($ch);

    if ($curl_error) {
        error_log('CURL error: ' . $curl_error);
        throw new Exception('Network error: ' . $curl_error);
    }

    if ($http_code !== 200) {
        error_log("Google token exchange failed - HTTP Code: $http_code, Response: $token_response");
        throw new Exception('Failed to exchange authorization code for token. HTTP Code: ' . $http_code);
    }

    $token_data = json_decode($token_response, true);
    $access_token = $token_data['access_token'] ?? null;

    if (!$access_token) {
        error_log('No access token in response: ' . $token_response);
        throw new Exception('Failed to get access token from Google');
    }

    // Get user info from Google
    $user_info_url = 'https://www.googleapis.com/oauth2/v2/userinfo?access_token=' . $access_token;
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $user_info_url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Authorization: Bearer ' . $access_token
    ]);

    $user_response = curl_exec($ch);
    $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curl_error = curl_error($ch);
    curl_close($ch);

    if ($curl_error) {
        error_log('CURL error getting user info: ' . $curl_error);
        throw new Exception('Network error getting user info: ' . $curl_error);
    }

    if ($http_code !== 200) {
        error_log("Google user info failed - HTTP Code: $http_code, Response: $user_response");
        throw new Exception('Failed to get user info from Google. HTTP Code: ' . $http_code);
    }

    $user_data = json_decode($user_response, true);
    
    if (!$user_data || !isset($user_data['id'])) {
        error_log('Invalid user data from Google: ' . $user_response);
        throw new Exception('Invalid user data received from Google');
    }
    
    // Extract user information
    $google_id = $user_data['id'];
    $email = $user_data['email'] ?? '';
    $name = $user_data['name'] ?? $email;
    $picture = $user_data['picture'] ?? null;

    // Connect to database
    $database = new Database();
    $db = $database->getConnection();

    // Check if user already exists by email (since we don't have google_id column yet)
    $check_query = "SELECT * FROM useraccount WHERE nameUser = ?";
    $check_stmt = $db->prepare($check_query);
    $check_stmt->bind_param("s", $email);
    $check_stmt->execute();
    $result = $check_stmt->get_result();
    $existing_user = $result->fetch_assoc();

    if ($existing_user) {
        // Return existing user data
        $response = [
            'success' => true,
            'message' => 'Login successful',
            'user' => [
                'idUser' => $existing_user['idUser'],
                'nameUser' => $existing_user['nameUser'],
                'email' => $email,
                'roleUser' => $existing_user['roleUser'],
                'google_id' => $google_id,
                'oauthProvider' => 'google'
            ],
            'token' => 'google_oauth_token_' . $existing_user['idUser']
        ];
    } else {
        // Create new user (using existing columns)
        $insert_query = "INSERT INTO useraccount (nameUser, passWord, roleUser) VALUES (?, ?, 'User')";
        $insert_stmt = $db->prepare($insert_query);
        $insert_stmt->bind_param("ss", $email, $google_id); // Use email as nameUser, google_id as password
        $insert_stmt->execute();
        
        $new_user_id = $db->insert_id;

        $response = [
            'success' => true,
            'message' => 'User created and login successful',
            'user' => [
                'idUser' => $new_user_id,
                'nameUser' => $name,
                'email' => $email,
                'roleUser' => 'User',
                'google_id' => $google_id,
                'oauthProvider' => 'google'
            ],
            'token' => 'google_oauth_token_' . $new_user_id
        ];
    }

    error_log('Google OAuth login successful for user: ' . $email);
    echo json_encode($response);

} catch (Exception $e) {
    error_log("Google OAuth error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'OAuth login failed: ' . $e->getMessage()
    ]);
}
?> 