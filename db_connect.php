<?php
// --- แทนที่ header เดิมด้วยชุดนี้ ---
header("Access-Control-Allow-Origin: http://localhost:3000"); // อนุญาตเฉพาะเว็บ React ของเรา
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// จัดการกับ OPTIONS request (Preflight)
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit(0);
}
// ------------------------------------

// ตั้งค่าการเชื่อมต่อฐานข้อมูล (โค้ดส่วนนี้เหมือนเดิม)
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "tour_booking"; // << **ใส่ชื่อฐานข้อมูลของคุณ**

// ... ส่วนที่เหลือของไฟล์เหมือนเดิม ...
$conn = new mysqli($servername, $username, $password, $dbname);
if ($conn->connect_error) {
  die("Connection failed: " . $conn->connect_error);
}
$conn->set_charset("utf8mb4");
?>