<?php

class Database {
    private $host = "localhost";
    private $db_name = "market_management";
    private $username = "root";
    private $password = "";
    public $conn;

    public function getConnection() {
        $this->conn = null;
        try {
            $this->conn = new mysqli($this->host, $this->username, $this->password, $this->db_name);
            if ($this->conn->connect_error) {
                die("Kết nối thất bại: " . $this->conn->connect_error);
            }
        } catch (Exception $e) {
            die("Lỗi kết nối: " . $e->getMessage());
        }
        return $this->conn;
    }
}
?>