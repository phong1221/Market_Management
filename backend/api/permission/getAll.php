<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once '../../config/Database.php';

$database = new Database();
$db = $database->getConnection();

try {
    // 1. Get all Roles (from Enum definition in role_permissions or useraccount, or just distinct keys)
    // Since roles are ENUM, we can just hardcode the known roles or fetch from metadata. 
    // For reliability/simplicity based on previous setup_rbac:
    $roles = ['Admin', 'Cashier', 'Manager', 'User', 'Stocker', 'Accountant'];

    // 2. Get all Permissions
    $permissionsQuery = "SELECT * FROM permissions ORDER BY module, action";
    $permResult = $db->query($permissionsQuery);
    $permissions = [];
    if ($permResult) {
        while ($row = $permResult->fetch_assoc()) {
            $permissions[] = $row;
        }
    }

    // 3. Get Matrix (Role -> Permission IDs)
    $matrixQuery = "SELECT roleUser, idPermission FROM role_permissions";
    $matrixResult = $db->query($matrixQuery);
    $rolePermissions = []; // Format: ['Admin' => [1, 2, 3], 'Cashier' => [1]]
    
    if ($matrixResult) {
        while ($row = $matrixResult->fetch_assoc()) {
            $role = $row['roleUser'];
            $permId = $row['idPermission'];
            if (!isset($rolePermissions[$role])) {
                $rolePermissions[$role] = [];
            }
            $rolePermissions[$role][] = $permId;
        }
    }

    echo json_encode([
        'success' => true,
        'roles' => $roles,
        'permissions' => $permissions,
        'rolePermissions' => $rolePermissions
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error: ' . $e->getMessage()
    ]);
}
?>
