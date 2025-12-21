<?php
// Bật hiển thị lỗi để debug
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Cấu hình CORS và Content-Type

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

// Xử lý preflight request (OPTIONS)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Kiểm tra phương thức request
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(["success" => false, "message" => "Chỉ chấp nhận phương thức POST"]);
    exit();
}

require_once '../../config/Database.php';

// Lấy dữ liệu từ body
$data = json_decode(file_get_contents("php://input"), true);

// Kiểm tra dữ liệu đầu vào
// Kiểm tra dữ liệu đầu vào
if (!isset($data['nameUser'], $data['passWord'])) {
    echo json_encode([
        "success" => false,
        "message" => "Thiếu thông tin đăng nhập"
    ]);
    exit();
}

$roleUser = isset($data['roleUser']) ? $data['roleUser'] : 'User';
$fullName = isset($data['fullName']) ? $data['fullName'] : '';
$phone = isset($data['phone']) ? $data['phone'] : '';
$address = isset($data['address']) ? $data['address'] : '';
$email = isset($data['email']) ? $data['email'] : '';

// Khởi tạo kết nối database
$database = new Database();
$conn = $database->getConnection();

if (!$conn) {
    echo json_encode([
        "success" => false,
        "message" => "Lỗi kết nối cơ sở dữ liệu"
    ]);
    exit();
}

// Check if user already exists
$checkStmt = $conn->prepare("SELECT idUser FROM useraccount WHERE nameUser = ?");
$checkStmt->bind_param("s", $data['nameUser']);
$checkStmt->execute();
$checkResult = $checkStmt->get_result();
if ($checkResult->num_rows > 0) {
    echo json_encode(["success" => false, "message" => "Tên đăng nhập đã tồn tại"]);
    exit();
}

// Hash mật khẩu
$hashedPassword = password_hash($data['passWord'], PASSWORD_DEFAULT);

// 1. Thêm vào useraccount
$stmt = $conn->prepare("INSERT INTO useraccount (nameUser, passWord, roleUser) VALUES (?, ?, ?)");
$stmt->bind_param(
    "sss",
    $data['nameUser'],
    $hashedPassword,
    $roleUser
);

if ($stmt->execute()) {
    $newUserId = $conn->insert_id;

    // 2. Thêm vào bảng customer (nếu là User/Customer)
    // Ngay cả khi không phải User, ta cứ thêm vào nếu có thông tin, hoặc chỉ thêm khi role='User'
    // User requested: "khi tạo tài khoản thì thông tin lúc tạo tài khoản sẽ là thông tin của customer"
    // So we assume every registered user (via this form) is a customer.
    
    $custStmt = $conn->prepare("INSERT INTO customer (fullName, phoneNumber, address, email, idUser) VALUES (?, ?, ?, ?, ?)");
    $custStmt->bind_param("ssssi", $fullName, $phone, $address, $email, $newUserId);
    
    if ($custStmt->execute()) {
        echo json_encode([
            "success" => true,
            "message" => "Đăng ký thành công",
            "idUser" => $newUserId
        ]);
    } else {
        // Nếu lỗi thêm customer, có thể rollback user ? (MySQL MyISAM không hỗ trợ transaction, InnoDB có)
        // For simplicity, just report warning or success with error msg
        echo json_encode([
            "success" => true,
            "message" => "Đăng ký tài khoản thành công, nhưng lỗi tạo thông tin khách hàng: " . $custStmt->error,
            "idUser" => $newUserId
        ]);
    }
    $custStmt->close();

} else {
    echo json_encode([
        "success" => false,
        "message" => "Lỗi khi thêm người dùng: " . $stmt->error
    ]);
}

$stmt->close();
$conn->close();
?>
