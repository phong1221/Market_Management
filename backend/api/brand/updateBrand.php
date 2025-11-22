<?php
// Bật hiển thị lỗi để debug
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Cấu hình CORS và Content-Type

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}
header("Content-Type: application/json; charset=UTF-8");

// Kiểm tra phương thức request
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(["success" => false, "message" => "Chỉ chấp nhận phương thức POST"]);
    exit();
}

require_once '../../config/Database.php';

// Khởi tạo kết nối database
$database = new Database();
$conn = $database->getConnection();

// Kiểm tra kết nối
if (!$conn) {
    echo json_encode([
        "success" => false,
        "message" => "Lỗi kết nối cơ sở dữ liệu"
    ]);
    exit();
}

// Lấy dữ liệu từ form-data
$data = $_POST;
$logo_file = isset($_FILES['logoBrand']) ? $_FILES['logoBrand'] : null;

// Debug: In ra dữ liệu nhận được
error_log("POST data: " . print_r($_POST, true));
error_log("FILES data: " . print_r($_FILES, true));

// Kiểm tra dữ liệu đầu vào
if (empty($data)) {
    echo json_encode([
        "success" => false,
        "message" => "Dữ liệu không hợp lệ"
    ]);
    exit();
}

// Validate required fields
if (!isset($data['idBrand']) || empty($data['idBrand'])) {
    echo json_encode([
        "success" => false,
        "message" => "ID nhãn hàng không được để trống"
    ]);
    exit();
}

if (!isset($data['nameBrand']) || empty($data['nameBrand'])) {
    echo json_encode([
        "success" => false,
        "message" => "Tên nhãn hàng không được để trống"
    ]);
    exit();
}

// Convert idBrand to integer
$idBrand = intval($data['idBrand']);

// Handle file upload
$logo_name = "";
if ($logo_file && $logo_file['error'] == 0) {
    $target_dir = "../../uploads/";
    if (!is_dir($target_dir)) {
        mkdir($target_dir, 0777, true);
    }
    $logo_name = basename($logo_file["name"]);
    $target_file = $target_dir . $logo_name;
    
    if (file_exists($target_file)) {
        $logo_name = time() . "_" . $logo_name;
        $target_file = $target_dir . $logo_name;
    }

    if (!move_uploaded_file($logo_file["tmp_name"], $target_file)) {
        echo json_encode(["success" => false, "message" => "Lỗi khi tải logo lên."]);
        exit();
    }
} else if (isset($data['logoBrand']) && !empty($data['logoBrand'])) {
    // Nếu không có file upload nhưng có URL logo
    $logo_name = basename($data['logoBrand']);
} else if (isset($data['existing_logo']) && !empty($data['existing_logo'])) {
    // Giữ lại logo cũ nếu không upload logo mới
    $logo_name = $data['existing_logo'];
}
// Nếu không có logo, $logo_name sẽ là chuỗi rỗng

// Chuẩn bị câu lệnh SQL
$sql = "UPDATE brand SET nameBrand = ?, logoBrand = ? WHERE idBrand = ?";
$stmt = $conn->prepare($sql);

if (!$stmt) {
    echo json_encode([
        "success" => false,
        "message" => "Lỗi chuẩn bị câu lệnh: " . $conn->error
    ]);
    exit();
}

// Bind parameters
$stmt->bind_param("ssi", $data['nameBrand'], $logo_name, $idBrand);

// Thực thi câu lệnh
if ($stmt->execute()) {
    if ($stmt->affected_rows > 0) {
        echo json_encode([
            "success" => true,
            "message" => "Cập nhật nhãn hàng thành công",
            "data" => [
                "idBrand" => $idBrand,
                "nameBrand" => $data['nameBrand'],
                "logoBrand" => $logo_name
            ]
        ]);
    } else {
        echo json_encode([
            "success" => false,
            "message" => "Không tìm thấy nhãn hàng để cập nhật"
        ]);
    }
} else {
    echo json_encode([
        "success" => false,
        "message" => "Lỗi khi cập nhật nhãn hàng: " . $stmt->error
    ]);
}

// Đóng statement và kết nối
$stmt->close();
$conn->close();
?> 