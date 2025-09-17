<?php
include 'db_connect.php';

$data = json_decode(file_get_contents('php://input'), true);

// ... (ส่วนตรวจสอบ full_name, email, password เหมือนเดิม) ...

$full_name = $data['full_name'];
$email = $data['email'];
$password = $data['password'];
$role = 'customer';

// รับค่า phone_number (ถ้าไม่มีให้เป็นค่าว่าง)
$phone_number = isset($data['phone_number']) ? $data['phone_number'] : '';

$password_hash = password_hash($password, PASSWORD_BCRYPT);

// แก้ไข SQL และ bind_param เพื่อเพิ่ม phone_number
$sql = "INSERT INTO users (full_name, email, password_hash, role, phone_number) VALUES (?, ?, ?, ?, ?)";
$stmt = $conn->prepare($sql);
// ประเภทข้อมูลเป็น "sssss" (string 5 ตัว)
$stmt->bind_param("sssss", $full_name, $email, $password_hash, $role, $phone_number);

// ... (ส่วน execute และส่ง response กลับเหมือนเดิม) ...
if ($stmt->execute()) {
    echo json_encode(['status' => 'success', 'message' => 'สมัครสมาชิกสำเร็จ']);
} else {
    if ($conn->errno == 1062) {
         echo json_encode(['status' => 'error', 'message' => 'อีเมลนี้ถูกใช้งานแล้ว']);
    } else {
         echo json_encode(['status' => 'error', 'message' => 'เกิดข้อผิดพลาด: ' . $stmt->error]);
    }
}

$stmt->close();
$conn->close();
?>