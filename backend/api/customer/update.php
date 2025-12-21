<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, PUT");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

include_once '../../config/Database.php';

$database = new Database();
$db = $database->getConnection();

$data = json_decode(file_get_contents("php://input"));

if (!isset($data->idCustomer)) {
    echo json_encode(["success" => false, "message" => "Thiếu ID khách hàng"]);
    exit();
}

$query = "UPDATE customer SET 
    fullName = ?, 
    phoneNumber = ?, 
    address = ?, 
    email = ?
    WHERE idCustomer = ?";

$stmt = $db->prepare($query);

$fullName = $data->fullName;
$phone = $data->phoneNumber;
$address = $data->address;
$email = $data->email;
$id = $data->idCustomer;

$stmt->bind_param("ssssi", $fullName, $phone, $address, $email, $id);

if ($stmt->execute()) {
    echo json_encode(["success" => true, "message" => "Cập nhật thành công"]);
} else {
    echo json_encode(["success" => false, "message" => "Lỗi cập nhật: " . $stmt->error]);
}
?>
