# Khắc Phục Lỗi HTTP 400 - Facebook Token Exchange

## Vấn Đề

Lỗi: `Failed to exchange authorization code for token. HTTP Code: 400`

## Nguyên Nhân

HTTP 400 từ Facebook có nghĩa là request không hợp lệ. Có thể do:

1. **Redirect URI không khớp** (phổ biến nhất)
2. **App ID hoặc App Secret sai**
3. **Redirect URI chưa được thêm vào Facebook Dashboard**

## Giải Pháp

### Bước 1: Đảm Bảo Backend Config Đúng

**File:** `backend/config/oauth.local.php`

Đảm bảo có App ID và Secret thực tế:
```php
$FACEBOOK_APP_ID = '774957255569004';
$FACEBOOK_APP_SECRET = '730f42a39c0471997a95f2abf82f3ed4';
$FACEBOOK_REDIRECT_URI = 'http://localhost:3000/auth/facebook/callback';
```

### Bước 2: Kiểm Tra Redirect URI Khớp Chính Xác

Redirect URI phải **KHỚP CHÍNH XÁC** ở 3 nơi:

1. **Frontend config:** `frontend/src/config/oauth.js`
   ```javascript
   redirectUri: 'http://localhost:3000/auth/facebook/callback'
   ```

2. **Backend config:** `backend/config/oauth.local.php`
   ```php
   $FACEBOOK_REDIRECT_URI = 'http://localhost:3000/auth/facebook/callback';
   ```

3. **Facebook Dashboard:** Facebook Login > Settings > Valid OAuth Redirect URIs
   ```
   http://localhost:3000/auth/facebook/callback
   ```

**Lưu ý quan trọng:**
- Phải khớp **CHÍNH XÁC** (không có trailing slash `/`)
- Phải khớp **HOÀN TOÀN** (cả `http` vs `https`, port, path)
- Không có khoảng trắng thừa

### Bước 3: Kiểm Tra Facebook Dashboard

1. Vào [Facebook Developers](https://developers.facebook.com/)
2. Chọn app của bạn
3. **Facebook Login > Settings** (hoặc **Cài đặt OAuth ứng dụng**)
4. Tìm phần **"Valid OAuth Redirect URIs"** hoặc **"URI chuyển hướng OAuth hợp lệ"**
5. Đảm bảo có:
   ```
   http://localhost:3000/auth/facebook/callback
   ```
6. **Lưu thay đổi**

### Bước 4: Kiểm Tra App ID và Secret

1. **Facebook Dashboard > Settings > Basic**
2. Kiểm tra:
   - **App ID** phải khớp với code
   - **App Secret** phải khớp với code
3. Nếu khác, cập nhật lại trong:
   - `backend/config/oauth.local.php`
   - `frontend/src/config/oauth.js`

### Bước 5: Clear Cache và Test Lại

1. **Clear browser cache**
2. **Restart Apache** (nếu cần)
3. **Test lại đăng nhập**

## Debugging

### Xem Log Chi Tiết

Mở file log của PHP để xem chi tiết lỗi:
- XAMPP: `C:\xampp\apache\logs\error.log`
- Hoặc kiểm tra trong browser console

### Test Redirect URI Trực Tiếp

1. Mở browser console
2. Xem URL khi redirect về từ Facebook
3. Đảm bảo URL khớp với redirect URI đã cấu hình

### Kiểm Tra Response Từ Facebook

Trong `facebookLogin.php`, có thể thêm log để xem response:
```php
error_log("Facebook token response: " . $token_response);
```

## Checklist

Trước khi test lại, đảm bảo:

- [ ] App ID trong backend khớp với Facebook Dashboard
- [ ] App Secret trong backend khớp với Facebook Dashboard
- [ ] Redirect URI trong frontend = backend = Facebook Dashboard
- [ ] Redirect URI đã được thêm vào Facebook Dashboard
- [ ] Không có trailing slash trong redirect URI
- [ ] Port 3000 đang chạy (frontend)
- [ ] Apache đang chạy (backend)

## Lưu Ý Quan Trọng

1. **Redirect URI phải khớp 100%** - Facebook rất strict về điều này
2. **Không dùng `localhost` trong production** - Phải dùng domain thực
3. **App Secret phải được giữ bí mật** - Không commit vào git

## Nếu Vẫn Lỗi

1. **Kiểm tra App Mode:**
   - App phải ở chế độ **Development** để test
   - Chỉ admin và test users mới đăng nhập được

2. **Thử với Test User:**
   - Facebook Dashboard > Roles > Test Users
   - Tạo test user mới
   - Đăng nhập bằng test user

3. **Kiểm tra Permissions:**
   - Đảm bảo `public_profile` đã được thêm
   - App Review > Permissions and Features

