<?php
// Bật hiển thị lỗi để debug
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Headers
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Access-Control-Allow-Headers,Content-Type,Access-Control-Allow-Methods,Authorization,X-Requested-With');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Include database file
include_once '../../config/Database.php';

// Instantiate Database and get connection
$database = new Database();
$db = $database->getConnection();

// Get raw posted data
$data = json_decode(file_get_contents("php://input"));

// Check if data is not empty
if (
    !empty($data->idEmployee) &&
    isset($data->basicSalary) &&
    isset($data->bonus) &&
    isset($data->deduction) &&
    !empty($data->salaryMonth)
) {
    $query = 'INSERT INTO salary (idEmployee, basicSalary, bonus, deduction, totalSalary, salaryMonth) VALUES (?, ?, ?, ?, ?, ?)';

    $stmt = $db->prepare($query);

    if($stmt === false){
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Lỗi chuẩn bị câu lệnh SQL.']);
        exit();
    }
    
    // Sanitize data
    $idEmployee = htmlspecialchars(strip_tags($data->idEmployee));
    $basicSalary = htmlspecialchars(strip_tags($data->basicSalary));
    $bonus = htmlspecialchars(strip_tags($data->bonus));
    $deduction = htmlspecialchars(strip_tags($data->deduction));
    $salaryMonth = htmlspecialchars(strip_tags($data->salaryMonth)) . '-01';
    $totalSalary = (float)$basicSalary + (float)$bonus - (float)$deduction;

    // Bind data
    $stmt->bind_param('idddds', $idEmployee, $basicSalary, $bonus, $deduction, $totalSalary, $salaryMonth);
    
    if($stmt->execute()) {
        $idSalary = $db->insert_id;
        http_response_code(201); // Created
        echo json_encode(
            array(
                'success' => true, 
                'message' => 'Thêm lương thành công.',
                'idSalary' => $idSalary,
                'totalSalary' => $totalSalary
            )
        );
    } else {
        http_response_code(503); // Service Unavailable
        echo json_encode(
            array('success' => false, 'message' => 'Lỗi khi thêm lương.')
        );
    }
} else {
    // Data is incomplete
    http_response_code(400); // Bad Request
    echo json_encode(
        array('success' => false, 'message' => 'Dữ liệu không đầy đủ.')
    );
}
?> 