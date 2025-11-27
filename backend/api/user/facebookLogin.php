<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS"); 
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once '../../config/Database.php';

// Try to load local config first, fallback to placeholder config
if (file_exists('../../config/oauth.local.php')) {
    require_once '../../config/oauth.local.php';
    error_log('Loaded OAuth config from oauth.local.php');
} else {
    require_once '../../config/oauth.php';
    error_log('Loaded OAuth config from oauth.php (placeholder)');
}

// Debug: Log OAuth configuration
error_log('Facebook OAuth Config - App ID: ' . substr($FACEBOOK_APP_ID, 0, 20) . '...');
error_log('Facebook OAuth Config - Redirect URI: ' . $FACEBOOK_REDIRECT_URI);

try {
    // Get the authorization code from the request
    $input = json_decode(file_get_contents('php://input'), true);
    $code = $input['code'] ?? null;

    if (!$code) {
        throw new Exception('Authorization code is required');
    }

    // Log the request for debugging
    error_log('Facebook OAuth login attempt - Code: ' . substr($code, 0, 10) . '...');

    // Exchange authorization code for access token
    $token_url = 'https://graph.facebook.com/v18.0/oauth/access_token';
    $token_data = [
        'client_id' => $FACEBOOK_APP_ID,
        'client_secret' => $FACEBOOK_APP_SECRET,
        'code' => $code,
        'redirect_uri' => $FACEBOOK_REDIRECT_URI
    ];

    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $token_url . '?' . http_build_query($token_data));
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json'
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
        error_log("Facebook token exchange failed - HTTP Code: $http_code, Response: $token_response");
        throw new Exception('Failed to exchange authorization code for token. HTTP Code: ' . $http_code);
    }

    $token_data = json_decode($token_response, true);
    $access_token = $token_data['access_token'] ?? null;

    if (!$access_token) {
        error_log('No access token in response: ' . $token_response);
        throw new Exception('Failed to get access token from Facebook');
    }

    // Get user info from Facebook
    // Request email field, but it may not be available if permission not granted
    $user_info_url = 'https://graph.facebook.com/v18.0/me?fields=id,name,email,picture&access_token=' . $access_token;
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $user_info_url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json'
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
        error_log("Facebook user info failed - HTTP Code: $http_code, Response: $user_response");
        throw new Exception('Failed to get user info from Facebook. HTTP Code: ' . $http_code);
    }

    $user_data = json_decode($user_response, true);
    
    if (!$user_data || !isset($user_data['id'])) {
        error_log('Invalid user data from Facebook: ' . $user_response);
        throw new Exception('Invalid user data received from Facebook');
    }
    
    // Extract user information
    $facebook_id = $user_data['id'];
    $email = $user_data['email'] ?? '';
    $name = $user_data['name'] ?? $email;
    $picture = null;
    
    // Get picture URL if available
    if (isset($user_data['picture']) && isset($user_data['picture']['data']) && isset($user_data['picture']['data']['url'])) {
        $picture = $user_data['picture']['data']['url'];
    }

    // Connect to database
    $database = new Database();
    $db = $database->getConnection();

    // Check if user already exists by email or facebook_id
    // First check by email if available
    $existing_user = null;
    if ($email) {
        $check_query = "SELECT * FROM useraccount WHERE nameUser = ?";
        $check_stmt = $db->prepare($check_query);
        $check_stmt->bind_param("s", $email);
        $check_stmt->execute();
        $result = $check_stmt->get_result();
        $existing_user = $result->fetch_assoc();
    }
    
    // If not found by email, check by facebook_id (if you have a facebook_id column)
    // For now, we'll use email as the primary identifier

    if ($existing_user) {
        // Return existing user data
        $response = [
            'success' => true,
            'message' => 'Login successful',
            'user' => [
                'idUser' => $existing_user['idUser'],
                'nameUser' => $existing_user['nameUser'],
                'email' => $email ? $email : $existing_user['nameUser'],
                'roleUser' => $existing_user['roleUser'],
                'facebook_id' => $facebook_id,
                'oauthProvider' => 'facebook'
            ],
            'token' => 'facebook_oauth_token_' . $existing_user['idUser']
        ];
    } else {
        // Create new user
        // Use email as nameUser if available, otherwise use Facebook ID
        $nameUser = $email ? $email : 'fb_' . $facebook_id;
        
        $insert_query = "INSERT INTO useraccount (nameUser, passWord, roleUser) VALUES (?, ?, 'User')";
        $insert_stmt = $db->prepare($insert_query);
        $insert_stmt->bind_param("ss", $nameUser, $facebook_id); // Use facebook_id as password
        $insert_stmt->execute();
        
        $new_user_id = $db->insert_id;

        $response = [
            'success' => true,
            'message' => 'User created and login successful',
            'user' => [
                'idUser' => $new_user_id,
                'nameUser' => $nameUser,
                'email' => $email,
                'roleUser' => 'User',
                'facebook_id' => $facebook_id,
                'oauthProvider' => 'facebook'
            ],
            'token' => 'facebook_oauth_token_' . $new_user_id
        ];
    }

    error_log('Facebook OAuth login successful for user: ' . ($email ? $email : $facebook_id));
    echo json_encode($response);

} catch (Exception $e) {
    error_log("Facebook OAuth error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'OAuth login failed: ' . $e->getMessage()
    ]);
}
?>

