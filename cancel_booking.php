<?php
include 'db_connect.php';
include 'validate_token.php';

// 1. ตรวจสอบ Token และเอา user_id
$decoded_token = validate_token();
$user_id = $decoded_token->data->id;

// 2. รับ booking_id จาก request
$data = json_decode(file_get_contents("php://input"), true);
$booking_id = $data['booking_id'];

// 3. อัปเดตสถานะเป็น 'cancelled' โดยมีเงื่อนไข
// ผู้ใช้จะสามารถยกเลิกได้เฉพาะการจองของตัวเอง และต้องมีสถานะเป็น 'pending' หรือ 'pending_verification' เท่านั้น
$sql = "UPDATE bookings SET status = 'cancelled' 
        WHERE id = ? AND user_id = ? AND (status = 'pending' OR status = 'pending_verification')";

$stmt = $conn->prepare($sql);
$stmt->bind_param("ii", $booking_id, $user_id);

if ($stmt->execute()) {
    // ตรวจสอบว่ามีการอัปเดตแถวจริงหรือไม่
    if ($stmt->affected_rows > 0) {
        echo json_encode(['status' => 'success', 'message' => 'ยกเลิกการจองสำเร็จ']);
    } else {
        http_response_code(403); // Forbidden
        echo json_encode(['status' => 'error', 'message' => 'ไม่สามารถยกเลิกการจองนี้ได้ (อาจถูกยืนยันไปแล้ว)']);
    }
} else {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'เกิดข้อผิดพลาดในการอัปเดตข้อมูล']);
}

$stmt->close();
$conn->close();
?>