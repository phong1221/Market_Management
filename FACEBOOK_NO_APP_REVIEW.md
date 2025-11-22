# Không Thấy App Review? Giải Pháp Thay Thế

## Vấn Đề

Bạn không thấy mục **"App Review"** trong menu bên trái.

## Giải Pháp 1: Tìm Bằng Tên Khác

Menu có thể hiển thị bằng tiếng Việt hoặc ẩn. Thử tìm:

- **"Đánh giá ứng dụng"** (tiếng Việt)
- **"App Review"** (tiếng Anh)
- **"Review"** (rút gọn)
- **"Permissions"** (trực tiếp)

## Giải Pháp 2: Thêm Permissions Trong Facebook Login Settings

### Cách Làm:

1. **Menu trái** → **"Đăng nhập bằng Facebo..."** (Facebook Login)
2. Nhấp **"Cài đặt"** (Settings)
3. Cuộn xuống tìm phần có tên:
   - **"Permissions"**
   - **"User Permissions"**
   - **"App Permissions"**
   - **"Quyền người dùng"**
4. Nếu thấy ô text hoặc danh sách, thêm:
   ```
   public_profile
   email
   ```
5. Nhấp **"Lưu thay đổi"** hoặc **"Save Changes"**

## Giải Pháp 3: Thêm Permissions Qua URL Trực Tiếp

Có thể permissions đã tự động được thêm khi bạn request trong code. Hãy thử test lại:

1. **Đảm bảo Redirect URI đã được thêm:**
   - Vào **Facebook Login > Cài đặt > Cài đặt OAuth ứng dụng**
   - Phần **"URI chuyển hướng OAuth hợp lệ"**
   - Thêm: `http://localhost:3000/auth/facebook/callback`
   - Lưu

2. **Test đăng nhập:**
   - Refresh trang login
   - Nhấp "Đăng nhập với Facebook"
   - Đăng nhập bằng tài khoản admin của app

## Giải Pháp 4: Kiểm Tra App Mode

Có thể app chưa được kích hoạt đầy đủ:

1. **Menu trái** → **"Cài đặt ứng dụng"** → **"Thông tin cơ bản"**
2. Kiểm tra **"App Mode"** hoặc **"Chế độ ứng dụng"**:
   - Phải là **"Development"** hoặc **"Phát triển"**
   - Nếu là **"Live"**, có thể cần submit để review

## Giải Pháp 5: Thêm Permissions Trong Code (Tạm Thời)

Nếu không tìm thấy nơi cấu hình, có thể Facebook sẽ tự động thêm permissions khi bạn request trong code. Hãy đảm bảo code đúng:

**File: `frontend/src/config/oauth.js`**
```javascript
facebook: {
  appId: '637021939498013',
  appSecret: 'e5e82524247e5389d7cd64b3b954fb03',
  redirectUri: 'http://localhost:3000/auth/facebook/callback',
  scope: 'public_profile', // Đảm bảo có scope này
}
```

## Giải Pháp 6: Tìm Trong Thanh Tìm Kiếm

1. **Ở trên cùng của trang**, có thanh tìm kiếm
2. Gõ: **"permissions"** hoặc **"quyền"**
3. Chọn kết quả phù hợp

## Giải Pháp 7: Kiểm Tra Roles

Có thể permissions được quản lý trong Roles:

1. **Menu trái** → **"Vai trò trong ứng dụng"** (Roles in app)
2. Kiểm tra xem có phần permissions không

## Checklist Trước Khi Test

Đảm bảo bạn đã:

- [ ] Thêm Redirect URI: `http://localhost:3000/auth/facebook/callback`
- [ ] App ở chế độ Development
- [ ] Đang đăng nhập bằng tài khoản admin của app
- [ ] Code đang request scope: `public_profile`

## Nếu Vẫn Không Được

Có thể app mới tạo chưa có đầy đủ tính năng. Hãy:

1. **Chụp màn hình menu bên trái** và gửi cho tôi
2. Hoặc **mô tả các mục bạn thấy** trong menu
3. Tôi sẽ hướng dẫn chính xác hơn

## Lưu Ý Quan Trọng

- **`public_profile`** là permission mặc định, có thể đã tự động được thêm
- Nếu app ở Development mode, chỉ admin và test users mới đăng nhập được
- Có thể lỗi không phải do permissions mà do Redirect URI chưa được thêm

