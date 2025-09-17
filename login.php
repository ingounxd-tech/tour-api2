<?php
// เรียกใช้ไฟล์ autoload ของ Composer และไฟล์เชื่อมต่อฐานข้อมูล
require 'vendor/autoload.php';
include 'db_connect.php';

// นำเข้า library JWT
use Firebase\JWT\JWT;

// รับข้อมูลที่ส่งมาเป็น JSON
$data = json_decode(file_get_contents('php://input'), true);

// ตรวจสอบว่าได้รับข้อมูลครบหรือไม่
if (empty($data['email']) || empty($data['password'])) {
    echo json_encode(['status' => 'error', 'message' => 'กรุณากรอกอีเมลและรหัสผ่าน']);
    exit();
}

$email = $data['email'];
$password = $data['password'];

// ค้นหาผู้ใช้จากอีเมลในฐานข้อมูล
$sql = "SELECT id, email, password_hash, role, full_name FROM users WHERE email = ? LIMIT 1";
$stmt = $conn->prepare($sql);
$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 1) {
    // พบผู้ใช้
    $user = $result->fetch_assoc();

    // **ตรวจสอบรหัสผ่านที่เข้ารหัสไว้**
    if (password_verify($password, $user['password_hash'])) {
        // รหัสผ่านถูกต้อง, สร้าง JWT Token
        $secret_key = "123456789"; // << ตั้งค่า key ลับของคุณ
        $issuer_claim = "http://localhost/tour-api"; // Domain ของ API
        $audience_claim = "http://localhost"; // Domain ของ Frontend
        $issuedat_claim = time(); // เวลาที่สร้าง token
        $notbefore_claim = $issuedat_claim; // Token เริ่มใช้งานได้ทันที
        $expire_claim = $issuedat_claim + (60 * 60 * 24); // Token หมดอายุใน 1 วัน

        $token = array(
            "iss" => $issuer_claim,
            "aud" => $audience_claim,
            "iat" => $issuedat_claim,
            "nbf" => $notbefore_claim,
            "exp" => $expire_claim,
            "data" => array( // ข้อมูลที่เราต้องการเก็บใน token
                "id" => $user['id'],
                "full_name" => $user['full_name'],
                "email" => $user['email'],
                "role" => $user['role']
            )
        );

        $jwt = JWT::encode($token, $secret_key, 'HS256');

        echo json_encode(array(
            "status" => "success",
            "message" => "เข้าสู่ระบบสำเร็จ",
            "token" => $jwt // ส่ง token กลับไปให้ผู้ใช้
        ));

    } else {
        // รหัสผ่านไม่ถูกต้อง
        echo json_encode(['status' => 'error', 'message' => 'อีเมลหรือรหัสผ่านไม่ถูกต้อง']);
    }
} else {
    // ไม่พบผู้ใช้
    echo json_encode(['status' => 'error', 'message' => 'อีเมลหรือรหัสผ่านไม่ถูกต้อง']);
}

$stmt->close();
$conn->close();
?>