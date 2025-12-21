<?php
require_once '../../config/Database.php';

try {
    $db = new Database();
    $conn = $db->getConnection();

    // Check if orderDate exists
    $result = $conn->query("SHOW COLUMNS FROM `order` LIKE 'orderDate'");
    $exists = $result->num_rows > 0;

    if (!$exists) {
        echo "Adding orderDate column...\n";
        // Add column
        $sql = "ALTER TABLE `order` ADD COLUMN `orderDate` DATETIME DEFAULT CURRENT_TIMESTAMP";
        if ($conn->query($sql) === TRUE) {
            echo "Column added successfully.\n";
            
            // Populate with dummy data for demo purposes (distributed over last 12 months)
            echo "Populating data...\n";
            $updateSql = "UPDATE `order` SET orderDate = FROM_UNIXTIME(UNIX_TIMESTAMP('2025-01-01') + FLOOR(RAND() * (UNIX_TIMESTAMP(NOW()) - UNIX_TIMESTAMP('2025-01-01'))))";
             // Or just spread them out? Let's use 2024-2025 range.
             // Let's assume current year is 2025 based on file dumps.
             
            if ($conn->query($updateSql) === TRUE) {
                 echo "Data populated successfully.\n";
            } else {
                 echo "Error populating data: " . $conn->error . "\n";
            }

        } else {
            echo "Error adding column: " . $conn->error . "\n";
        }
    } else {
        echo "orderDate column already exists.\n";
        // Check if data is empty (0000-00-00 or NULL) and fix if needed
        $conn->query("UPDATE `order` SET orderDate = FROM_UNIXTIME(UNIX_TIMESTAMP('2025-01-01') + FLOOR(RAND() * 31536000)) WHERE orderDate IS NULL OR orderDate < '2020-01-01'");
        echo "Data refreshed.\n";
    }

} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
?>
