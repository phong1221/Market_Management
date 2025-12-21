<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

include_once '../../config/Database.php';

try {
    $database = new Database();
    $db = $database->getConnection();

    $query = "
        SELECT 
            o.idOrder,
            o.idUser,
            COALESCE(u.nameUser, o.nameUser) as customerName,
            o.totalAmount,
            o.methodpayment,
            o.Status as orderStatus,
            o.created_at as orderDate,
            pt.vnp_TransactionNo,
            pt.vnp_BankCode,
            pt.vnp_PayDate,
            pt.vnp_Amount,
            pt.transactionStatus
        FROM `order` o
        LEFT JOIN `useraccount` u ON o.idUser = u.idUser
        LEFT JOIN `payment_transaction` pt ON o.idOrder = pt.idOrder AND pt.transactionStatus = 'Success'
        WHERE o.Status IN ('Paid', 'Completed', 'Shipping', 'Confirmed')
        ORDER BY o.idOrder DESC
    ";

    $stmt = $db->prepare($query);
    if (!$stmt) {
        throw new Exception("Prepare failed: (" . $db->errno . ") " . $db->error);
    }
    $stmt->execute();
    $result = $stmt->get_result();

    $history = [];
    if ($result->num_rows > 0) {
        while ($row = $result->fetch_assoc()) {
            $payDate = isset($row['vnp_PayDate']) ? $row['vnp_PayDate'] : null;
            if ($payDate && strlen($payDate) == 14) {
                // ... payment date formatting ...
                $year = substr($payDate, 0, 4);
                $month = substr($payDate, 4, 2);
                $day = substr($payDate, 6, 2);
                $hour = substr($payDate, 8, 2);
                $minute = substr($payDate, 10, 2);
                $second = substr($payDate, 12, 2);
                $row['paymentDateFormatted'] = "$day/$month/$year $hour:$minute:$second";
            } else {
                 if (isset($row['orderDate'])) {
                    $date = new DateTime($row['orderDate']);
                    $row['paymentDateFormatted'] = $date->format('d/m/Y H:i:s');
                 } else {
                    $row['paymentDateFormatted'] = 'N/A';
                 }
            }
            $history[] = $row;
        }
    }

    echo json_encode([
        'success' => true,
        'data' => $history
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>
