# Khắc Phục Lỗi ERR_CONNECTION_REFUSED - Facebook Login

## Vấn Đề

Lỗi: `ERR_CONNECTION_REFUSED` khi gọi `facebookLogin.php`

```
Failed to load resource: net::ERR_CONNECTION_REFUSED
/market_management/backend/api/user/facebookLogin.php:1
```

## Nguyên Nhân

Backend PHP server (XAMPP/Apache) **KHÔNG đang chạy** hoặc URL không đúng.

## Giải Pháp

### Bước 1: Khởi Động XAMPP

1. **Mở XAMPP Control Panel**
2. **Khởi động Apache**:
   - Nhấp nút **"Start"** bên cạnh Apache
   - Đợi đến khi hiển thị màu xanh (running)

### Bước 2: Kiểm Tra Backend Có Hoạt Động Không

Mở trình duyệt và truy cập:
```
http://localhost/market_management/backend/api/user/facebookLogin.php
```

**Kết quả mong đợi:**
- Nếu thấy lỗi JSON hoặc response từ PHP → Backend đang chạy ✅
- Nếu thấy "This site can't be reached" → Backend chưa chạy ❌

### Bước 3: Kiểm Tra URL Trong Code

**File:** `frontend/src/config/oauth.js`

Đảm bảo URL đúng:
```javascript
BACKEND_OAUTH_ENDPOINTS: {
  facebookLogin: 'http://localhost/market_management/backend/api/user/facebookLogin.php',
}
```

**Lưu ý:**
- URL phải khớp với đường dẫn thực tế trong XAMPP
- Nếu project ở thư mục khác, cập nhật cho đúng

### Bước 4: Kiểm Tra File Có Tồn Tại Không

Đảm bảo file tồn tại tại:
```
D:\xamcc\htdocs\Market_Management\backend\api\user\facebookLogin.php
```

### Bước 5: Test Lại

1. Đảm bảo Apache đang chạy
2. Refresh trang login
3. Thử đăng nhập Facebook lại

## Troubleshooting

### Nếu Apache Không Khởi Động Được

1. **Kiểm tra port 80 có bị chiếm không:**
   - Mở Command Prompt (Admin)
   - Chạy: `netstat -ano | findstr :80`
   - Nếu có process khác, tắt nó hoặc đổi port Apache

2. **Đổi port Apache:**
   - XAMPP Control Panel → Config → httpd.conf
   - Tìm `Listen 80` → đổi thành `Listen 8080`
   - Cập nhật URL trong code: `http://localhost:8080/...`

### Nếu Vẫn Lỗi Sau Khi Khởi Động Apache

1. **Kiểm tra đường dẫn:**
   - Đảm bảo project ở đúng thư mục: `D:\xamcc\htdocs\Market_Management`
   - Kiểm tra tên thư mục có đúng không (chữ hoa/thường)

2. **Test trực tiếp file PHP:**
   - Mở: `http://localhost/market_management/backend/api/user/facebookLogin.php`
   - Nếu không mở được → đường dẫn sai

3. **Kiểm tra .htaccess (nếu có):**
   - Có thể có file .htaccess chặn request
   - Tạm thời đổi tên để test

### Nếu Lỗi CORS

Nếu thấy lỗi CORS thay vì connection refused:

1. **Kiểm tra headers trong `facebookLogin.php`:**
   ```php
   header("Access-Control-Allow-Origin: *");
   header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
   header("Access-Control-Allow-Headers: Content-Type, Authorization");
   ```

2. **Đảm bảo đã có trong file**

## Checklist

Trước khi test lại, đảm bảo:

- [ ] Apache đang chạy trong XAMPP
- [ ] Có thể truy cập: `http://localhost/market_management/`
- [ ] File `facebookLogin.php` tồn tại
- [ ] URL trong code khớp với đường dẫn thực tế
- [ ] Không có lỗi PHP syntax

## Test Nhanh

1. Mở terminal/command prompt
2. Chạy:
   ```bash
   curl http://localhost/market_management/backend/api/user/facebookLogin.php
   ```
3. Nếu thấy response → Backend OK ✅
4. Nếu thấy "connection refused" → Apache chưa chạy ❌

## Sau Khi Sửa

1. Khởi động Apache
2. Refresh trang login
3. Test đăng nhập Facebook lại
4. Lỗi `ERR_CONNECTION_REFUSED` sẽ biến mất

