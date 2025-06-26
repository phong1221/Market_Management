<?php
// Test file để kiểm tra API provider
error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "=== Test Provider API ===\n";

// Test GET API
echo "1. Testing GET API...\n";
$url = "http://localhost/market_management/backend/api/provider/getProvider.php";
$response = file_get_contents($url);
$data = json_decode($response, true);

if ($data && isset($data['success']) && $data['success']) {
    echo "GET API thành công!\n";
    echo "Số lượng provider: " . count($data['data']) . "\n";
    
    if (count($data['data']) > 0) {
        echo "Provider đầu tiên:\n";
        $firstProvider = $data['data'][0];
        foreach ($firstProvider as $key => $value) {
            echo "  $key: $value\n";
        }
    }
} else {
    echo "GET API thất bại: " . ($data['message'] ?? 'Unknown error') . "\n";
}

echo "\n=== Test TypeProduct API ===\n";

// Test TypeProduct API
$typeUrl = "http://localhost/market_management/backend/api/typeProduct/getTypeProduct.php";
$typeResponse = file_get_contents($typeUrl);
$typeData = json_decode($typeResponse, true);

if ($typeData && isset($typeData['success']) && $typeData['success']) {
    echo "TypeProduct API thành công!\n";
    echo "Số lượng loại sản phẩm: " . count($typeData['data']) . "\n";
    
    if (count($typeData['data']) > 0) {
        echo "Loại sản phẩm đầu tiên:\n";
        $firstType = $typeData['data'][0];
        foreach ($firstType as $key => $value) {
            echo "  $key: $value\n";
        }
    }
} else {
    echo "TypeProduct API thất bại: " . ($typeData['message'] ?? 'Unknown error') . "\n";
}

echo "\n=== Test Database Connection ===\n";

// Test database connection
require_once 'config/Database.php';
$database = new Database();
$conn = $database->getConnection();

if ($conn) {
    echo "Database connection thành công!\n";
    
    // Test query provider với JOIN
    $sql = "SELECT p.*, tp.nameType FROM provider p LEFT JOIN typeproduct tp ON p.idType = tp.idType";
    $result = $conn->query($sql);
    
    if ($result) {
        echo "Query JOIN thành công!\n";
        echo "Số lượng kết quả: " . $result->num_rows . "\n";
        
        if ($result->num_rows > 0) {
            echo "Kết quả đầu tiên:\n";
            $row = $result->fetch_assoc();
            foreach ($row as $key => $value) {
                echo "  $key: $value\n";
            }
        }
    } else {
        echo "Query JOIN thất bại: " . $conn->error . "\n";
    }
    
    $conn->close();
} else {
    echo "Database connection thất bại!\n";
}

echo "\nTest hoàn thành!\n";
?> 