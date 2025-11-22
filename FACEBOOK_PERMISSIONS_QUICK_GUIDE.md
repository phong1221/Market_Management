# Hướng Dẫn Nhanh: Tìm Permissions Settings

## Bạn Đang Ở Đâu?

Bạn đang ở: **Cài đặt ứng dụng > Thông tin cơ bản** (App Settings > Basic Information)

## Cách Đi Đến Permissions Settings

### Cách 1: Qua Facebook Login (Khuyên Dùng)

1. **Trong menu bên trái**, tìm mục **"Đăng nhập bằng Facebo..."** (Login with Facebook)
2. **Nhấp vào** để mở rộng (expand) mục này
3. Bạn sẽ thấy các mục con:
   - **"Cài đặt"** (Settings) ← **Nhấp vào đây**
   - "Bắt đầu nhanh" (Quick Start)
   - "Cấu hình" (Configuration)
4. Trong trang **"Cài đặt"**, cuộn xuống tìm phần **"Permissions"** hoặc **"User Permissions"**

### Cách 2: Qua App Review

1. Trong menu bên trái, tìm **"App Review"** hoặc **"Đánh giá ứng dụng"**
2. Nhấp vào **"Permissions and Features"** hoặc **"Quyền và Tính năng"**
3. Tìm permission **`public_profile`**
4. Nhấp **"Request"** hoặc **"Add"** nếu chưa có

## Hình Ảnh Hướng Dẫn

```
Menu Trái:
├── Bảng điều khiển
├── Hành động cần thực hiện
├── Trường hợp sử dụng
├── Đăng nhập bằng Facebo... ← MỞ RỘNG MỤC NÀY
│   ├── Cài đặt ← NHẤP VÀO ĐÂY
│   ├── Bắt đầu nhanh
│   └── Cấu hình
├── Cài đặt ứng dụng (bạn đang ở đây)
│   ├── Thông tin cơ bản ← BẠN ĐANG Ở ĐÂY
│   └── Nâng cao
└── ...
```

## Sau Khi Vào Facebook Login > Settings

1. Cuộn xuống tìm phần **"Permissions"**
2. Tìm **"User Permissions"** hoặc **"App Permissions"**
3. Thêm:
   ```
   public_profile
   email
   ```
4. Nhấp **"Save Changes"** hoặc **"Lưu thay đổi"**

## Nếu Vẫn Không Thấy

### Thử Cách Khác: App Review

1. Menu trái → **"App Review"** hoặc **"Đánh giá ứng dụng"**
2. Nhấp **"Permissions and Features"**
3. Tìm và thêm permissions:
   - `public_profile`
   - `email`

### Hoặc: Quick Start

1. Menu trái → **"Đăng nhập bằng Facebo..."** → **"Bắt đầu nhanh"**
2. Chọn platform **"Web"**
3. Trong quá trình setup, sẽ có phần cấu hình permissions

## Lưu Ý

- Permissions có thể được cấu hình ở nhiều nơi khác nhau
- Quan trọng nhất là đảm bảo permissions được **thêm vào app**
- Sau khi thêm, đợi vài giây rồi test lại

