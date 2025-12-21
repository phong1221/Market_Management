<?php
// Script to migrate database for RBAC (Role-Based Access Control)
// Created due to user request for granular permissions

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

require_once '../config/Database.php';

$database = new Database();
$conn = $database->getConnection();

$response = [];

// 1. Create 'permissions' table
$sqlPermissions = "CREATE TABLE IF NOT EXISTS `permissions` (
  `idPermission` int(11) NOT NULL AUTO_INCREMENT,
  `module` varchar(50) NOT NULL,
  `action` varchar(50) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`idPermission`),
  UNIQUE KEY `unique_module_action` (`module`, `action`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;";

if ($conn->query($sqlPermissions) === TRUE) {
    $response[] = "Table 'permissions' created or already exists.";
} else {
    $response[] = "Error creating table 'permissions': " . $conn->error;
}

// 2. Create 'role_permissions' table
$sqlRolePermissions = "CREATE TABLE IF NOT EXISTS `role_permissions` (
  `idRolePermission` int(11) NOT NULL AUTO_INCREMENT,
  `roleUser` enum('Admin','Cashier','Manager','User','Stocker','Accountant') NOT NULL,
  `idPermission` int(11) NOT NULL,
  PRIMARY KEY (`idRolePermission`),
  UNIQUE KEY `unique_role_permission` (`roleUser`, `idPermission`),
  KEY `fk_rp_permission` (`idPermission`),
  CONSTRAINT `fk_rp_permission` FOREIGN KEY (`idPermission`) REFERENCES `permissions` (`idPermission`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;";

if ($conn->query($sqlRolePermissions) === TRUE) {
    $response[] = "Table 'role_permissions' created or already exists.";
} else {
    $response[] = "Error creating table 'role_permissions': " . $conn->error;
}

// 3. Populate default permissions (Example: Product module)
$defaultPermissions = [
    // Product Module
    ['product', 'view', 'Xem danh sách sản phẩm'],
    ['product', 'add', 'Thêm sản phẩm mới'],
    ['product', 'edit', 'Chỉnh sửa sản phẩm'],
    ['product', 'delete', 'Xóa sản phẩm'],
    // Import Module
    ['import', 'view', 'Xem phiếu nhập'],
    ['import', 'add', 'Tạo phiếu nhập'],
    ['import', 'edit', 'Sửa phiếu nhập'],
    ['import', 'delete', 'Xóa phiếu nhập'],
    // Employee Module
    ['employee', 'view', 'Xem danh sách nhân viên'],
    ['employee', 'add', 'Thêm nhân viên'],
    ['employee', 'edit', 'Sửa nhân viên'],
    ['employee', 'delete', 'Xóa nhân viên'],
    // Dashboard
    ['dashboard', 'view', 'Xem thống kê']
];

$stmt = $conn->prepare("INSERT IGNORE INTO permissions (module, action, description) VALUES (?, ?, ?)");

foreach ($defaultPermissions as $perm) {
    $stmt->bind_param("sss", $perm[0], $perm[1], $perm[2]);
    $stmt->execute();
}
$stmt->close();
$response[] = "Default permissions populated.";

// 4. Assign default permissions to 'Admin' (All permissions)
// Fetch all permission IDs
$allPermsResult = $conn->query("SELECT idPermission FROM permissions");
if ($allPermsResult) {
    $stmtRole = $conn->prepare("INSERT IGNORE INTO role_permissions (roleUser, idPermission) VALUES (?, ?)");
    $adminRole = 'Admin';
    while ($row = $allPermsResult->fetch_assoc()) {
        $stmtRole->bind_param("si", $adminRole, $row['idPermission']);
        $stmtRole->execute();
    }
    $stmtRole->close();
    $response[] = "Assigned all permissions to Admin.";
}

// 5. Example: Assign limited permissions to 'Cashier' (Product View/Add only, Import View/Add)
// This is just a starting point as per user example
$cashierPerms = [
    ['product', 'view'],
    ['product', 'add'],
    ['import', 'view'],
    ['import', 'add']
];

$stmtCashier = $conn->prepare("INSERT IGNORE INTO role_permissions (roleUser, idPermission) SELECT 'Cashier', idPermission FROM permissions WHERE module = ? AND action = ?");
foreach ($cashierPerms as $cp) {
    $stmtCashier->bind_param("ss", $cp[0], $cp[1]);
    $stmtCashier->execute();
}
$stmtCashier->close();
$response[] = "Assigned example permissions to Cashier.";

$conn->close();

echo json_encode(["status" => "success", "messages" => $response]);
?>
