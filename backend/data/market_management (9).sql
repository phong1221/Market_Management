-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Máy chủ: 127.0.0.1
-- Thời gian đã tạo: Th12 21, 2025 lúc 01:15 PM
-- Phiên bản máy phục vụ: 10.4.32-MariaDB
-- Phiên bản PHP: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Cơ sở dữ liệu: `market_management`
--

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `brand`
--

CREATE TABLE `brand` (
  `idBrand` int(11) NOT NULL,
  `nameBrand` varchar(255) NOT NULL,
  `logoBrand` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `brand`
--

INSERT INTO `brand` (`idBrand`, `nameBrand`, `logoBrand`) VALUES
(1, 'Nike', 'logo_Nike.jpg'),
(2, 'Adidas', 'logo_Adidas.png'),
(3, 'Apple', 'logo_Apple.jpg'),
(4, 'Samsung', 'logo_SamSung.png'),
(5, 'Coca-Cola', 'logo_Coca-cola.png'),
(6, 'Pepsi', 'logo_Pepse.png'),
(7, 'McDonald\'s', '1750815223_Logo_MC.png.crdownload'),
(8, 'KFC', 'logo_KFC.png'),
(9, 'Toyota', '1750815240_logo_toyota.jpg.crdownload'),
(11, 'Logitech', 'logo_logitech.png'),
(13, 'Sony', 'logo_sony.png'),
(14, 'Dell', 'logo_dell.png'),
(15, 'Gucci', 'logo_gucci.png'),
(16, 'Uniqlo', 'logo_uniqlo.png'),
(17, 'L\'Oreal', 'logo_loreal.png'),
(18, 'Vinamilk', 'logo_vinamilk.png'),
(19, 'HaoHao', 'logo_haohao.png');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `coupon`
--

CREATE TABLE `coupon` (
  `code` varchar(50) NOT NULL,
  `description` varchar(255) NOT NULL,
  `discount_type` enum('percent','fixed') NOT NULL,
  `discount_value` decimal(15,2) NOT NULL,
  `min_order_value` decimal(15,2) NOT NULL DEFAULT 0.00,
  `expiry_date` date NOT NULL,
  `quantity` int(11) NOT NULL,
  `status` enum('active','inactive') NOT NULL DEFAULT 'active'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `coupon`
--

INSERT INTO `coupon` (`code`, `description`, `discount_type`, `discount_value`, `min_order_value`, `expiry_date`, `quantity`, `status`) VALUES
('FREE50K', 'Giảm 50k cho đơn từ 200k', 'fixed', 50000.00, 200000.00, '2025-12-31', 49, 'active'),
('TEST10', 'Giảm 10% cho đơn từ 100k', 'percent', 10.00, 100000.00, '2025-12-31', 99, 'active');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `customer`
--

CREATE TABLE `customer` (
  `idCustomer` int(11) NOT NULL,
  `fullName` varchar(255) NOT NULL,
  `phoneNumber` varchar(20) NOT NULL,
  `address` text NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  `idUser` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `customer`
--

INSERT INTO `customer` (`idCustomer`, `fullName`, `phoneNumber`, `address`, `email`, `idUser`, `created_at`) VALUES
(1, 'Nguyễn Phước Nam', '1234567890', 'Thanh Hóaa', 'Nam', 2, '2025-12-20 12:40:29'),
(2, 'Chiến Thần A3', '0', '', 'quangphongngaocho@gmail.com', 10, '2025-12-20 12:40:29'),
(3, 'Đặng Quang Phong', '1232343938', 'Khánh Hòa', 'quangphong4321@gmail.com', 11, '2025-12-20 12:40:29'),
(4, 'Tân Đề', '123432332', 'Khánh Hòa', 'cactran91@gmail.com', 12, '2025-12-20 12:40:29'),
(5, 'Đạt', '1234567890', 'Khánh Hòa', 'pdat021@gmail.com', 13, '2025-12-20 12:40:29'),
(6, 'Nguyễn Thị Minh Thi', '2147483647', '14/7 đường Anh Bình , phường 5 , quận 5 , Thành Phố Hồ Chí Minh', NULL, 14, '2025-12-20 12:40:29'),
(7, 'fb_1527137868496473', '', '', NULL, 15, '2025-12-20 12:40:29'),
(8, 'fb_1527137868496473', '', '', NULL, 16, '2025-12-20 12:40:29'),
(9, 'fb_1527137868496473', '', '', NULL, 17, '2025-12-20 12:40:29');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `employee`
--

CREATE TABLE `employee` (
  `idEmployee` int(11) NOT NULL,
  `nameEmployee` varchar(255) NOT NULL,
  `genderEmployee` enum('Male','Female','Other') NOT NULL DEFAULT 'Male',
  `addressEmployee` varchar(255) NOT NULL,
  `phoneEmployee` int(11) NOT NULL,
  `roleEmployee` enum('Cashier','Manager','Accountant','Stocker') NOT NULL DEFAULT 'Cashier'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `employee`
--

INSERT INTO `employee` (`idEmployee`, `nameEmployee`, `genderEmployee`, `addressEmployee`, `phoneEmployee`, `roleEmployee`) VALUES
(1, 'Trần Thị Nhungg', 'Female', 'Bình Dương', 1234345356, 'Cashier'),
(2, 'Nguyễn Quang Thắng', 'Male', 'Đà Nẵng', 1234564567, 'Accountant'),
(3, 'Đặng Thị Mầu', 'Other', 'Khánh Yên', 932452345, 'Accountant'),
(4, 'Con Kiến Huy', 'Other', 'Phú Yên', 1231322345, 'Stocker');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `import`
--

CREATE TABLE `import` (
  `idImport` int(11) NOT NULL,
  `importDate` datetime NOT NULL,
  `idProvider` int(11) NOT NULL,
  `totalAmount` decimal(15,2) DEFAULT 0.00
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `import`
--

INSERT INTO `import` (`idImport`, `importDate`, `idProvider`, `totalAmount`) VALUES
(8, '2025-06-27 06:44:00', 1, 1200000.00),
(9, '2025-12-05 14:24:29', 1, 50000000.00),
(10, '2025-12-05 14:24:29', 5, 200000000.00),
(11, '2025-12-05 14:24:29', 6, 100000000.00);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `import_detail`
--

CREATE TABLE `import_detail` (
  `idImportDetail` int(11) NOT NULL,
  `idImport` int(11) NOT NULL,
  `idProduct` int(11) NOT NULL,
  `quantity` int(11) NOT NULL,
  `importPrice` decimal(10,2) NOT NULL,
  `exportPrice` decimal(10,2) NOT NULL,
  `totalPrice` decimal(15,2) NOT NULL,
  `notes` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `import_detail`
--

INSERT INTO `import_detail` (`idImportDetail`, `idImport`, `idProduct`, `quantity`, `importPrice`, `exportPrice`, `totalPrice`, `notes`) VALUES
(13, 8, 11, 100, 12000.00, 15000.00, 1200000.00, '');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `inforuser`
--

CREATE TABLE `inforuser` (
  `idInfor` int(11) NOT NULL,
  `idUser` int(11) NOT NULL,
  `fullName` varchar(255) NOT NULL,
  `age` int(11) NOT NULL,
  `address` varchar(255) NOT NULL,
  `phone` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `inforuser`
--

INSERT INTO `inforuser` (`idInfor`, `idUser`, `fullName`, `age`, `address`, `phone`) VALUES
(1, 1, 'Đặng Quang Phong', 21, 'Khánh Hòa', 941354084),
(2, 2, 'Nguyễn Phước Nam', 22, 'Thanh Hóaa', 1234567890),
(3, 10, 'Chiến Thần A3', 0, '', 0),
(4, 11, 'Đặng Quang Phong', 20, 'Khánh Hòa', 1232343938),
(5, 12, 'Tân Đề', 12, 'Khánh Hòa', 123432332),
(6, 13, 'Đạt', 21, 'Khánh Hòa', 1234567890),
(7, 14, 'Nguyễn Thị Minh Thi', 45, '14/7 đường Anh Bình , phường 5 , quận 5 , Thành Phố Hồ Chí Minh', 2147483647);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `order`
--

CREATE TABLE `order` (
  `idOrder` int(11) NOT NULL,
  `idUser` int(11) NOT NULL,
  `address` varchar(255) NOT NULL,
  `phone` int(11) NOT NULL,
  `methodpayment` enum('Cash','Banking') NOT NULL,
  `Status` enum('Pending','Paid','Confirmed','Shipping','Completed','Cancelled') NOT NULL DEFAULT 'Pending',
  `totalAmount` decimal(15,2) NOT NULL DEFAULT 0.00,
  `nameUser` varchar(255) NOT NULL,
  `orderDate` datetime DEFAULT current_timestamp(),
  `coupon_code` varchar(50) DEFAULT NULL,
  `discount_amount` decimal(15,2) DEFAULT 0.00,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `order`
--

INSERT INTO `order` (`idOrder`, `idUser`, `address`, `phone`, `methodpayment`, `Status`, `totalAmount`, `nameUser`, `orderDate`, `coupon_code`, `discount_amount`, `created_at`) VALUES
(1, 2, 'Thanh Hóa', 1234567890, 'Banking', 'Paid', 45000.00, 'Nguyễn Phước Nam', '2025-09-25 02:25:04', NULL, 0.00, '2025-12-20 13:01:14'),
(2, 1, 'Khánh Hòa', 941354084, 'Banking', 'Pending', 84000.00, 'Đặng Quang Phong', '2025-03-20 14:24:36', NULL, 0.00, '2025-12-20 13:01:14'),
(3, 2, 'Thanh Hóa', 1234567890, 'Banking', 'Pending', 60000.00, 'Nguyễn Phước Nam', '2025-10-09 09:11:13', NULL, 0.00, '2025-12-20 13:01:14'),
(44, 2, '14/7 đường Anh Bình , phường 5 , quận 5 , Thành Phố Hồ Chí Minh', 2147483647, 'Banking', 'Pending', 272000.00, 'Nam', '2025-05-17 14:07:11', NULL, 0.00, '2025-12-20 13:01:14'),
(49, 12, '14/7 đường Anh Bình , phường 5 , quận 5 , Thành Phố Hồ Chí Minh', 941354084, 'Banking', 'Paid', 15000.00, 'cactran91@gmail.com', '2025-07-03 15:13:59', NULL, 0.00, '2025-12-20 13:01:14'),
(56, 15, '14/7 đường Anh Bình , phường 5 , quận 5 , Thành Phố Hồ Chí Minh', 941354084, 'Cash', 'Pending', 15000.00, 'fb_1527137868496473', '2025-06-13 13:36:42', NULL, 0.00, '2025-12-20 13:01:14'),
(57, 2, '14/7 đường Anh Bình , phường 5 , quận 5 , Thành Phố Hồ Chí Minh', 941354084, 'Banking', 'Pending', 3145000.00, 'Nam', '2025-12-20 18:45:19', 'FREE50K', 50000.00, '2025-12-20 13:01:14'),
(58, 2, '14/7 đường Anh Bình , phường 5 , quận 5 , Thành Phố Hồ Chí Minh', 941354084, 'Banking', 'Pending', 3195000.00, 'Nam', '2025-12-20 18:49:05', NULL, 0.00, '2025-12-20 13:01:14'),
(59, 2, '14/7 đường Anh Bình , phường 5 , quận 5 , Thành Phố Hồ Chí Minh', 941354084, 'Banking', 'Pending', 3195000.00, 'Nam', '2025-12-20 18:49:10', NULL, 0.00, '2025-12-20 13:01:14'),
(60, 11, 'Khánh Hòa', 1232343938, 'Banking', 'Confirmed', 35000.00, 'Đặng Quang Phong', '2025-12-20 19:41:31', NULL, 0.00, '2025-12-20 13:01:14'),
(61, 17, '', 0, 'Cash', 'Pending', 20000.00, 'fb_1527137868496473', '2025-12-20 19:51:56', NULL, 0.00, '2025-12-20 13:01:14'),
(62, 10, '', 0, 'Cash', 'Confirmed', 62000.00, 'Chiến Thần A3', '2025-12-20 19:58:37', NULL, 0.00, '2025-12-20 13:01:14');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `order_detail`
--

CREATE TABLE `order_detail` (
  `idOrderDetail` int(11) NOT NULL,
  `idOrder` int(11) NOT NULL,
  `idProduct` int(11) NOT NULL,
  `quantity` int(11) NOT NULL,
  `unitPrice` decimal(10,2) NOT NULL COMMENT 'Giá tại thời điểm mua',
  `totalPrice` decimal(15,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `order_detail`
--

INSERT INTO `order_detail` (`idOrderDetail`, `idOrder`, `idProduct`, `quantity`, `unitPrice`, `totalPrice`) VALUES
(1, 1, 1, 2, 15000.00, 30000.00),
(2, 1, 2, 1, 15000.00, 15000.00),
(3, 2, 6, 2, 42000.00, 84000.00),
(4, 3, 11, 2, 30000.00, 60000.00),
(46, 44, 2, 2, 15000.00, 30000.00),
(47, 44, 5, 1, 15000.00, 15000.00),
(48, 44, 6, 1, 42000.00, 42000.00),
(49, 44, 3, 1, 20000.00, 20000.00),
(50, 44, 4, 1, 45000.00, 45000.00),
(51, 44, 7, 1, 120000.00, 120000.00),
(61, 49, 2, 1, 15000.00, 15000.00),
(68, 56, 2, 1, 15000.00, 15000.00),
(69, 57, 118, 1, 60000.00, 60000.00),
(70, 57, 1, 2, 1500000.00, 3000000.00),
(71, 57, 5, 1, 15000.00, 15000.00),
(72, 57, 7, 1, 120000.00, 120000.00),
(73, 58, 118, 1, 60000.00, 60000.00),
(74, 58, 1, 2, 1500000.00, 3000000.00),
(75, 58, 5, 1, 15000.00, 15000.00),
(76, 58, 7, 1, 120000.00, 120000.00),
(77, 59, 118, 1, 60000.00, 60000.00),
(78, 59, 1, 2, 1500000.00, 3000000.00),
(79, 59, 5, 1, 15000.00, 15000.00),
(80, 59, 7, 1, 120000.00, 120000.00),
(81, 60, 3, 1, 20000.00, 20000.00),
(82, 60, 2, 1, 15000.00, 15000.00),
(83, 61, 3, 1, 20000.00, 20000.00),
(84, 62, 3, 1, 20000.00, 20000.00),
(85, 62, 6, 1, 42000.00, 42000.00);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `payment_transaction`
--

CREATE TABLE `payment_transaction` (
  `idTransaction` int(11) NOT NULL,
  `idOrder` int(11) NOT NULL,
  `vnp_TxnRef` varchar(50) NOT NULL COMMENT 'Mã tham chiếu gửi sang VNPAY',
  `vnp_TransactionNo` varchar(50) DEFAULT NULL COMMENT 'Mã giao dịch tại VNPAY',
  `vnp_Amount` decimal(15,2) NOT NULL COMMENT 'Số tiền thanh toán (VND)',
  `vnp_BankCode` varchar(20) DEFAULT NULL,
  `vnp_PayDate` varchar(20) DEFAULT NULL,
  `vnp_ResponseCode` varchar(10) DEFAULT NULL,
  `vnp_OrderInfo` varchar(255) DEFAULT NULL,
  `transactionStatus` enum('Pending','Success','Failed') NOT NULL DEFAULT 'Pending',
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `payment_transaction`
--

INSERT INTO `payment_transaction` (`idTransaction`, `idOrder`, `vnp_TxnRef`, `vnp_TransactionNo`, `vnp_Amount`, `vnp_BankCode`, `vnp_PayDate`, `vnp_ResponseCode`, `vnp_OrderInfo`, `transactionStatus`, `created_at`) VALUES
(4, 1, 'ORDER_1_1719388000', '14485236', 4500000.00, 'NCB', '20250626103000', '00', 'Thanh toan don hang 1', 'Success', '2025-11-20 10:55:29'),
(5, 2, 'ORDER_2_1719388100', NULL, 8400000.00, NULL, NULL, NULL, 'Thanh toan don hang 2', 'Pending', '2025-11-20 10:55:29'),
(6, 3, 'ORDER_3_1719388200', '14485299', 6000000.00, 'NCB', '20250626110000', '24', 'Thanh toan don hang 3', 'Failed', '2025-11-20 10:55:29');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `product`
--

CREATE TABLE `product` (
  `idProduct` int(11) NOT NULL,
  `nameProduct` varchar(255) NOT NULL,
  `picture` varchar(255) NOT NULL,
  `descriptionProduct` varchar(255) NOT NULL,
  `idProvider` int(11) NOT NULL,
  `amountProduct` int(11) NOT NULL,
  `idType` int(11) NOT NULL,
  `importCost` decimal(10,0) NOT NULL,
  `exportCost` decimal(10,0) NOT NULL,
  `idPromotion` int(11) DEFAULT NULL,
  `idBrand` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `product`
--

INSERT INTO `product` (`idProduct`, `nameProduct`, `picture`, `descriptionProduct`, `idProvider`, `amountProduct`, `idType`, `importCost`, `exportCost`, `idPromotion`, `idBrand`) VALUES
(1, 'Táo', 'product1.jpg', 'Những quả táo tươi.', 3, 40, 3, 10000, 1500000, 4, 3),
(2, 'Chuối', 'product2.jpg', 'Những quả chuối tươi.', 3, 30, 3, 12000, 15000, 3, 2),
(3, 'Xoài', 'product3.jpg', 'Những quả xoài tươi.', 3, 40, 3, 15000, 20000, NULL, 1),
(4, 'Sầu riêng', 'product4.jpg', 'Những quả sầu riêng.', 3, 40, 3, 30000, 45000, NULL, 2),
(5, 'Chổi', 'product5.jpg', 'Những cây chổi.', 2, 50, 2, 10000, 15000, NULL, 1),
(6, 'Quạt', 'product6.jpg', 'Những cây quạt siêu mạnh.', 2, 20, 2, 30000, 42000, 1, 1),
(7, 'Giường', 'product7.jpg', 'Những chiếc giường siêu êm ái.', 2, 30, 2, 100000, 120000, NULL, 1),
(8, 'Gấu bông', 'product8.jpg', 'Những chú gấu siêu dễ thương', 4, 20, 4, 10000, 12000, NULL, 1),
(9, 'Hoa tươi', 'product9.jpg', 'Nhưng bông hoa xinh đẹp.', 4, 30, 4, 30000, 45000, 3, 1),
(10, 'Nến thơm', 'product10.jpg', 'Những lọ nến thơm phức.', 4, 50, 4, 12000, 16000, NULL, 1),
(11, 'Gà Rán', 'product11.jpg', 'Những miếng gà giòn rụm.', 1, 110, 1, 25000, 30000, NULL, 2),
(12, 'Coca', 'product12.jpg', 'Những lon coca.', 1, 300, 1, 10000, 13000, NULL, 1),
(13, 'Hamburger', 'product13.jpg', 'Ngon là phải biết.', 1, 0, 1, 30000, 45000, NULL, 1),
(93, 'Laptop Dell Inspiron', 'laptop_dell.jpg', 'Laptop văn phòng bền bỉ', 5, 20, 5, 12000000, 15000000, NULL, 14),
(94, 'Tai nghe Sony WH-1000XM5', 'sony_headphone.jpg', 'Tai nghe chống ồn chủ động', 5, 15, 5, 6000000, 8500000, NULL, 13),
(95, 'iPhone 15 Pro Max', 'iphone15.jpg', 'Điện thoại cao cấp Apple', 5, 10, 5, 25000000, 32000000, NULL, 3),
(96, 'Samsung Galaxy S24', 'galaxy_s24.jpg', 'Siêu phẩm AI từ Samsung', 5, 12, 5, 20000000, 24000000, 1, 4),
(97, 'Chuột Logitech', 'mouse_logitech.jpg', 'Chuột không dây tiện lợi', 5, 100, 5, 200000, 350000, NULL, 11),
(98, 'Bàn phím cơ', 'keyboard_mech.jpg', 'Bàn phím gaming led RGB', 5, 50, 5, 800000, 1200000, NULL, 11),
(99, 'Sạc dự phòng', 'powerbank.jpg', 'Dung lượng 20000mAh', 5, 60, 5, 300000, 550000, 2, 4),
(100, 'Áo Thun Nike Sport', 'nike_shirt.jpg', 'Áo thun thể thao thoáng mát', 6, 200, 6, 300000, 600000, NULL, 1),
(101, 'Giày Adidas Ultraboost', 'adidas_shoes.jpg', 'Giày chạy bộ êm ái', 6, 40, 6, 2000000, 3500000, 1, 2),
(102, 'Áo Khoác Uniqlo', 'uniqlo_jacket.jpg', 'Áo khoác chống nắng UV', 6, 80, 6, 500000, 850000, NULL, 16),
(103, 'Túi Xách Gucci Fake', 'gucci_bag.jpg', 'Hàng rep 1:1 siêu cấp', 6, 10, 6, 1500000, 2500000, NULL, 15),
(104, 'Quần Jean Nam', 'jean_men.jpg', 'Phong cách trẻ trung', 6, 150, 6, 250000, 450000, 3, 11),
(105, 'Váy Dạ Hội', 'dress_party.jpg', 'Sang trọng quý phái', 6, 30, 6, 800000, 1500000, NULL, 11),
(106, 'Mũ Lưỡi Trai', 'cap_sport.jpg', 'Năng động cá tính', 6, 120, 6, 50000, 120000, NULL, 1),
(107, 'Mì Hảo Hảo Tôm Chua Cay', 'mi_haohao.jpg', 'Món ăn quốc dân', 1, 1000, 1, 3500, 5000, NULL, 19),
(108, 'Pepsi Không Calo', 'pepsi_zero.jpg', 'Uống ga không sợ béo', 1, 500, 1, 8000, 12000, 4, 6),
(109, 'Combo Gà Rán Gia Đình', 'kfc_combo.jpg', 'Phần ăn cho 4 người', 1, 50, 1, 250000, 350000, NULL, 8),
(110, 'Sữa Tươi Vinamilk', 'milk_vinamilk.jpg', 'Sữa tươi tiệt trùng 1L', 1, 200, 1, 28000, 35000, NULL, 18),
(111, 'Bánh Snack Khoai Tây', 'snack_lays.jpg', 'Vị tảo biển', 1, 300, 1, 12000, 18000, NULL, 5),
(112, 'Nước Suối Aquafina', 'water_aqua.jpg', 'Chai 500ml tinh khiết', 1, 600, 1, 4000, 7000, NULL, 6),
(113, 'Bánh Mì Sandwich', 'bread_sand.jpg', 'Bánh mì tươi mới mỗi ngày', 1, 80, 1, 15000, 25000, NULL, 11),
(114, 'Xúc Xích Đức', 'sausage.jpg', 'Gói 500g', 1, 60, 1, 80000, 110000, NULL, 11),
(115, 'Dưa Hấu Long An', 'watermelon.jpg', 'Dưa hấu đỏ ngọt', 3, 100, 3, 10000, 15000, NULL, 11),
(116, 'Nho Mỹ Không Hạt', 'grape_usa.jpg', 'Nho đen giòn ngọt', 3, 50, 3, 150000, 220000, NULL, 11),
(117, 'Cam Sành', 'orange_vn.jpg', 'Mọng nước nhiều vitamin C', 3, 200, 3, 20000, 35000, NULL, 11),
(118, 'Bơ 034', 'avocado.jpg', 'Bơ sáp dẻo ngon', 3, 80, 3, 40000, 60000, NULL, 11),
(119, 'Thanh Long Ruột Đỏ', 'dragon_fruit.jpg', 'Đặc sản Bình Thuận', 3, 90, 3, 25000, 35000, 3, 11),
(120, 'Kiwi NewZealand', 'kiwi.jpg', 'Chua ngọt tự nhiên', 3, 40, 3, 120000, 180000, NULL, 11),
(121, 'Son Mac Chili', 'lipstick_mac.jpg', 'Màu đỏ gạch quyến rũ', 7, 50, 7, 400000, 650000, NULL, 17),
(122, 'Kem Chống Nắng', 'sunscreen.jpg', 'SPF 50+', 7, 100, 7, 150000, 250000, 2, 17),
(123, 'Nước Tẩy Trang', 'remover.jpg', 'Sạch sâu dịu nhẹ', 7, 120, 7, 120000, 180000, NULL, 17),
(124, 'Sữa Rửa Mặt', 'cleanser.jpg', 'Cho da dầu mụn', 7, 150, 7, 80000, 120000, NULL, 17),
(125, 'Nồi Cơm Điện', 'cooker.jpg', 'Nấu cơm ngon dẻo', 2, 30, 2, 500000, 800000, NULL, 11),
(126, 'Máy Xay Sinh Tố', 'blender.jpg', 'Công suất lớn', 2, 40, 2, 350000, 550000, NULL, 11),
(127, 'Bàn Ủi Hơi Nước', 'iron.jpg', 'Ủi phẳng mọi nếp nhăn', 2, 25, 2, 400000, 650000, 1, 11),
(128, 'Đèn Học Chống Cận', 'lamp_study.jpg', 'Ánh sáng vàng bảo vệ mắt', 2, 60, 2, 150000, 250000, NULL, 11),
(129, 'Thùng Rác Thông Minh', 'trash_smart.jpg', 'Tự động mở nắp', 2, 20, 2, 200000, 350000, NULL, 11);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `promotion`
--

CREATE TABLE `promotion` (
  `idPromotion` int(11) NOT NULL,
  `namePromotion` varchar(255) NOT NULL,
  `descriptionPromotion` varchar(255) NOT NULL,
  `discountPromotion` decimal(10,0) NOT NULL,
  `endtDay` date NOT NULL DEFAULT '2025-01-01',
  `startDay` date NOT NULL DEFAULT '2025-01-01',
  `status` enum('Hoạt động','Không hoạt động') NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `promotion`
--

INSERT INTO `promotion` (`idPromotion`, `namePromotion`, `descriptionPromotion`, `discountPromotion`, `endtDay`, `startDay`, `status`) VALUES
(1, 'Khuyến Mãi Lễ 30/4 - 1/5', 'Áp dụng mã này sẽ được giảm 20%', 20, '2025-01-01', '2025-01-01', 'Hoạt động'),
(2, 'Khuyến Mãi Ngày Quốc Tế Thiếu Nhi', 'Áp dụng mã này sẽ được giảm 25%', 25, '2025-01-01', '2025-01-01', 'Hoạt động'),
(3, 'Khuyến Mãi Ngày 8/3', 'Áp dụng mã này sẽ được giảm 10%', 10, '2025-01-01', '2025-01-01', 'Hoạt động'),
(4, 'Khuyến Mãi ngày Quốc tế Lao Động', 'Áp dụng mã này sẽ được giảm 15%', 15, '2025-01-01', '2025-01-01', 'Hoạt động');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `provider`
--

CREATE TABLE `provider` (
  `idProvider` int(11) NOT NULL,
  `nameProvider` varchar(255) NOT NULL,
  `addressProvider` varchar(255) NOT NULL,
  `phoneProvider` int(11) NOT NULL,
  `emailProvider` varchar(255) NOT NULL,
  `idType` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `provider`
--

INSERT INTO `provider` (`idProvider`, `nameProvider`, `addressProvider`, `phoneProvider`, `emailProvider`, `idType`) VALUES
(1, 'Công Ty Thức Ăn Nhanh SGU', '14/5 đường An Bình, Q5, TP.HCM', 10012123, 'sgu@gmail.com', 1),
(2, 'Công Ty Vật Liệu SGU', '9/2 đường Nguyễn Biểu, Q5, TP.HCM', 10091003, 'sgu123@gmail.com', 2),
(3, 'Công Ty Hoa Quả Tươi SGU', '14/7 đường An Dương Vương, Q5, TP.HCM', 10001000, 'sgu321@gmail.com', 3),
(4, 'Cửa Hàng Quà Tặng SGU', '122/2 đường Điện Biên Phủ, Q11, TP.HCM', 10000001, 'sgu13@gmail.com', 4),
(5, 'Công Ty Công Nghệ Số Sài Gòn', 'Quận 1, TP.HCM', 19001001, 'techsaigon@gmail.com', 5),
(6, 'Xưởng May Mặc Việt Tiến', 'Tân Bình, TP.HCM', 19001002, 'viettien@gmail.com', 6),
(7, 'Nhà Phân Phối Mỹ Phẩm Á Châu', 'Quận 3, TP.HCM', 19001003, 'achaucosmetic@gmail.com', 7);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `salary`
--

CREATE TABLE `salary` (
  `idSalary` int(11) NOT NULL,
  `idEmployee` int(11) NOT NULL,
  `basicSalary` decimal(10,0) NOT NULL,
  `bonus` decimal(10,0) NOT NULL,
  `totalSalary` decimal(10,0) NOT NULL,
  `deduction` decimal(10,0) NOT NULL,
  `salaryMonth` date NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `salary`
--

INSERT INTO `salary` (`idSalary`, `idEmployee`, `basicSalary`, `bonus`, `totalSalary`, `deduction`, `salaryMonth`) VALUES
(1, 1, 10000000, 2000000, 12000000, 0, '2025-06-07'),
(2, 2, 12000000, 2000000, 14000000, 0, '2025-07-01'),
(3, 3, 15000000, 3000000, 18000000, 0, '2025-06-30'),
(4, 4, 13000000, 2000000, 15000000, 0, '2025-06-01');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `typeproduct`
--

CREATE TABLE `typeproduct` (
  `idType` int(11) NOT NULL,
  `nameType` varchar(255) NOT NULL,
  `descriptionType` varchar(255) NOT NULL,
  `inventory` int(11) NOT NULL,
  `typeSell` enum('Số lượng','Khối lượng') NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `typeproduct`
--

INSERT INTO `typeproduct` (`idType`, `nameType`, `descriptionType`, `inventory`, `typeSell`) VALUES
(1, 'Thức ăn', 'Bao gồm thức ăn dinh dưỡng và thức ăn nhanh', 410, 'Số lượng'),
(2, 'Đồ gia dụng', 'Bao gồm các vật dụng cần thiết cho mọi nhà.', 100, 'Số lượng'),
(3, 'Hoa quả', 'Bao gồm các trái cây tươi.', 150, 'Khối lượng'),
(4, 'Quà Tặng', 'Bao gồm các món quà xinh đẹp.', 100, 'Số lượng'),
(5, 'Điện tử', 'Các thiết bị điện tử, công nghệ', 200, 'Số lượng'),
(6, 'Thời trang', 'Quần áo, giày dép, phụ kiện', 500, 'Số lượng'),
(7, 'Mỹ phẩm', 'Sản phẩm chăm sóc sắc đẹp', 300, 'Số lượng');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `useraccount`
--

CREATE TABLE `useraccount` (
  `idUser` int(11) NOT NULL,
  `nameUser` varchar(255) NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  `google_id` varchar(255) DEFAULT NULL,
  `facebook_id` varchar(255) DEFAULT NULL,
  `oauth_provider` enum('google','facebook','local') DEFAULT 'local',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `passWord` varchar(255) NOT NULL,
  `roleUser` enum('Admin','Cashier','Manager','User','Stocker','Accountant') NOT NULL DEFAULT 'User'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `useraccount`
--

INSERT INTO `useraccount` (`idUser`, `nameUser`, `email`, `google_id`, `facebook_id`, `oauth_provider`, `created_at`, `updated_at`, `passWord`, `roleUser`) VALUES
(1, 'Phong', 'Phong', NULL, NULL, 'local', '2025-07-19 00:55:36', '2025-12-20 12:22:02', '123456', 'Admin'),
(2, 'Nam', 'Nam', NULL, NULL, 'local', '2025-07-19 00:55:36', '2025-07-19 00:55:37', '123456', 'User'),
(10, 'quangphongngaocho@gmail.com', 'quangphongngaocho@gmail.com', '103077956485467854385', NULL, 'google', '2025-07-19 00:56:29', '2025-07-19 00:56:29', '', 'User'),
(11, 'quangphong4321@gmail.com', 'quangphong4321@gmail.com', '115858870718464496865', NULL, 'google', '2025-07-19 00:57:03', '2025-07-19 00:57:03', '', 'User'),
(12, 'cactran91@gmail.com', 'cactran91@gmail.com', '114069460930643006746', NULL, 'google', '2025-07-19 00:58:00', '2025-10-09 07:29:03', '123456', 'User'),
(13, 'pdat021@gmail.com', 'pdat021@gmail.com', '100629272830636336521', NULL, 'google', '2025-07-19 01:02:08', '2025-07-19 01:02:08', '', 'User'),
(14, 'Thi', NULL, NULL, NULL, 'local', '2025-07-21 02:48:30', '2025-07-21 02:48:30', '123456', 'User'),
(15, 'fb_1527137868496473', NULL, NULL, NULL, 'local', '2025-11-22 08:55:02', '2025-11-22 08:55:02', '1527137868496473', 'User'),
(16, 'fb_1527137868496473', NULL, NULL, NULL, 'local', '2025-12-05 13:09:28', '2025-12-05 13:09:28', '1527137868496473', 'User'),
(17, 'fb_1527137868496473', NULL, NULL, NULL, 'local', '2025-12-05 13:09:28', '2025-12-05 13:09:28', '1527137868496473', 'User');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `user_coupon`
--

CREATE TABLE `user_coupon` (
  `id` int(11) NOT NULL,
  `idUser` int(11) NOT NULL,
  `coupon_code` varchar(50) NOT NULL,
  `status` enum('available','used') NOT NULL DEFAULT 'available',
  `claimed_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `user_coupon`
--

INSERT INTO `user_coupon` (`id`, `idUser`, `coupon_code`, `status`, `claimed_at`) VALUES
(1, 2, 'FREE50K', 'used', '2025-12-20 18:44:40'),
(2, 2, 'TEST10', 'available', '2025-12-20 18:49:38');

--
-- Chỉ mục cho các bảng đã đổ
--

--
-- Chỉ mục cho bảng `brand`
--
ALTER TABLE `brand`
  ADD PRIMARY KEY (`idBrand`);

--
-- Chỉ mục cho bảng `coupon`
--
ALTER TABLE `coupon`
  ADD PRIMARY KEY (`code`);

--
-- Chỉ mục cho bảng `customer`
--
ALTER TABLE `customer`
  ADD PRIMARY KEY (`idCustomer`),
  ADD KEY `idUser` (`idUser`);

--
-- Chỉ mục cho bảng `employee`
--
ALTER TABLE `employee`
  ADD PRIMARY KEY (`idEmployee`),
  ADD UNIQUE KEY `idEmployee` (`idEmployee`);

--
-- Chỉ mục cho bảng `import`
--
ALTER TABLE `import`
  ADD PRIMARY KEY (`idImport`);

--
-- Chỉ mục cho bảng `import_detail`
--
ALTER TABLE `import_detail`
  ADD PRIMARY KEY (`idImportDetail`);

--
-- Chỉ mục cho bảng `inforuser`
--
ALTER TABLE `inforuser`
  ADD PRIMARY KEY (`idInfor`),
  ADD UNIQUE KEY `idInfor` (`idInfor`),
  ADD KEY `inforUser_fk1` (`idUser`);

--
-- Chỉ mục cho bảng `order`
--
ALTER TABLE `order`
  ADD PRIMARY KEY (`idOrder`);

--
-- Chỉ mục cho bảng `order_detail`
--
ALTER TABLE `order_detail`
  ADD PRIMARY KEY (`idOrderDetail`),
  ADD KEY `fk_od_order` (`idOrder`),
  ADD KEY `fk_od_product` (`idProduct`);

--
-- Chỉ mục cho bảng `payment_transaction`
--
ALTER TABLE `payment_transaction`
  ADD PRIMARY KEY (`idTransaction`),
  ADD KEY `fk_payment_order` (`idOrder`);

--
-- Chỉ mục cho bảng `product`
--
ALTER TABLE `product`
  ADD PRIMARY KEY (`idProduct`),
  ADD UNIQUE KEY `idProduct` (`idProduct`),
  ADD KEY `product_fk3` (`idProvider`),
  ADD KEY `product_fk5` (`idType`),
  ADD KEY `product_fk8` (`idPromotion`);

--
-- Chỉ mục cho bảng `promotion`
--
ALTER TABLE `promotion`
  ADD PRIMARY KEY (`idPromotion`),
  ADD UNIQUE KEY `idPromotion` (`idPromotion`);

--
-- Chỉ mục cho bảng `provider`
--
ALTER TABLE `provider`
  ADD PRIMARY KEY (`idProvider`),
  ADD UNIQUE KEY `idProvider` (`idProvider`),
  ADD KEY `provider_fk_type` (`idType`);

--
-- Chỉ mục cho bảng `salary`
--
ALTER TABLE `salary`
  ADD PRIMARY KEY (`idSalary`),
  ADD UNIQUE KEY `idSalary` (`idSalary`),
  ADD KEY `salary_fk1` (`idEmployee`);

--
-- Chỉ mục cho bảng `typeproduct`
--
ALTER TABLE `typeproduct`
  ADD PRIMARY KEY (`idType`),
  ADD UNIQUE KEY `idType` (`idType`);

--
-- Chỉ mục cho bảng `useraccount`
--
ALTER TABLE `useraccount`
  ADD PRIMARY KEY (`idUser`),
  ADD UNIQUE KEY `idUser` (`idUser`),
  ADD UNIQUE KEY `unique_email` (`email`),
  ADD UNIQUE KEY `unique_google_id` (`google_id`),
  ADD UNIQUE KEY `unique_facebook_id` (`facebook_id`);

--
-- Chỉ mục cho bảng `user_coupon`
--
ALTER TABLE `user_coupon`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_uc_user` (`idUser`),
  ADD KEY `fk_uc_coupon` (`coupon_code`);

--
-- AUTO_INCREMENT cho các bảng đã đổ
--

--
-- AUTO_INCREMENT cho bảng `brand`
--
ALTER TABLE `brand`
  MODIFY `idBrand` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT cho bảng `customer`
--
ALTER TABLE `customer`
  MODIFY `idCustomer` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT cho bảng `employee`
--
ALTER TABLE `employee`
  MODIFY `idEmployee` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT cho bảng `import`
--
ALTER TABLE `import`
  MODIFY `idImport` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT cho bảng `import_detail`
--
ALTER TABLE `import_detail`
  MODIFY `idImportDetail` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT cho bảng `inforuser`
--
ALTER TABLE `inforuser`
  MODIFY `idInfor` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT cho bảng `order`
--
ALTER TABLE `order`
  MODIFY `idOrder` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=63;

--
-- AUTO_INCREMENT cho bảng `order_detail`
--
ALTER TABLE `order_detail`
  MODIFY `idOrderDetail` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=86;

--
-- AUTO_INCREMENT cho bảng `payment_transaction`
--
ALTER TABLE `payment_transaction`
  MODIFY `idTransaction` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT cho bảng `product`
--
ALTER TABLE `product`
  MODIFY `idProduct` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=130;

--
-- AUTO_INCREMENT cho bảng `promotion`
--
ALTER TABLE `promotion`
  MODIFY `idPromotion` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT cho bảng `provider`
--
ALTER TABLE `provider`
  MODIFY `idProvider` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT cho bảng `salary`
--
ALTER TABLE `salary`
  MODIFY `idSalary` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT cho bảng `typeproduct`
--
ALTER TABLE `typeproduct`
  MODIFY `idType` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT cho bảng `useraccount`
--
ALTER TABLE `useraccount`
  MODIFY `idUser` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT cho bảng `user_coupon`
--
ALTER TABLE `user_coupon`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- Các ràng buộc cho các bảng đã đổ
--

--
-- Các ràng buộc cho bảng `customer`
--
ALTER TABLE `customer`
  ADD CONSTRAINT `customer_ibfk_1` FOREIGN KEY (`idUser`) REFERENCES `useraccount` (`idUser`) ON DELETE SET NULL;

--
-- Các ràng buộc cho bảng `inforuser`
--
ALTER TABLE `inforuser`
  ADD CONSTRAINT `inforUser_fk1` FOREIGN KEY (`idUser`) REFERENCES `useraccount` (`idUser`);

--
-- Các ràng buộc cho bảng `order_detail`
--
ALTER TABLE `order_detail`
  ADD CONSTRAINT `fk_od_order` FOREIGN KEY (`idOrder`) REFERENCES `order` (`idOrder`),
  ADD CONSTRAINT `fk_od_product` FOREIGN KEY (`idProduct`) REFERENCES `product` (`idProduct`);

--
-- Các ràng buộc cho bảng `payment_transaction`
--
ALTER TABLE `payment_transaction`
  ADD CONSTRAINT `fk_payment_order` FOREIGN KEY (`idOrder`) REFERENCES `order` (`idOrder`);

--
-- Các ràng buộc cho bảng `product`
--
ALTER TABLE `product`
  ADD CONSTRAINT `product_fk3` FOREIGN KEY (`idProvider`) REFERENCES `provider` (`idProvider`),
  ADD CONSTRAINT `product_fk5` FOREIGN KEY (`idType`) REFERENCES `typeproduct` (`idType`),
  ADD CONSTRAINT `product_fk8` FOREIGN KEY (`idPromotion`) REFERENCES `promotion` (`idPromotion`);

--
-- Các ràng buộc cho bảng `provider`
--
ALTER TABLE `provider`
  ADD CONSTRAINT `provider_fk_type` FOREIGN KEY (`idType`) REFERENCES `typeproduct` (`idType`);

--
-- Các ràng buộc cho bảng `salary`
--
ALTER TABLE `salary`
  ADD CONSTRAINT `salary_fk1` FOREIGN KEY (`idEmployee`) REFERENCES `employee` (`idEmployee`);

--
-- Các ràng buộc cho bảng `user_coupon`
--
ALTER TABLE `user_coupon`
  ADD CONSTRAINT `fk_uc_coupon` FOREIGN KEY (`coupon_code`) REFERENCES `coupon` (`code`),
  ADD CONSTRAINT `fk_uc_user` FOREIGN KEY (`idUser`) REFERENCES `useraccount` (`idUser`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
