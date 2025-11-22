# Hướng Dẫn Khắc Phục Lỗi "Invalid Scopes: email"

## Vấn Đề

Khi đăng nhập Facebook, bạn gặp lỗi:
```
Invalid Scopes: email. This message is only shown to developers.
```

## Nguyên Nhân

Permission `email` trong Facebook OAuth cần được:
1. **Cấu hình trong Facebook App Dashboard**
2. **Được Facebook approve** (nếu app ở chế độ Live)
3. **User phải là admin/test user** (nếu app ở chế độ Development)

## Giải Pháp Tạm Thời (Đã Áp Dụng)

Tôi đã cập nhật code để **tạm thời chỉ dùng `public_profile`** thay vì `email public_profile`. 

### Files Đã Cập Nhật:
- ✅ `frontend/src/config/oauth.js` - Scope đã đổi thành `'public_profile'`
- ✅ `frontend/src/config/oauth.local.js` - Scope đã đổi thành `'public_profile'`
- ✅ Backend đã xử lý trường hợp không có email (dùng `fb_` + Facebook ID)

### Kết Quả:
- ✅ Đăng nhập Facebook sẽ hoạt động ngay
- ⚠️ Không có email từ Facebook (sẽ dùng Facebook ID làm username)

## Giải Pháp Lâu Dài: Thêm Permission Email

### Bước 1: Cấu Hình Permission trong Facebook App

1. Vào [Facebook Developers](https://developers.facebook.com/)
2. Chọn app của bạn
3. Vào **App Review > Permissions and Features**
4. Tìm permission **`email`**
5. Nhấp **"Request"** hoặc **"Add"**

### Bước 2: Cấu Hình OAuth Settings

1. Vào **Facebook Login > Settings**
2. Trong phần **"User Permissions"**, thêm:
   - `public_profile` (đã có sẵn)
   - `email` (cần thêm)

### Bước 3: Test với Admin/Test User

Nếu app ở chế độ **Development**:
- Chỉ admin của app và test users mới có thể đăng nhập
- Permission `email` sẽ tự động được grant cho admin/test users

**Cách thêm Test User:**
1. Vào **Roles > Test Users**
2. Nhấp **"Add Test Users"**
3. Chọn số lượng cần tạo
4. Sử dụng các tài khoản này để test

### Bước 4: Cập Nhật Code (Sau Khi Permission Được Approve)

Sau khi permission `email` đã được cấu hình và approve, cập nhật lại:

**File: `frontend/src/config/oauth.js`**
```javascript
facebook: {
  appId: '637021939498013',
  appSecret: 'e5e82524247e5389d7cd64b3b954fb03',
  redirectUri: 'http://localhost:3000/auth/facebook/callback',
  scope: 'email public_profile', // ← Thêm lại email
}
```

**File: `frontend/src/config/oauth.local.js`**
```javascript
facebook: {
  // ...
  scope: 'email public_profile' // ← Thêm lại email
}
```

### Bước 5: Submit App để Review (Cho Production)

Nếu muốn app hoạt động với mọi user (không chỉ admin/test users):

1. Vào **App Review > Permissions and Features**
2. Submit permission `email` để review
3. Cung cấp:
   - **Privacy Policy URL**
   - **Terms of Service URL**
   - **Use Case**: Giải thích tại sao bạn cần email
   - **Screenshot**: Chụp màn hình app sử dụng email

## Kiểm Tra Permission Hiện Tại

Để kiểm tra permission nào đang được grant:

1. Vào **App Review > Permissions and Features**
2. Xem danh sách permissions:
   - ✅ **Approved**: Đã được approve, có thể dùng với mọi user
   - ⚠️ **In Development**: Chỉ dùng được với admin/test users
   - ❌ **Not Requested**: Chưa được request

## Lưu Ý

1. **Development Mode**: 
   - Permission `email` chỉ hoạt động với admin và test users
   - Không cần submit để review

2. **Live Mode**:
   - Cần submit permission `email` để review
   - Sau khi approve, mọi user đều có thể cấp permission email

3. **Backend đã xử lý**:
   - Nếu không có email, sẽ dùng `fb_` + Facebook ID làm username
   - User vẫn có thể đăng nhập và sử dụng app bình thường

## Test Ngay Bây Giờ

Với cấu hình hiện tại (chỉ `public_profile`):
1. Khởi động frontend: `npm run dev`
2. Vào trang login
3. Nhấp "Đăng nhập với Facebook"
4. Đăng nhập bằng tài khoản Facebook (admin của app hoặc test user)
5. ✅ Đăng nhập sẽ thành công (không có lỗi scope nữa)

## Khi Nào Cần Email?

- Nếu bạn cần email để:
  - Gửi thông báo
  - Xác thực tài khoản
  - Liên hệ với user
  → Thì cần thêm permission `email` và submit để review

- Nếu chỉ cần đăng nhập:
  - Chỉ dùng `public_profile` là đủ
  - User vẫn có thể đăng nhập và sử dụng app

