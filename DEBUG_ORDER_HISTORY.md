# Hướng Dẫn Debug Lịch Sử Đơn Hàng

## Vấn Đề

Sau khi thanh toán thành công, đơn hàng không hiển thị trong lịch sử đơn hàng.

## Các Bước Debug

### 1. Kiểm Tra Console Logs (Frontend)

Mở Browser Console (F12) và kiểm tra:

1. **Khi vào trang OrderHistory:**
   - Xem log: `OrderHistory: Loading orders for user: [idUser]`
   - Xem log: `fetchUserOrders: Calling API: [URL]`
   - Xem log: `fetchUserOrders: API response: [data]`
   - Xem log: `fetchUserOrders: Found [number] orders`

2. **Khi checkout:**
   - Xem log: `PAYLOAD GỬI ĐI: [payload]`
   - Xem log: `User ID: [idUser]`
   - Đảm bảo `idUser` không phải là `0` hoặc `undefined`

### 2. Kiểm Tra PHP Error Logs (Backend)

Kiểm tra file log của PHP (thường ở `C:\xampp\apache\logs\error.log`):

1. **Khi tạo đơn hàng:**
   ```
   create_order - idUser: [idUser]
   create_order - Order created successfully with idOrder: [idOrder], idUser: [idUser]
   ```

2. **Khi lấy đơn hàng:**
   ```
   getUserOrders - idUser: [idUser]
   getUserOrders - Found [number] orders for user [idUser]
   ```

### 3. Kiểm Tra Database

Chạy query SQL để kiểm tra:

```sql
-- Kiểm tra đơn hàng của user cụ thể
SELECT * FROM `order` WHERE idUser = [YOUR_USER_ID] ORDER BY idOrder DESC;

-- Kiểm tra tất cả đơn hàng
SELECT idOrder, idUser, nameUser, Status, totalAmount, created_at 
FROM `order` 
ORDER BY idOrder DESC 
LIMIT 10;

-- Kiểm tra đơn hàng có idUser = 0 (có thể bị lỗi)
SELECT * FROM `order` WHERE idUser = 0;
```

### 4. Kiểm Tra API Trực Tiếp

Mở browser và truy cập:
```
http://localhost/market_management/backend/api/order/getUserOrders.php?idUser=[YOUR_USER_ID]
```

Kiểm tra response:
- Nếu thấy `{"success":true,"data":[...]}` → API hoạt động
- Nếu thấy `{"success":false,"message":"..."}` → Có lỗi

### 5. Kiểm Tra User Object

Trong Browser Console, chạy:
```javascript
const user = JSON.parse(localStorage.getItem('user'));
console.log('User object:', user);
console.log('User ID:', user?.idUser);
```

Đảm bảo:
- `user` không phải `null`
- `user.idUser` có giá trị và không phải `0`

## Các Vấn Đề Thường Gặp

### Vấn Đề 1: idUser = 0

**Nguyên nhân:** User chưa đăng nhập hoặc user object không có idUser

**Giải pháp:**
- Đảm bảo user đã đăng nhập
- Kiểm tra user object có `idUser` không
- Xem log trong Checkout để đảm bảo idUser được gửi đúng

### Vấn Đề 2: Đơn Hàng Có idUser = 0

**Nguyên nhân:** Khi tạo đơn hàng, idUser không được gửi hoặc = 0

**Giải pháp:**
- Kiểm tra payload trong Checkout.jsx
- Đảm bảo `user.idUser` có giá trị trước khi gửi
- Xem log trong create_order.php

### Vấn Đề 3: API Không Trả Về Đơn Hàng

**Nguyên nhân:** Query SQL không tìm thấy đơn hàng

**Giải pháp:**
- Kiểm tra database có đơn hàng với idUser đúng không
- Kiểm tra query SQL trong getUserOrders.php
- Xem log để biết số lượng đơn hàng tìm được

### Vấn Đề 4: Frontend Không Gọi API

**Nguyên nhân:** Component không load hoặc user không có idUser

**Giải pháp:**
- Kiểm tra console logs
- Đảm bảo user đã đăng nhập
- Kiểm tra useEffect có chạy không

## Cách Test

1. **Test Tạo Đơn Hàng:**
   - Đăng nhập với user có idUser hợp lệ
   - Thêm sản phẩm vào giỏ
   - Checkout và thanh toán
   - Kiểm tra console logs
   - Kiểm tra database có đơn hàng mới không

2. **Test Hiển Thị Đơn Hàng:**
   - Vào trang `/user/orders`
   - Kiểm tra console logs
   - Kiểm tra network tab xem API có được gọi không
   - Kiểm tra response từ API

3. **Test Sau Thanh Toán:**
   - Thanh toán thành công
   - Click "Xem đơn hàng" hoặc vào `/user/orders`
   - Đảm bảo đơn hàng mới hiển thị

## Fix Đã Áp Dụng

1. ✅ Thêm validation idUser trong Checkout
2. ✅ Thêm logging vào create_order.php
3. ✅ Thêm logging vào getUserOrders.php
4. ✅ Thêm logging vào frontend
5. ✅ Sửa VNPayReturn để navigate đến /user/orders
6. ✅ Thêm auto-reload khi focus window

## Sau Khi Fix

Nếu vẫn không hiển thị, kiểm tra:
1. Database có đơn hàng với idUser đúng không
2. API có trả về đơn hàng không
3. Frontend có nhận được data không
4. Component có render đúng không

