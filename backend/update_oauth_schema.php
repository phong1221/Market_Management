<?php
require_once 'config/Database.php';

try {
    $database = new Database();
    $db = $database->getConnection();
    
    // SQL statements to add OAuth columns
    $sql_statements = [
        "ALTER TABLE `useraccount` ADD COLUMN `email` VARCHAR(255) NULL AFTER `passWord`",
        "ALTER TABLE `useraccount` ADD COLUMN `google_id` VARCHAR(255) NULL AFTER `email`",
        "ALTER TABLE `useraccount` ADD COLUMN `facebook_id` VARCHAR(255) NULL AFTER `google_id`",
        "ALTER TABLE `useraccount` ADD COLUMN `oauth_provider` ENUM('google', 'facebook') NULL AFTER `facebook_id`",
        "ALTER TABLE `useraccount` ADD COLUMN `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP AFTER `oauth_provider`",
        "ALTER TABLE `useraccount` ADD INDEX `idx_email` (`email`)",
        "ALTER TABLE `useraccount` ADD INDEX `idx_google_id` (`google_id`)",
        "ALTER TABLE `useraccount` ADD INDEX `idx_facebook_id` (`facebook_id`)",
        "ALTER TABLE `useraccount` ADD INDEX `idx_oauth_provider` (`oauth_provider`)"
    ];
    
    foreach ($sql_statements as $sql) {
        if ($db->query($sql)) {
            echo "Success: " . $sql . "\n";
        } else {
            echo "Error: " . $sql . " - " . $db->error . "\n";
        }
    }
    
    echo "Database schema update completed!\n";
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
?> 