<?php
date_default_timezone_set('Asia/Ho_Chi_Minh');

/*
 * CẤU HÌNH DƯỚI ĐÂY LÀ VÍ DỤ.
 * BẠN PHẢI THAY BẰNG THÔNG TIN TRONG EMAIL VNPAY GỬI CHO BẠN
 */
$vnp_TmnCode = "54C2WH58"; // Thay bằng mã TmnCode của bạn
$vnp_HashSecret = "OO0S8BL02SCQS0NM4UWVFUBO38LGRK2X"; // Thay bằng HashSecret của bạn
$vnp_Url = "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";
$vnp_Returnurl = "http://localhost:3000/vnpay_return";
$vnp_apiUrl = "http://sandbox.vnpayment.vn/merchant_webapi/merchant.html";
$apiUrl = "https://sandbox.vnpayment.vn/merchant_webapi/api/transaction";
//Config input format
//Expire
$startTime = date("YmdHis");
$expire = date('YmdHis',strtotime('+15 minutes',strtotime($startTime)));
?>