-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Máy chủ: 127.0.0.1
-- Thời gian đã tạo: Th7 10, 2025 lúc 03:53 AM
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
(9, 'Toyota', '1750815240_logo_toyota.jpg.crdownload');

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
(8, '2025-06-27 06:44:00', 1, 1200000.00);

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
(2, 2, 'Nguyễn Phước Nam', 21, 'Thanh Hóa', 1234567890);

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
  `Status` enum('Confirmed','Not Confirm') NOT NULL,
  `exportOrderPayment` int(11) NOT NULL,
  `nameUser` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
(1, 'Táo', 'product1.jpg', 'Những quả táo tươi.', 3, 40, 3, 10000, 15000, 4, 3),
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
(13, 'Hamburger', 'product13.jpg', 'Ngon là phải biết.', 1, 0, 1, 30000, 45000, NULL, 1);

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
(1, 'Công Ty Thức Ăn Nhanh SGU', '14/5 đường An Bình , phường 5 , quận 5 , Thành Phố Hồ Chí Minh', 10012123, 'sgu@gmail.com', 1),
(2, 'Công Ty Vật Liệu SGU', '9/2 đường Nguyễn Biểu , phường 11, quận 5 , Thành Phố Hồ Chí Minh', 10091003, 'sgu123@gmail.com', 2),
(3, 'Công Ty Hoa Quả Tươi SGU', '14/7 đường An Dương Vương , phường 10 , quận 5 , Thành Phố Hồ Chí Minh', 10001000, 'sgu321@gmail.com', 3),
(4, 'Cửa Hàng Quà Tặng SGU', '122/2 đường Điện Biên Phủ , phường 11 , quận 11, thành phố Hồ Chí Minh', 10000001, 'sgu13@gmail.com', 4);

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
(4, 'Quà Tặng', 'Bao gồm các món quà xinh đẹp có thể tặng người đặc biệt vào những dịp đặc biệt.', 100, 'Số lượng');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `useraccount`
--

CREATE TABLE `useraccount` (
  `idUser` int(11) NOT NULL,
  `nameUser` varchar(255) NOT NULL,
  `passWord` varchar(255) NOT NULL,
  `roleUser` enum('Admin','Cashier','Manager','User','Stocker','Accountant') NOT NULL DEFAULT 'User'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `useraccount`
--

INSERT INTO `useraccount` (`idUser`, `nameUser`, `passWord`, `roleUser`) VALUES
(1, 'Phong', '123456', 'Admin'),
(2, 'Nam', '123456', 'User');

--
-- Chỉ mục cho các bảng đã đổ
--

--
-- Chỉ mục cho bảng `brand`
--
ALTER TABLE `brand`
  ADD PRIMARY KEY (`idBrand`);

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
  ADD UNIQUE KEY `idUser` (`idUser`);

--
-- AUTO_INCREMENT cho các bảng đã đổ
--

--
-- AUTO_INCREMENT cho bảng `brand`
--
ALTER TABLE `brand`
  MODIFY `idBrand` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT cho bảng `employee`
--
ALTER TABLE `employee`
  MODIFY `idEmployee` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT cho bảng `import`
--
ALTER TABLE `import`
  MODIFY `idImport` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT cho bảng `import_detail`
--
ALTER TABLE `import_detail`
  MODIFY `idImportDetail` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT cho bảng `inforuser`
--
ALTER TABLE `inforuser`
  MODIFY `idInfor` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT cho bảng `product`
--
ALTER TABLE `product`
  MODIFY `idProduct` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT cho bảng `promotion`
--
ALTER TABLE `promotion`
  MODIFY `idPromotion` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT cho bảng `provider`
--
ALTER TABLE `provider`
  MODIFY `idProvider` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT cho bảng `salary`
--
ALTER TABLE `salary`
  MODIFY `idSalary` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT cho bảng `typeproduct`
--
ALTER TABLE `typeproduct`
  MODIFY `idType` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT cho bảng `useraccount`
--
ALTER TABLE `useraccount`
  MODIFY `idUser` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- Các ràng buộc cho các bảng đã đổ
--

--
-- Các ràng buộc cho bảng `inforuser`
--
ALTER TABLE `inforuser`
  ADD CONSTRAINT `inforUser_fk1` FOREIGN KEY (`idUser`) REFERENCES `useraccount` (`idUser`);

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
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
