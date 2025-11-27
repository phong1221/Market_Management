<?php
// Cho phép mọi nguồn truy cập (hoặc thay * bằng http://localhost:3000 để bảo mật hơn)
header("Access-Control-Allow-Origin: *");

// Cho phép các phương thức HTTP
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");

// Cho phép các Header cụ thể
header("Access-Control-Allow-Headers: Content-Type, Authorization");

// Xử lý preflight request (quan trọng nếu bạn dùng method POST hoặc gửi JSON)
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}
// Bật hiển thị lỗi để debug
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Cấu hình Content-Type (CORS được cấu hình trong .htaccess)
header("Content-Type: application/json; charset=UTF-8");

// Xử lý preflight request (OPTIONS)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
	http_response_code(200);
	exit();
}

// Kiểm tra phương thức request
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
	echo json_encode(["success" => false, "message" => "Chỉ chấp nhận phương thức GET"]);
	exit();
}

require_once '../../config/Database.php';

// Khởi tạo kết nối database
$database = new Database();
$conn = $database->getConnection();

// Kiểm tra kết nối
if (!$conn) {
	echo json_encode([
		"success" => false,
		"message" => "Lỗi kết nối cơ sở dữ liệu"
	]);
	exit();
}

// Tạo truy vấn SQL với JOIN để lấy thông tin chi tiết
$sql = "SELECT p.idProduct, p.nameProduct, p.picture, p.descriptionProduct, 
               p.idProvider, p.amountProduct, p.idType, p.importCost, p.exportCost, 
               p.idPromotion, p.idBrand,
               pr.nameProvider,
               tp.nameType,
               pro.namePromotion,
               b.nameBrand as brandName
        FROM product p
        LEFT JOIN provider pr ON p.idProvider = pr.idProvider
        LEFT JOIN typeproduct tp ON p.idType = tp.idType
        LEFT JOIN promotion pro ON p.idPromotion = pro.idPromotion
        LEFT JOIN brand b ON p.idBrand = b.idBrand
        ORDER BY p.idProduct";

$result = $conn->query($sql);

if ($result) {
	$products = [];
	while ($row = $result->fetch_assoc()) {
		$products[] = [
			"idProduct" => $row["idProduct"],
			"nameProduct" => $row["nameProduct"],
			"picture" => $row["picture"],
			"descriptionProduct" => $row["descriptionProduct"],
			"idProvider" => $row["idProvider"],
			"amountProduct" => $row["amountProduct"],
			"idType" => $row["idType"],
			"importCost" => $row["importCost"],
			"exportCost" => $row["exportCost"],
			"idPromotion" => $row["idPromotion"],
			"idBrand" => $row["idBrand"],
			"nameProvider" => $row["nameProvider"],
			"nameType" => $row["nameType"],
			"namePromotion" => $row["namePromotion"],
			"brandName" => $row["brandName"]
		];
	}
	echo json_encode([
		"success" => true,
		"data" => $products
	]);
} else {
	echo json_encode([
		"success" => false,
		"message" => "Lỗi khi lấy danh sách sản phẩm: " . $conn->error
	]);
}

// Đóng kết nối
$conn->close();
?>
