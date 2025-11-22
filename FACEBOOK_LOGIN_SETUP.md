# Hướng Dẫn Tích Hợp Đăng Nhập Facebook

## Tổng Quan

Dự án đã được tích hợp sẵn đăng nhập Facebook. Bạn chỉ cần cấu hình Facebook App ID và App Secret để sử dụng.

## Bước 1: Tạo Facebook App

1. Truy cập [Facebook Developers](https://developers.facebook.com/)
2. Đăng nhập bằng tài khoản Facebook của bạn
3. Nhấp vào **"My Apps"** ở góc trên bên phải
4. Chọn **"Create App"**
5. Chọn loại app: **"Consumer"** hoặc **"Business"**
6. Điền thông tin:
   - **App Name**: Tên ứng dụng của bạn (ví dụ: "Market Management")
   - **App Contact Email**: Email liên hệ
   - Nhấp **"Create App"**

## Bước 2: Thêm Facebook Login Product

1. Trong dashboard của app vừa tạo, tìm **"Add Product"** hoặc **"Get Started"** với **"Facebook Login"**
2. Nhấp vào **"Set Up"** hoặc **"Get Started"** cho Facebook Login
3. Chọn **"Web"** làm platform

## Bước 3: Cấu Hình OAuth Redirect URIs

1. Trong **Facebook Login > Settings** hoặc **Quick Start > Web**
2. Tìm phần **"Site URL"** hoặc **"Valid OAuth Redirect URIs"**
3. **QUAN TRỌNG**: Điền URL của **Frontend React App** (không phải backend PHP):
   ```
   http://localhost:3000/auth/facebook/callback
   ```
   ⚠️ **LƯU Ý**: 
   - URL này phải là frontend (port 3000), KHÔNG phải backend PHP
   - Nếu frontend chạy ở port khác, thay đổi cho đúng
   - Trong production, thay bằng domain thực tế của bạn

## Bước 4: Lấy App ID và App Secret

1. Trong dashboard, vào **Settings > Basic**
2. Bạn sẽ thấy:
   - **App ID**: Copy giá trị này
   - **App Secret**: Nhấp vào **"Show"** và copy giá trị này

## Bước 5: Cấu Hình Trong Dự Án

### Backend Configuration

Mở file `backend/config/oauth.local.php` và cập nhật:

```php
$FACEBOOK_APP_ID = 'YOUR_ACTUAL_FACEBOOK_APP_ID';  // Thay bằng App ID của bạn
$FACEBOOK_APP_SECRET = 'YOUR_ACTUAL_FACEBOOK_APP_SECRET';  // Thay bằng App Secret của bạn
$FACEBOOK_REDIRECT_URI = 'http://localhost:3000/auth/facebook/callback';
```

### Frontend Configuration

Mở file `frontend/src/config/oauth.js` hoặc `frontend/src/config/oauth.local.js` và cập nhật:

```javascript
facebook: {
  appId: 'YOUR_FACEBOOK_APP_ID',  // Thay bằng App ID của bạn
  appSecret: 'YOUR_FACEBOOK_APP_SECRET',  // Thay bằng App Secret của bạn
  redirectUri: 'http://localhost:3000/auth/facebook/callback',
  scope: 'email public_profile',
}
```

**Lưu ý**: `appSecret` trong frontend chỉ dùng cho demo mode. Trong production, secret chỉ nên ở backend.

## Bước 6: Kiểm Tra App Status

1. Trong Facebook App Dashboard, vào **App Review > Permissions and Features**
2. Đảm bảo các permissions sau được yêu cầu:
   - `email` (cần review nếu app ở chế độ Live)
   - `public_profile` (thường được approve tự động)

## Bước 7: Test Mode vs Live Mode

### Test Mode (Development)
- App ở chế độ Development có thể test với:
  - Tài khoản admin của app
  - Tài khoản được thêm vào **Roles > Test Users**
- Không cần Facebook App Review

### Live Mode (Production)
- Cần submit app để review
- Cần cung cấp Privacy Policy URL và Terms of Service URL
- Chỉ có thể login với tài khoản đã được approve

## Bước 8: Thêm Test Users (Cho Development)

1. Vào **Roles > Test Users**
2. Nhấp **"Add Test Users"**
3. Chọn số lượng test users cần tạo
4. Sử dụng các tài khoản này để test đăng nhập

## Cấu Trúc Files Đã Được Tạo

1. **Backend API**: `backend/api/user/facebookLogin.php`
   - Xử lý OAuth flow với Facebook
   - Lấy thông tin user từ Facebook
   - Tạo hoặc cập nhật user trong database

2. **Frontend Service**: `frontend/src/services/oauthService.js`
   - Đã có sẵn method `facebookLogin()` và `handleFacebookCallback()`

3. **OAuth Callback Component**: `frontend/src/components/OAuthCallback.jsx`
   - Đã hỗ trợ xử lý callback từ Facebook

4. **Login Page**: `frontend/src/pages/User/pages/Login.jsx`
   - Đã có button "Đăng nhập với Facebook"

## Testing

1. Khởi động backend server (PHP)
2. Khởi động frontend: `npm run dev`
3. Truy cập trang login
4. Nhấp vào "Đăng nhập với Facebook"
5. Đăng nhập bằng Facebook account (test user hoặc admin)
6. Kiểm tra xem có redirect về trang home và đã đăng nhập thành công

## Troubleshooting

### Lỗi "Invalid OAuth Redirect URI"
- Kiểm tra redirect URI trong Facebook App Settings phải khớp chính xác với URI trong code
- Đảm bảo không có trailing slash hoặc query parameters

### Lỗi "App Not Setup"
- Đảm bảo đã thêm Facebook Login product
- Kiểm tra App ID và App Secret đã được cấu hình đúng

### Lỗi "Permissions Error"
- Đảm bảo đã request đúng permissions: `email` và `public_profile`
- Nếu app ở Live mode, cần submit để review

### User không được tạo trong database
- Kiểm tra kết nối database
- Kiểm tra logs trong PHP error log
- Đảm bảo table `useraccount` có đủ columns cần thiết

## Lưu Ý Bảo Mật

1. **KHÔNG commit** file `oauth.local.php` và `oauth.local.js` vào git
2. Sử dụng environment variables trong production
3. App Secret phải được giữ bí mật, chỉ dùng ở backend
4. Sử dụng HTTPS trong production

## Tài Liệu Tham Khảo

- [Facebook Login Documentation](https://developers.facebook.com/docs/facebook-login/web)
- [Facebook OAuth Guide](https://developers.facebook.com/docs/facebook-login/guides/web/)
- [Facebook App Review](https://developers.facebook.com/docs/app-review)

