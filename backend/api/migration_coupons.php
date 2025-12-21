<?php
header("Content-Type: application/json; charset=UTF-8");
require_once __DIR__ . '/../config/Database.php';

try {
    $database = new Database();
    $conn = $database->getConnection();

    if (!$conn) {
        throw new Exception('Không thể kết nối cơ sở dữ liệu');
    }

    // 1. Create table coupon
    $sql1 = "CREATE TABLE IF NOT EXISTS `coupon` (
      `code` varchar(50) NOT NULL,
      `description` varchar(255) NOT NULL,
      `discount_type` enum('percent','fixed') NOT NULL,
      `discount_value` decimal(15,2) NOT NULL,
      `min_order_value` decimal(15,2) NOT NULL DEFAULT 0.00,
      `expiry_date` date NOT NULL,
      `quantity` int(11) NOT NULL,
      `status` enum('active','inactive') NOT NULL DEFAULT 'active',
      PRIMARY KEY (`code`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;";

    if ($conn->query($sql1) === FALSE) {
        throw new Exception("Error creating table coupon: " . $conn->error);
    }

    // 2. Create table user_coupon
    $sql2 = "CREATE TABLE IF NOT EXISTS `user_coupon` (
      `id` int(11) NOT NULL AUTO_INCREMENT,
      `idUser` int(11) NOT NULL,
      `coupon_code` varchar(50) NOT NULL,
      `status` enum('available','used') NOT NULL DEFAULT 'available',
      `claimed_at` datetime NOT NULL DEFAULT current_timestamp(),
      PRIMARY KEY (`id`),
      KEY `fk_uc_user` (`idUser`),
      KEY `fk_uc_coupon` (`coupon_code`),
      CONSTRAINT `fk_uc_user` FOREIGN KEY (`idUser`) REFERENCES `useraccount` (`idUser`),
      CONSTRAINT `fk_uc_coupon` FOREIGN KEY (`coupon_code`) REFERENCES `coupon` (`code`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;";

    if ($conn->query($sql2) === FALSE) {
         // Ignore "Foreign key constraint is incorrectly formed" if tables don't exist yet in a weird state, but here useraccount likely exists.
         // If it fails, maybe useraccount idUser type mismatch. Checked sql file, idUser is int(11).
        throw new Exception("Error creating table user_coupon: " . $conn->error);
    }

    // 3. Alter table order
    // Check if column exists first to avoid error
    $checkCol = $conn->query("SHOW COLUMNS FROM `order` LIKE 'coupon_code'");
    if ($checkCol->num_rows == 0) {
        $sql3 = "ALTER TABLE `order`
                 ADD `coupon_code` varchar(50) DEFAULT NULL,
                 ADD `discount_amount` decimal(15,2) DEFAULT 0.00;";
        if ($conn->query($sql3) === FALSE) {
            throw new Exception("Error altering table order: " . $conn->error);
        }
    }

    // 4. Insert dummy data for testing
    // Check if dummy coupon exists
    $checkCoupon = $conn->query("SELECT * FROM coupon WHERE code = 'TEST10'");
    if ($checkCoupon->num_rows == 0) {
        $sql4 = "INSERT INTO `coupon` (`code`, `description`, `discount_type`, `discount_value`, `min_order_value`, `expiry_date`, `quantity`, `status`) VALUES
        ('TEST10', 'Giảm 10% cho đơn từ 100k', 'percent', 10.00, 100000.00, '2025-12-31', 100, 'active'),
        ('FREE50K', 'Giảm 50k cho đơn từ 200k', 'fixed', 50000.00, 200000.00, '2025-12-31', 50, 'active');";
        $conn->query($sql4);
    }

    echo json_encode([
        'success' => true,
        'message' => 'Migration completed successfully'
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>
