<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

require_once '../../config/Database.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

function loginUser() {
    try {
        $database = new Database();
        $conn = $database->getConnection();
        
        $data = json_decode(file_get_contents('php://input'), true);
        
        if (!isset($data['nameUser']) || !isset($data['passWord'])) {
            echo json_encode(['success' => false, 'message' => 'Tên đăng nhập và mật khẩu là bắt buộc']);
            exit;
        }
        
        $username = $conn->real_escape_string($data['nameUser']);
        $password = $conn->real_escape_string($data['passWord']);
        
        // Kiểm tra tài khoản admin trong bảng useraccount
        $query = "SELECT * FROM useraccount WHERE nameUser = '$username' AND passWord = '$password' AND roleUser = 'Admin' LIMIT 1";
        $result = $conn->query($query);
        
        if ($result && $result->num_rows > 0) {
            $user = $result->fetch_assoc();
            unset($user['passWord']);
            echo json_encode([
                'success' => true,
                'message' => 'Đăng nhập thành công',
                'user' => $user
            ]);
        } else {
            echo json_encode([
                'success' => false,
                'message' => 'Tên đăng nhập hoặc mật khẩu không đúng'
            ]);
        }
        $conn->close();
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Lỗi server: ' . $e->getMessage()
        ]);
    }
}

// Gọi hàm xử lý đăng nhập
loginUser();
?> 