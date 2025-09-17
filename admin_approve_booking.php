<?php
include 'db_connect.php';
include 'validate_token.php';

// 1. ตรวจสอบ Token
$decoded_token = validate_token();

// 2. !!สำคัญ!! ตรวจสอบ Role ว่าเป็น Admin หรือไม่
if ($decoded_token->data->role !== 'admin') {
    http_response_code(403); // Forbidden
    echo json_encode(['status' => 'error', 'message' => 'คุณไม่มีสิทธิ์เข้าถึงฟังก์ชันนี้']);
    exit();
}

// 3. รับ booking_id ที่ต้องการอนุมัติ
$data = json_decode(file_get_contents("php://input"), true);
$booking_id = $data['booking_id'];

if (empty($booking_id)) {
    http_response_code(400); // Bad Request
    echo json_encode(['message' => 'กรุณาระบุ booking_id']);
    exit();
}

// 4. อัปเดตสถานะในตาราง bookings
$stmt = $conn->prepare("UPDATE bookings SET status = 'confirmed' WHERE id = ? AND status = 'pending_verification'");
$stmt->bind_param("i", $booking_id);

if ($stmt->execute()) {
    // ตรวจสอบว่ามีการอัปเดตแถวจริงหรือไม่
    if ($stmt->affected_rows > 0) {
        echo json_encode(['status' => 'success', 'message' => 'อนุมัติการจองสำเร็จ']);
    } else {
        http_response_code(404);
        echo json_encode(['status' => 'error', 'message' => 'ไม่พบการจองที่รอการตรวจสอบ หรือการจองนี้ถูกอนุมัติไปแล้ว']);
    }
} else {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'เกิดข้อผิดพลาดในการอัปเดตข้อมูล']);
}

$stmt->close();
$conn->close();
?>