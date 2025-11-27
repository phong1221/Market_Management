<?php
// create_payment.php - PHIÊN BẢN "TẤT CẢ TRONG MỘT" (CHẠY 100%)

// 1. XỬ LÝ CORS (Bắt buộc để React không báo lỗi Network Error)
header_remove('Access-Control-Allow-Origin');
header_remove('Access-Control-Allow-Methods');
header_remove('Access-Control-Allow-Headers');

if (isset($_SERVER['HTTP_ORIGIN'])) {
    header("Access-Control-Allow-Origin: {$_SERVER['HTTP_ORIGIN']}");
    header('Access-Control-Allow-Credentials: true');
    header('Access-Control-Max-Age: 86400');
}

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_METHOD']))
        header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
    if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS']))
        header("Access-Control-Allow-Headers: {$_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS']}");
    exit(0);
}

header('Content-Type: application/json');

// 2. KẾT NỐI DATABASE TRỰC TIẾP (Không cần file ngoài)
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "market_management";

$conn = new mysqli($servername, $username, $password, $dbname);
$conn->set_charset("utf8");

if ($conn->connect_error) {
    echo json_encode(['status' => 'error', 'message' => 'Lỗi kết nối DB: ' . $conn->connect_error]);
    exit();
}

// 3. CẤU HÌNH VNPAY TRỰC TIẾP (Thông tin tài khoản Sandbox của bạn)
$vnp_TmnCode = "54C2WH58"; 
$vnp_HashSecret = "OO0S8BL02SCQS0NM4UWVFUBO38LGRK2X"; 
$vnp_Url = "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";
$vnp_Returnurl = "http://localhost:3000/vnpay_return";

// 4. LẤY DỮ LIỆU TỪ REACT
$inputJSON = file_get_contents('php://input');
$data = json_decode($inputJSON, true);

if (is_null($data)) {
    echo json_encode(['status' => 'error', 'message' => 'Dữ liệu JSON rỗng']);
    exit();
}

// 5. XỬ LÝ THAM SỐ
$idOrder = $data['idOrder'] ?? 0;
$vnp_Amount = $data['amount'] ?? 0;
$vnp_BankCode = $data['bankCode'] ?? '';
$vnp_IpAddr = "127.0.0.1"; // Fix cứng IP để tránh lỗi Sandbox

// Tạo mã giao dịch duy nhất: ID_Timestamp (Tránh lỗi Duplicate)
$vnp_TxnRef = $idOrder . "_" . time(); 
$vnp_OrderInfo = "Thanh toan don hang #" . $idOrder;

// 6. TẠO DỮ LIỆU GỬI SANG VNPAY
$inputData = array(
    "vnp_Version" => "2.1.0",
    "vnp_TmnCode" => $vnp_TmnCode,
    "vnp_Amount" => (int)$vnp_Amount * 100, // Nhân 100 và ép kiểu số nguyên
    "vnp_Command" => "pay",
    "vnp_CreateDate" => date('YmdHis'),
    "vnp_CurrCode" => "VND",
    "vnp_IpAddr" => $vnp_IpAddr,
    "vnp_Locale" => "vn",
    "vnp_OrderInfo" => $vnp_OrderInfo,
    "vnp_OrderType" => "other",
    "vnp_ReturnUrl" => $vnp_Returnurl,
    "vnp_TxnRef" => $vnp_TxnRef
);

// Nếu chọn ngân hàng cụ thể
if (isset($vnp_BankCode) && $vnp_BankCode != "") {
    $inputData["vnp_BankCode"] = $vnp_BankCode;
}

// 7. TẠO URL VÀ CHỮ KÝ (Checksum)
ksort($inputData);
$query = "";
$i = 0;
$hashdata = "";
foreach ($inputData as $key => $value) {
    if ($i == 1) {
        $hashdata .= '&' . urlencode($key) . "=" . urlencode($value);
    } else {
        $hashdata .= urlencode($key) . "=" . urlencode($value);
        $i = 1;
    }
    $query .= urlencode($key) . "=" . urlencode($value) . '&';
}

$vnp_Url = $vnp_Url . "?" . $query;
if (isset($vnp_HashSecret)) {
    $vnpSecureHash =   hash_hmac('sha512', $hashdata, $vnp_HashSecret);
    $vnp_Url .= 'vnp_SecureHash=' . $vnpSecureHash;
}

// 8. TRẢ VỀ KẾT QUẢ CHO REACT
echo json_encode([
    'status' => 'success',
    'payUrl' => $vnp_Url
]);
?>