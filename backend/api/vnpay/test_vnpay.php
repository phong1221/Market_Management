<?php
// test_vnpay.php - FILE NÀY DÙNG ĐỂ TEST KEY CÓ ĐÚNG KHÔNG

// 1. Cấu hình Key (Hardcode trực tiếp để kiểm tra)
$vnp_TmnCode = "LRPN1ROC"; 
$vnp_HashSecret = "P5A5E57P1A1X8OX53ZU714A0LL1CFWWK"; 
$vnp_Url = "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";
$vnp_Returnurl = "http://localhost:3000/vnpay_return";

// 2. Giả lập dữ liệu thanh toán (Không lấy từ React)
$vnp_TxnRef = date("YmdHis"); // Mã giao dịch theo thời gian thực (luôn duy nhất)
$vnp_OrderInfo = "Test thanh toan truc tiep";
$vnp_Amount = 10000 * 100; // 10.000 VND
$vnp_IpAddr = "127.0.0.1";
$vnp_Locale = "vn";

$inputData = array(
    "vnp_Version" => "2.1.0",
    "vnp_TmnCode" => $vnp_TmnCode,
    "vnp_Amount" => $vnp_Amount,
    "vnp_Command" => "pay",
    "vnp_CreateDate" => date('YmdHis'),
    "vnp_CurrCode" => "VND",
    "vnp_IpAddr" => $vnp_IpAddr,
    "vnp_Locale" => $vnp_Locale,
    "vnp_OrderInfo" => $vnp_OrderInfo,
    "vnp_OrderType" => "other",
    "vnp_ReturnUrl" => $vnp_Returnurl,
    "vnp_TxnRef" => $vnp_TxnRef
);

// 3. Tạo chữ ký
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

// 4. Tự động chuyển hướng sang VNPAY
header("Location: " . $vnp_Url);
die();
?>