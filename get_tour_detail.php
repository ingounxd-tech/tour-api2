<?php
include 'db_connect.php';

// 1. ตรวจสอบว่ามีการส่ง id ของทัวร์มาหรือไม่
if (!isset($_GET['id']) || empty($_GET['id'])) {
    http_response_code(400); // Bad Request
    echo json_encode(['status' => 'error', 'message' => 'กรุณาระบุ ID ของทัวร์']);
    exit();
}

$tour_id = $_GET['id'];

// 2. เตรียมคำสั่ง SQL โดยใช้ LEFT JOIN
//    LEFT JOIN คือการเชื่อม 2 ตารางเข้าด้วยกัน
//    เราดึงข้อมูลจากตาราง tours (ตั้งชื่อย่อว่า t)
//    และดึง 'name' จากตาราง provinces (ตั้งชื่อย่อว่า p)
//    โดยเชื่อมกันที่ t.province_id = p.id
$sql = "SELECT 
            t.*, 
            p.name AS province_name 
        FROM tours AS t
        LEFT JOIN provinces AS p ON t.province_id = p.id
        WHERE t.id = ? 
        LIMIT 1";

// 3. ใช้ Prepared Statement เพื่อความปลอดภัย
$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $tour_id);
$stmt->execute();
$result = $stmt->get_result();

// 4. ตรวจสอบว่าเจอข้อมูลหรือไม่
if ($result->num_rows > 0) {
    $tour = $result->fetch_assoc();
    echo json_encode($tour);
} else {
    http_response_code(404); // Not Found
    echo json_encode(['status' => 'error', 'message' => 'ไม่พบข้อมูลทัวร์']);
}

$stmt->close();
$conn->close();
?>