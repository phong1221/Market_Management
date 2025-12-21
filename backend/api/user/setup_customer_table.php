<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

include_once '../../config/Database.php';

try {
    $database = new Database();
    $db = $database->getConnection();

    $sql = "CREATE TABLE IF NOT EXISTS customer (
        idCustomer INT(11) AUTO_INCREMENT PRIMARY KEY,
        fullName VARCHAR(255) NOT NULL,
        phoneNumber VARCHAR(20) NOT NULL,
        address TEXT NOT NULL,
        email VARCHAR(255),
        idUser INT(11) NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (idUser) REFERENCES useraccount(idUser) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;";

    if ($db->query($sql) === TRUE) {
        echo json_encode(["success" => true, "message" => "Table 'customer' created successfully"]);
    } else {
        echo json_encode(["success" => false, "message" => "Error creating table: " . $db->error]);
    }

} catch (Exception $e) {
    echo json_encode(["success" => false, "message" => "Exception: " . $e->getMessage()]);
}
?>
