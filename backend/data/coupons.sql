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
-- Chỉ mục cho bảng `coupon`
--
ALTER TABLE `coupon`
  ADD PRIMARY KEY (`code`);

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
-- Chỉ mục cho bảng `user_coupon`
--
ALTER TABLE `user_coupon`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_uc_user` (`idUser`),
  ADD KEY `fk_uc_coupon` (`coupon_code`);

--
-- AUTO_INCREMENT cho bảng `user_coupon`
--
ALTER TABLE `user_coupon`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- Các ràng buộc cho bảng `user_coupon`
--
ALTER TABLE `user_coupon`
  ADD CONSTRAINT `fk_uc_user` FOREIGN KEY (`idUser`) REFERENCES `useraccount` (`idUser`),
  ADD CONSTRAINT `fk_uc_coupon` FOREIGN KEY (`coupon_code`) REFERENCES `coupon` (`code`);

--
-- Cập nhật bảng `order`
--
ALTER TABLE `order`
  ADD `coupon_code` varchar(50) DEFAULT NULL,
  ADD `discount_amount` decimal(15,2) DEFAULT 0.00;
