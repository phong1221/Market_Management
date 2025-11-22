<?php
// Bật hiển thị lỗi để debug
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Headers

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS"); 
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

include_once '../../config/Database.php';

$database = new Database();
$db = $database->getConnection(); // This is a mysqli connection

$query = 'SELECT 
            s.idSalary,
            s.idEmployee,
            e.nameEmployee,
            e.roleEmployee,
            s.basicSalary,
            s.bonus,
            s.deduction,
            s.totalSalary,
            s.salaryMonth
          FROM 
            salary s
          LEFT JOIN 
            employee e ON s.idEmployee = e.idEmployee
          ORDER BY
            s.idSalary ASC';

$stmt = $db->prepare($query);

if ($stmt === false) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Lỗi chuẩn bị câu lệnh SQL.']);
    exit();
}

$stmt->execute();
$result = $stmt->get_result();
$num = $result->num_rows;

if($num > 0) {
    $salaries_arr = array();
    $salaries_arr['data'] = array();

    while($row = $result->fetch_assoc()) {
        extract($row);
        $salary_item = array(
            'idSalary' => $idSalary,
            'idEmployee' => $idEmployee,
            'nameEmployee' => $nameEmployee,
            'roleEmployee' => $roleEmployee,
            'basicSalary' => $basicSalary,
            'bonus' => $bonus,
            'deduction' => $deduction,
            'totalSalary' => $totalSalary,
            'salaryMonth' => $salaryMonth
        );
        array_push($salaries_arr['data'], $salary_item);
    }
    http_response_code(200);
    echo json_encode($salaries_arr);
} else {
    http_response_code(200);
    echo json_encode(
        array('data' => array(), 'message' => 'Không tìm thấy lương.')
    );
}
?>
