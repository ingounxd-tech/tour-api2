<?php
// เรียกใช้ Autoload ของ Composer
require 'vendor/autoload.php';

// นำเข้า library JWT
use Firebase\JWT\JWT;
use Firebase\JWT\Key;

function validate_token() {
    // กำหนด header พื้นฐาน
    header("Access-Control-Allow-Origin: *");
    header("Content-Type: application/json; charset=UTF-8");

    // key ลับต้องเป็นตัวเดียวกับที่ใช้ใน login.php
    $secret_key = "123456789";
    
    // ดึงค่า Authorization header จาก request
    $authHeader = null;
    if (isset($_SERVER['HTTP_AUTHORIZATION'])) {
        $authHeader = $_SERVER['HTTP_AUTHORIZATION'];
    } elseif (isset($_SERVER['HTTP_AUTHORIZATION'])) { // Nginx or fast CGI
        $authHeader = $_SERVER['HTTP_AUTHORIZATION'];
    } elseif (function_exists('apache_request_headers')) {
        $requestHeaders = apache_request_headers();
        if (isset($requestHeaders['Authorization'])) {
            $authHeader = $requestHeaders['Authorization'];
        }
    }

    if (!$authHeader) {
        http_response_code(401); // Unauthorized
        echo json_encode(array("message" => "ไม่พบ Token สำหรับการยืนยันตัวตน"));
        exit();
    }
    
    // แยกคำว่า "Bearer " ออกจาก token
    list($jwt) = sscanf($authHeader, 'Bearer %s');
    
    if ($jwt) {
        try {
            // พยายามถอดรหัส token
            $decoded = JWT::decode($jwt, new Key($secret_key, 'HS256'));
            // ถ้าสำเร็จ, ส่งข้อมูลผู้ใช้กลับไป
            return $decoded;

        } catch (Exception $e) {
            // ถ้าล้มเหลว (token หมดอายุ, token ผิด)
            http_response_code(401); // Unauthorized
            echo json_encode(array("message" => "การเข้าถึงถูกปฏิเสธ", "error" => $e->getMessage()));
            exit();
        }
    } else {
        http_response_code(401); // Unauthorized
        echo json_encode(array("message" => "Token ไม่ถูกต้อง"));
        exit();
    }
}
?>