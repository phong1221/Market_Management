<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once '../../config/Database.php';

$database = new Database();
$db = $database->getConnection();

$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['role']) || !isset($data['permissions'])) {
    echo json_encode(['success' => false, 'message' => 'Missing role or permissions data']);
    exit();
}

$role = $data['role'];
$permissionIds = $data['permissions']; // Array of IDs

try {
    $db->begin_transaction();

    // 1. Remove existing permissions for this role
    $deleteStmt = $db->prepare("DELETE FROM role_permissions WHERE roleUser = ?");
    $deleteStmt->bind_param("s", $role);
    $deleteStmt->execute();
    $deleteStmt->close();

    // 2. Insert new permissions
    if (!empty($permissionIds)) {
        $insertStmt = $db->prepare("INSERT INTO role_permissions (roleUser, idPermission) VALUES (?, ?)");
        foreach ($permissionIds as $permId) {
            $insertStmt->bind_param("si", $role, $permId);
            $insertStmt->execute();
        }
        $insertStmt->close();
    }

    $db->commit();
    echo json_encode(['success' => true, 'message' => "Permissions updated for role $role"]);

} catch (Exception $e) {
    $db->rollback();
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Error: ' . $e->getMessage()]);
}
?>
