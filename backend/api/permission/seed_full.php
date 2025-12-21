<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

require_once '../../config/Database.php';

$database = new Database();
$conn = $database->getConnection();

$response = [];

// Define the full list of modules and their actions
// Format: Module => [Action1 => Description, Action2 => Description]
$modules = [
    'dashboard' => [
        'view' => 'Xem thống kê tổng quan'
    ],
    'user' => [
        'view' => 'Xem danh sách tài khoản',
        'add' => 'Tạo tài khoản mới',
        'update' => 'Cập nhật tài khoản', // Using 'update' to match logic if needed, or 'edit'
        'delete' => 'Xóa tài khoản'
    ],
    'customer' => [
        'view' => 'Xem danh sách khách hàng',
        'add' => 'Thêm khách hàng',
        'edit' => 'Sửa thông tin khách hàng',
        'delete' => 'Xóa khách hàng'
    ],
    'employee' => [
        'view' => 'Xem danh sách nhân viên',
        'add' => 'Thêm nhân viên',
        'edit' => 'Sửa nhân viên',
        'delete' => 'Xóa nhân viên'
    ],
    'salary' => [
        'view' => 'Xem bảng lương',
        'calc' => 'Tính lương',
        'pay' => 'Thanh toán lương'
    ],
    'product' => [
        'view' => 'Xem danh sách sản phẩm',
        'add' => 'Thêm sản phẩm',
        'edit' => 'Sửa sản phẩm',
        'delete' => 'Xóa sản phẩm'
    ],
    'category' => [
        'view' => 'Xem loại sản phẩm',
        'add' => 'Thêm loại sản phẩm',
        'edit' => 'Sửa loại sản phẩm',
        'delete' => 'Xóa loại sản phẩm'
    ],
    'brand' => [
        'view' => 'Xem thương hiệu',
        'add' => 'Thêm thương hiệu',
        'edit' => 'Sửa thương hiệu',
        'delete' => 'Xóa thương hiệu'
    ],
    'provider' => [
        'view' => 'Xem nhà cung cấp',
        'add' => 'Thêm nhà cung cấp',
        'edit' => 'Sửa nhà cung cấp',
        'delete' => 'Xóa nhà cung cấp'
    ],
    'import' => [
        'view' => 'Xem phiếu nhập',
        'add' => 'Tạo phiếu nhập',
        'edit' => 'Sửa phiếu nhập',
        'delete' => 'Xóa phiếu nhập'
    ],
    'pos' => [
        'view' => 'Truy cập POS bán hàng',
        'checkout' => 'Thực hiện thanh toán'
    ],
    'order' => [
        'view' => 'Xem danh sách đơn hàng',
        'update' => 'Cập nhật trạng thái đơn',
        'delete' => 'Xóa đơn hàng'
    ],
    'payment' => [
        'view' => 'Xem lịch sử thanh toán'
    ],
    'promotion' => [
        'view' => 'Xem khuyến mãi',
        'add' => 'Tạo chương trình khuyến mãi',
        'edit' => 'Sửa khuyến mãi',
        'delete' => 'Xóa khuyến mãi'
    ],
    'coupon' => [
        'view' => 'Xem mã giảm giá',
        'add' => 'Tạo mã giảm giá',
        'edit' => 'Sửa mã giảm giá',
        'delete' => 'Xóa mã giảm giá'
    ]
];

// truncate permissions? No, just Insert Ignore. 
// Actually current permissions might be duplicates or old. 
// Let's TRUNCATE to be clean since we are re-seeding full list? 
// WARNING: Truncating wipes existing assignments in role_permissions (Cascade).
// Since this is a setup step requested by user to "show all", it's safer to Upsert.
// But duplicate module-action is UNIQUE.

$stmt = $conn->prepare("INSERT IGNORE INTO permissions (module, action, description) VALUES (?, ?, ?)");

foreach ($modules as $modName => $actions) {
    foreach ($actions as $actName => $desc) {
        $stmt->bind_param("sss", $modName, $actName, $desc);
        $stmt->execute();
    }
}
$stmt->close();
$response[] = "Permissions populated.";

// Auto-assign ALL to Admin
$response[] = "Assigning all to Admin...";
$allPermsResult = $conn->query("SELECT idPermission FROM permissions");
if ($allPermsResult) {
    $stmtRole = $conn->prepare("INSERT IGNORE INTO role_permissions (roleUser, idPermission) VALUES ('Admin', ?)");
    while ($row = $allPermsResult->fetch_assoc()) {
        $stmtRole->bind_param("i", $row['idPermission']);
        $stmtRole->execute();
    }
    $stmtRole->close();
}

$conn->close();

echo json_encode(["status" => "success", "messages" => $response]);
?>
