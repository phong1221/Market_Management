<?php
include_once 'config/Database.php';

$database = new Database();
$db = $database->getConnection();

// 1. Create customer table
$sql = "CREATE TABLE IF NOT EXISTS `customer` (
  `idCustomer` int(11) NOT NULL AUTO_INCREMENT,
  `fullName` varchar(255) NOT NULL,
  `phoneNumber` varchar(20) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `idUser` int(11) DEFAULT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`idCustomer`),
  KEY `idUser` (`idUser`),
  CONSTRAINT `customer_ibfk_1` FOREIGN KEY (`idUser`) REFERENCES `useraccount` (`idUser`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;";

if ($db->query($sql) === TRUE) {
    echo "Table 'customer' created successfully.<br>";
} else {
    echo "Error creating table: " . $db->error . "<br>";
}

// 2. Sync existing users to customer table (optional but good for initial data)
// We join useraccount and inforuser to get details
$syncSql = "INSERT INTO customer (fullName, phoneNumber, address, email, idUser)
SELECT 
    COALESCE(i.fullName, u.nameUser) as fullName, 
    i.phone as phoneNumber, 
    i.address, 
    u.email, 
    u.idUser
FROM useraccount u
LEFT JOIN inforuser i ON u.idUser = i.idUser
LEFT JOIN customer c ON u.idUser = c.idUser
WHERE u.roleUser = 'User' AND c.idCustomer IS NULL";

if ($db->query($syncSql) === TRUE) {
    echo "Synced existing customers successfully.<br>";
} else {
    echo "Error syncing customers: " . $db->error . "<br>";
}

echo "Migration completed.";
?>
