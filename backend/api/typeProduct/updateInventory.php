<?php
function updateInventory($conn, $idType) {
    if ($idType === null) {
        return;
    }

    // Calculate the total amountProduct for the given idType from the product table
    $stmt = $conn->prepare('SELECT SUM(amountProduct) as total FROM product WHERE idType = ?');
    $stmt->bind_param('i', $idType);
    $stmt->execute();
    $result = $stmt->get_result();
    $row = $result->fetch_assoc();
    $totalInventory = $row['total'] ?? 0;
    $stmt->close();

    // Update the inventory in the typeproduct table
    $stmt = $conn->prepare('UPDATE typeproduct SET inventory = ? WHERE idType = ?');
    $stmt->bind_param('ii', $totalInventory, $idType);
    $stmt->execute();
    $stmt->close();
}
?> 