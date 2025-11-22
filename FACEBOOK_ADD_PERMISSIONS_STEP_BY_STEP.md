# Hướng Dẫn Chi Tiết: Thêm Permissions vào Facebook App

## Bạn Đang Ở Đâu?

Bạn đang ở: **Facebook Login > Cài đặt > Cài đặt OAuth ứng dụng**

**Đây KHÔNG phải nơi để thêm Permissions!**

## Cách Thêm Permissions (3 Cách)

### Cách 1: Qua App Review (Khuyên Dùng - Dễ Nhất)

1. **Trong menu bên trái**, tìm mục **"App Review"** hoặc **"Đánh giá ứng dụng"**
2. **Nhấp vào** để mở
3. Bạn sẽ thấy menu con:
   - **"Permissions and Features"** hoặc **"Quyền và Tính năng"** ← **NHẤP VÀO ĐÂY**
4. Trong trang này, bạn sẽ thấy danh sách tất cả permissions
5. Tìm permission **`public_profile`**:
   - Nếu thấy nút **"Request"** hoặc **"Add"** → Nhấp vào
   - Nếu đã có và hiển thị **"In Development"** → OK, đã được thêm rồi
6. Tìm permission **`email`**:
   - Nếu thấy nút **"Request"** hoặc **"Add"** → Nhấp vào
   - Nếu đã có → OK

### Cách 2: Qua Facebook Login > Quick Start

1. Menu trái → **"Đăng nhập bằng Facebo..."** → **"Bắt đầu nhanh"** (Quick Start)
2. Chọn platform **"Web"**
3. Trong quá trình setup, sẽ có bước yêu cầu thêm permissions
4. Thêm `public_profile` và `email`

### Cách 3: Kiểm Tra Trong Code (Nếu Permissions Đã Tự Động Được Thêm)

Có thể Facebook đã tự động thêm `public_profile` khi bạn tạo app. Hãy thử test lại:

1. Đảm bảo code đang request đúng:
   ```javascript
   scope: 'public_profile'
   ```
2. Test đăng nhập lại
3. Nếu vẫn lỗi, thử thêm `email` vào scope:
   ```javascript
   scope: 'email public_profile'
   ```

## Hướng Dẫn Chi Tiết: App Review > Permissions and Features

### Bước 1: Điều Hướng

```
Menu Trái:
├── ...
├── App Review ← NHẤP VÀO ĐÂY
│   └── Permissions and Features ← NHẤP VÀO ĐÂY
├── Đăng nhập bằng Facebo...
│   └── Cài đặt
│       └── Cài đặt OAuth ứng dụng ← BẠN ĐANG Ở ĐÂY
└── ...
```

### Bước 2: Tìm Permissions

Trong trang **"Permissions and Features"**, bạn sẽ thấy:

- Danh sách permissions với các trạng thái:
  - ✅ **Approved** - Đã được approve
  - ⚠️ **In Development** - Đang ở chế độ development (OK cho test)
  - ❌ **Not Requested** - Chưa được request

### Bước 3: Thêm Permissions

1. Tìm **`public_profile`**:
   - Nếu thấy **"Request"** hoặc **"Add"** → Nhấp vào
   - Nếu đã có → Bỏ qua

2. Tìm **`email`** (tùy chọn):
   - Nếu muốn có email, tìm **`email`**
   - Nhấp **"Request"** hoặc **"Add"**

### Bước 4: Lưu và Test

1. Sau khi thêm permissions, đợi vài giây
2. Quay lại app và test đăng nhập
3. Đăng nhập bằng tài khoản Facebook (admin của app hoặc test user)

## Nếu Vẫn Không Thấy "App Review"

### Thử Tìm Trong Menu

Menu có thể hiển thị bằng tiếng Anh hoặc tiếng Việt:

- **Tiếng Anh**: "App Review" → "Permissions and Features"
- **Tiếng Việt**: "Đánh giá ứng dụng" → "Quyền và Tính năng"

### Hoặc Tìm Trực Tiếp

1. Trong thanh tìm kiếm ở trên cùng, gõ: **"permissions"**
2. Hoặc gõ: **"quyền"**
3. Chọn kết quả phù hợp

## Giải Pháp Tạm Thời: Test Với Code Hiện Tại

Nếu không tìm thấy nơi thêm permissions, có thể Facebook đã tự động thêm `public_profile`. Hãy thử:

1. **Đảm bảo Redirect URI đúng:**
   - Trong trang "Cài đặt OAuth ứng dụng" mà bạn đang xem
   - Phần **"URI chuyển hướng OAuth hợp lệ"**
   - Thêm: `http://localhost:3000/auth/facebook/callback`
   - Nhấp **"Lưu thay đổi"**

2. **Test lại đăng nhập:**
   - Refresh trang login
   - Nhấp "Đăng nhập với Facebook"
   - Đăng nhập bằng tài khoản admin của app

## Checklist

Trước khi test, đảm bảo:

- [ ] Redirect URI đã được thêm: `http://localhost:3000/auth/facebook/callback`
- [ ] App ID trong code khớp với App ID trong Dashboard
- [ ] Đang đăng nhập bằng tài khoản admin của app (hoặc test user)
- [ ] App ở chế độ Development (không phải Live)

## Nếu Vẫn Lỗi

1. Chụp màn hình menu bên trái của Facebook Developer Console
2. Gửi cho tôi để tôi hướng dẫn chính xác hơn
3. Hoặc thử cách khác: Tạo app mới và làm lại từ đầu

