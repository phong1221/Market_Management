<?php
$servername = "localhost";  // Hoặc IP của server database
$username = "root";         // Tài khoản MySQL
$password = "";             // Mật khẩu MySQL (để trống nếu không có)
$database = "market_management"; // Tên database

// Tạo kết nối
$conn = new mysqli($servername, $username, $password, $database);

// Kiểm tra kết nối
if ($conn->connect_error) {
    die("Kết nối thất bại: " . $conn->connect_error);
}
echo "Kết nối thành công!";

// Đóng kết nối
$conn->close();
?>
