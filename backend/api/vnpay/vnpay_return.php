<?php
// vnpay_return.php

// 1. KẾT NỐI DATABASE (Đồng bộ với các file khác)
require_once("../../config/Database.php");
$database = new Database();
$conn = $database->getConnection();

// 2. XỬ LÝ CORS
header_remove('Access-Control-Allow-Origin');
header_remove('Access-Control-Allow-Methods');
header_remove('Access-Control-Allow-Headers');

if (isset($_SERVER['HTTP_ORIGIN'])) {
    header("Access-Control-Allow-Origin: {$_SERVER['HTTP_ORIGIN']}");
    header('Access-Control-Allow-Credentials: true');
    header('Access-Control-Max-Age: 86400');
}

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { 
    if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_METHOD']))
        header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
    if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS']))
        header("Access-Control-Allow-Headers: {$_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS']}");
    exit(0); 
}

header('Content-Type: application/json');

require_once("vnpay_config.php");

$vnp_SecureHash = $_GET['vnp_SecureHash'] ?? '';
$inputData = array();
foreach ($_GET as $key => $value) {
    if (substr($key, 0, 4) == "vnp_") {
        $inputData[$key] = $value;
    }
}

unset($inputData['vnp_SecureHash']);
ksort($inputData);
$i = 0;
$hashData = "";
foreach ($inputData as $key => $value) {
    if ($i == 1) {
        $hashData = $hashData . '&' . urlencode($key) . "=" . urlencode($value);
    } else {
        $hashData = $hashData . urlencode($key) . "=" . urlencode($value);
        $i = 1;
    }
}

$secureHash = hash_hmac('sha512', $hashData, $vnp_HashSecret);

if ($secureHash == $vnp_SecureHash) {
    $vnp_ResponseCode = $inputData['vnp_ResponseCode'] ?? '';
    $vnp_TxnRef = $inputData['vnp_TxnRef'] ?? '';
    $vnp_TransactionNo = $inputData['vnp_TransactionNo'] ?? '';
    $vnp_PayDate = $inputData['vnp_PayDate'] ?? '';

    // Tách idOrder từ TxnRef (Format: idOrder_timestamp hoặc chỉ idOrder)
    $parts = explode("_", $vnp_TxnRef);
    $idOrder = $parts[0];

    if ($vnp_ResponseCode == '00') {
        // 1. Update bảng payment_transaction (Nếu bạn có bảng này)
        // Kiểm tra xem bảng payment_transaction có tồn tại không trước khi chạy query này
        $sqlCheck = "SHOW TABLES LIKE 'payment_transaction'";
        $checkResult = $conn->query($sqlCheck);
        
        if ($checkResult && $checkResult->num_rows > 0) {
             // Cần kiểm tra xem vnp_TxnRef có tồn tại trong bảng chưa
             $sqlPay = "UPDATE payment_transaction SET transactionStatus = 'Success', vnp_TransactionNo = ?, vnp_ResponseCode = ?, vnp_PayDate = ? WHERE vnp_TxnRef = ?";
             $stmt = $conn->prepare($sqlPay);
             $stmt->bind_param("ssss", $vnp_TransactionNo, $vnp_ResponseCode, $vnp_PayDate, $vnp_TxnRef);
             $stmt->execute();
        }

        // 2. Update trạng thái đơn hàng trong bảng order
        $sqlOrder = "UPDATE `order` SET Status = 'Paid' WHERE idOrder = ?";
        $stmtOrder = $conn->prepare($sqlOrder);
        $stmtOrder->bind_param("i", $idOrder);
        
        if ($stmtOrder->execute()) {
            echo json_encode(['status' => 'success', 'message' => 'Thanh toán thành công']);
        } else {
            echo json_encode(['status' => 'error', 'message' => 'Lỗi update đơn hàng']);
        }
    } else {
        echo json_encode(['status' => 'failed', 'message' => 'Thanh toán lỗi hoặc bị hủy']);
    }
} else {
    echo json_encode(['status' => 'error', 'message' => 'Chữ ký không hợp lệ']);
}
?>