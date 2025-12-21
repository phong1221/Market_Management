<?php
// create_order.php

// 1. Nhúng file Database trước
require_once("../../config/Database.php");

// 2. XÓA SẠCH CÁC HEADER CŨ (Do Database.php hoặc Apache tạo ra)
header_remove('Access-Control-Allow-Origin');
header_remove('Access-Control-Allow-Methods');
header_remove('Access-Control-Allow-Headers');

// 3. THIẾT LẬP LẠI HEADER CORS CHUẨN (Chỉ 1 lần duy nhất tại đây)
if (isset($_SERVER['HTTP_ORIGIN'])) {
    header("Access-Control-Allow-Origin: {$_SERVER['HTTP_ORIGIN']}");
    header('Access-Control-Allow-Credentials: true');
    header('Access-Control-Max-Age: 86400');
}

// 4. Xử lý Preflight Request (OPTIONS)
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_METHOD']))
        header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
    if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS']))
        header("Access-Control-Allow-Headers: {$_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS']}");
    exit(0);
}

header('Content-Type: application/json');

// 5. Kết nối Database
$database = new Database();
$conn = $database->getConnection();

if (!$conn) {
    echo json_encode(['status' => 'error', 'message' => 'Lỗi kết nối cơ sở dữ liệu']);
    exit();
}

// 6. Kiểm tra Method POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(["status" => "error", "message" => "Method not allowed. Use POST."]);
    exit();
}

// 7. Lấy dữ liệu JSON
$inputJSON = file_get_contents('php://input');
$data = json_decode($inputJSON, true);

if (is_null($data)) {
    echo json_encode(["status" => "error", "message" => "Dữ liệu JSON không hợp lệ"]);
    exit();
}

// 8. Validate dữ liệu
if (!isset($data['name']) || empty($data['name'])) {
    echo json_encode(["status" => "error", "message" => "Thiếu tên khách hàng"]);
    exit();
}
if (!isset($data['totalAmount'])) {
    echo json_encode(["status" => "error", "message" => "Thiếu tổng tiền"]);
    exit();
}

// 9. Gán dữ liệu
$nameUser = $data['name'];
$address = $data['address'] ?? ''; 
$phone = $data['phone'] ?? '';
$method = isset($data['payment']) && $data['payment'] === 'bank' ? 'Banking' : 'Cash';
$totalAmount = $data['totalAmount'];
$cartItems = $data['cart'] ?? []; 
$idUser = $data['idUser'] ?? 0;
$couponCode = $data['couponCode'] ?? null;
$discountAmount = $data['discountAmount'] ?? 0;

// Log for debugging
error_log("create_order - idUser: " . $idUser);
error_log("create_order - nameUser: " . $nameUser);
error_log("create_order - totalAmount: " . $totalAmount);
error_log("create_order - couponCode: " . $couponCode);

// Validate Coupon if provided
if ($couponCode && $idUser > 0) {
    // Check if user owns this coupon and it is available
    $checkCoupon = "SELECT id FROM user_coupon WHERE idUser = ? AND coupon_code = ? AND status = 'available'";
    $stmtCheck = $conn->prepare($checkCoupon);
    $stmtCheck->bind_param("is", $idUser, $couponCode);
    $stmtCheck->execute();
    $resCheck = $stmtCheck->get_result();
    
    if ($resCheck->num_rows === 0) {
        // Fallback: check if it's a valid public coupon (optional, but per requirement "claim first" implies we stick to user_coupon)
        // But let's just error if invalid to be safe
        echo json_encode(["status" => "error", "message" => "Mã giảm giá không hợp lệ hoặc đã sử dụng"]);
        exit();
    }
    $stmtCheck->close();
}

// 10. Insert Order
$sqlOrder = "INSERT INTO `order` (idUser, nameUser, address, phone, methodpayment, Status, totalAmount, coupon_code, discount_amount) 
             VALUES (?, ?, ?, ?, ?, 'Pending', ?, ?, ?)";
             
$stmt = $conn->prepare($sqlOrder);

if (!$stmt) {
    echo json_encode(["status" => "error", "message" => "Lỗi SQL Prepare: " . $conn->error]);
    exit();
}

$stmt->bind_param("issssdss", $idUser, $nameUser, $address, $phone, $method, $totalAmount, $couponCode, $discountAmount);

if ($stmt->execute()) {
    $newOrderId = $conn->insert_id;
    error_log("create_order - Order created successfully with idOrder: " . $newOrderId . ", idUser: " . $idUser);
    
    // Mark coupon as used
    if ($couponCode && $idUser > 0) {
        $markUsed = "UPDATE user_coupon SET status = 'used' WHERE idUser = ? AND coupon_code = ?";
        $stmtMark = $conn->prepare($markUsed);
        $stmtMark->bind_param("is", $idUser, $couponCode);
        $stmtMark->execute();
        $stmtMark->close();
    }
    
    // 11. Insert Order Detail
    if (!empty($cartItems)) {
        $sqlDetail = "INSERT INTO `order_detail` (idOrder, idProduct, quantity, unitPrice, totalPrice) VALUES (?, ?, ?, ?, ?)";
        $stmtDetail = $conn->prepare($sqlDetail);
        
        foreach ($cartItems as $item) {
            $idProduct = $item['idProduct'] ?? 0;
            $quantity = $item['quantity'] ?? 0;
            $price = $item['price'] ?? $item['exportCost'] ?? 0; 
            $totalPriceItem = $quantity * $price;
            
            $stmtDetail->bind_param("iiidd", $newOrderId, $idProduct, $quantity, $price, $totalPriceItem);
            $stmtDetail->execute();
        }
    }
    
    echo json_encode(['status' => 'success', 'idOrder' => $newOrderId]);
} else {
    echo json_encode(['status' => 'error', 'message' => 'Lỗi thực thi: ' . $stmt->error]);
}
?>