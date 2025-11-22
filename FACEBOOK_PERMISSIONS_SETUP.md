# Hướng Dẫn Cấu Hình Permissions trong Facebook App

## Vấn Đề

Bạn gặp lỗi:
```
Có vẻ như ứng dụng này không hoạt động
Ứng dụng này cần ít nhất một supported permission.
```

## Nguyên Nhân

Facebook App của bạn chưa được cấu hình permissions trong Facebook App Dashboard. Mặc dù code đã request `public_profile`, nhưng app cần được cấu hình trong Dashboard trước.

## Giải Pháp: Cấu Hình Permissions trong Facebook App Dashboard

### Bước 1: Vào Facebook Login Settings

1. Truy cập [Facebook Developers](https://developers.facebook.com/)
2. Chọn app của bạn (Market Management)
3. Trong menu bên trái, tìm **"Facebook Login"**
4. Nhấp vào **"Settings"** (Cài đặt)

### Bước 2: Thêm User Permissions

1. Trong trang **Facebook Login > Settings**, cuộn xuống phần **"Permissions"**
2. Tìm phần **"User Permissions"** hoặc **"App Permissions"**
3. Thêm các permissions sau (mỗi permission trên một dòng):
   ```
   public_profile
   email
   ```
4. Nhấp **"Save Changes"** hoặc **"Lưu thay đổi"**

### Bước 3: Kiểm Tra App Review (Nếu Cần)

1. Vào **App Review > Permissions and Features**
2. Kiểm tra xem permissions có trạng thái:
   - ✅ **Approved**: Đã được approve (có thể dùng với mọi user)
   - ⚠️ **In Development**: Chỉ dùng được với admin/test users (OK cho development)
   - ❌ **Not Requested**: Chưa được request

### Bước 4: Đảm Bảo App ở Chế Độ Development

1. Vào **Settings > Basic**
2. Kiểm tra **"App Mode"**:
   - Nếu là **Development**: OK, có thể test với admin/test users
   - Nếu là **Live**: Cần submit permissions để review

### Bước 5: Thêm Test Users (Nếu Cần)

Nếu app ở chế độ Development và bạn muốn test với nhiều tài khoản:

1. Vào **Roles > Test Users**
2. Nhấp **"Add Test Users"**
3. Chọn số lượng test users cần tạo
4. Sử dụng các tài khoản này để test đăng nhập

## Cấu Hình Chi Tiết

### Option 1: Cấu Hình trong Facebook Login Settings

**Đường dẫn:** Facebook Login > Settings > Permissions

Thêm vào **"User Permissions"**:
```
public_profile
email
```

### Option 2: Cấu Hình trong App Review

**Đường dẫn:** App Review > Permissions and Features

1. Tìm permission **`public_profile`**
2. Nhấp **"Request"** hoặc **"Add"** (nếu chưa có)
3. Tìm permission **`email`**
4. Nhấp **"Request"** hoặc **"Add"** (nếu cần)

## Lưu Ý Quan Trọng

### Development Mode
- ✅ Permissions sẽ tự động hoạt động với **admin của app**
- ✅ Permissions sẽ tự động hoạt động với **test users**
- ❌ Permissions KHÔNG hoạt động với user thường

### Live Mode
- ✅ Sau khi submit và được approve, permissions hoạt động với mọi user
- ⚠️ Cần cung cấp Privacy Policy và Terms of Service

## Kiểm Tra Sau Khi Cấu Hình

1. Refresh trang login của bạn
2. Nhấp "Đăng nhập với Facebook"
3. Đăng nhập bằng tài khoản Facebook (admin của app hoặc test user)
4. ✅ Nếu thành công, bạn sẽ được redirect về app

## Troubleshooting

### Vẫn Báo Lỗi "Cần ít nhất một supported permission"

1. **Kiểm tra lại permissions đã được lưu chưa:**
   - Vào Facebook Login > Settings
   - Xem phần Permissions có hiển thị `public_profile` và `email` không

2. **Kiểm tra App ID:**
   - Đảm bảo App ID trong code khớp với App ID trong Dashboard
   - File: `frontend/src/config/oauth.js`

3. **Clear cache và thử lại:**
   - Clear browser cache
   - Thử đăng nhập lại

4. **Kiểm tra Redirect URI:**
   - Đảm bảo Redirect URI trong Dashboard là: `http://localhost:3000/auth/facebook/callback`
   - File: Facebook Login > Settings > Valid OAuth Redirect URIs

### Permission Không Hoạt Động

1. **Kiểm tra user đang đăng nhập:**
   - App ở Development mode chỉ hoạt động với admin/test users
   - Đảm bảo bạn đang dùng tài khoản admin của app

2. **Kiểm tra App Mode:**
   - Vào Settings > Basic
   - Nếu là Live mode, cần submit permissions để review

## Cấu Hình Tối Thiểu (Chỉ Để Test)

Nếu chỉ muốn test nhanh, chỉ cần thêm:
```
public_profile
```

Vào **Facebook Login > Settings > User Permissions**

Sau đó trong code, giữ nguyên:
```javascript
scope: 'public_profile'
```

## Sau Khi Cấu Hình Xong

1. ✅ Permissions đã được thêm vào Dashboard
2. ✅ Code đã request đúng permissions
3. ✅ Test với admin/test user
4. ✅ Đăng nhập sẽ hoạt động!

## Tiếp Theo

Sau khi đăng nhập hoạt động, nếu muốn có email:
1. Thêm `email` vào permissions (nếu chưa có)
2. Cập nhật code: `scope: 'email public_profile'`
3. Submit để review (nếu app ở Live mode)

