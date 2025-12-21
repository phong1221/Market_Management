<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') { http_response_code(200); exit(); }
require_once '../../config/Database.php';
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
	http_response_code(405);
	echo json_encode(['success' => false, 'message' => 'Method not allowed']);
	exit;
}

function loginUser() {
	try {
		$database = new Database();
		$conn = $database->getConnection();
		
		$data = json_decode(file_get_contents('php://input'), true);
		
		if (!isset($data['nameUser']) || !isset($data['passWord'])) {
			echo json_encode(['success' => false, 'message' => 'Tên đăng nhập và mật khẩu là bắt buộc']);
			exit;
		}
		
		$username = $conn->real_escape_string($data['nameUser']);
		$password = $data['passWord'];
		
		// Tìm user theo username
		$query = "SELECT * FROM useraccount WHERE nameUser = '$username' LIMIT 1";
		$result = $conn->query($query);
		
		if ($result && $result->num_rows > 0) {
			$user = $result->fetch_assoc();
			$stored_pass = $user['passWord'];
			
			$verificationSuccess = false;
			$needsRehash = false;

			// 1. Kiểm tra hash (nếu mật khẩu đã mã hóa)
			if (password_verify($password, $stored_pass)) {
				$verificationSuccess = true;
				if (password_needs_rehash($stored_pass, PASSWORD_DEFAULT)) {
					$needsRehash = true;
				}
			}
			// 2. Fallback: Kiểm tra plain text (cho mật khẩu cũ chưa mã hóa)
			elseif ($stored_pass === $password) {
				$verificationSuccess = true;
				$needsRehash = true; // Cần mã hóa ngay lập tức
			}

			if ($verificationSuccess) {
				// Nếu cần mã hóa lại (hoặc mới mã hóa lần đầu), cập nhật vào DB
				if ($needsRehash) {
					$newHash = password_hash($password, PASSWORD_DEFAULT);
					$uid = $user['idUser'];
					// Dùng Prepared Statement cho an toàn
					$updateStmt = $conn->prepare("UPDATE useraccount SET passWord = ? WHERE idUser = ?");
					$updateStmt->bind_param("si", $newHash, $uid);
					$updateStmt->execute();
					$updateStmt->close();
				}

				unset($user['passWord']);
				echo json_encode([
					'success' => true,
					'message' => 'Đăng nhập thành công',
					'user' => $user
				]);
			} else {
				echo json_encode([
					'success' => false,
					'message' => 'Tên đăng nhập hoặc mật khẩu không đúng'
				]);
			}
		} else {
			echo json_encode([
				'success' => false,
				'message' => 'Tên đăng nhập hoặc mật khẩu không đúng'
			]);
		}
		$conn->close();
	} catch (Exception $e) {
		http_response_code(500);
		echo json_encode([
			'success' => false,
			'message' => 'Lỗi server: ' . $e->getMessage()
		]);
	}
}

// Gọi hàm xử lý đăng nhập
loginUser();
?> 