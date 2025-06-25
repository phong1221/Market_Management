<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: DELETE, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once '../../config/Database.php';

if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    try {
        $database = new Database();
        $db = $database->getConnection();
        
        $idBrand = $_GET['id'] ?? '';
        
        if (empty($idBrand)) {
            throw new Exception('ID nhãn hàng không được để trống');
        }
        
        // Kiểm tra xem nhãn hàng có đang được sử dụng trong bảng product không
        $checkQuery = "SELECT COUNT(*) as count FROM product WHERE idBrand = ?";
        $checkStmt = $db->prepare($checkQuery);
        $checkStmt->bind_param("i", $idBrand);
        $checkStmt->execute();
        $checkResult = $checkStmt->get_result();
        $result = $checkResult->fetch_assoc();
        
        if ($result['count'] > 0) {
            throw new Exception('Không thể xóa nhãn hàng này vì đang được sử dụng trong sản phẩm');
        }
        
        $query = "DELETE FROM brand WHERE idBrand = ?";
        $stmt = $db->prepare($query);
        $stmt->bind_param("i", $idBrand);
        
        if ($stmt->execute()) {
            if ($stmt->affected_rows > 0) {
                echo json_encode([
                    'success' => true,
                    'message' => 'Xóa nhãn hàng thành công'
                ]);
            } else {
                throw new Exception('Không tìm thấy nhãn hàng để xóa');
            }
        } else {
            throw new Exception('Lỗi khi xóa nhãn hàng');
        }
        
    } catch (Exception $e) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => $e->getMessage()
        ]);
    }
} else {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
}
?> 