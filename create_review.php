<?php
include 'db_connect.php';
include 'validate_token.php';

// 1. ตรวจสอบสิทธิ์ผู้ใช้
$decoded_token = validate_token();
$user_id = $decoded_token->data->id;

// 2. รับข้อมูลจาก request body
$data = json_decode(file_get_contents("php://input"), true);

$tour_id = $data['tour_id'];
$rating = $data['rating'];
$comment = $data['comment'];

// 3. --- ส่วนตรวจสอบเงื่อนไขที่สำคัญ ---
// ตรวจสอบว่าผู้ใช้คนนี้เคยจองทัวร์นี้และสถานะ confirmed จริงหรือไม่
// เพื่อป้องกันไม่ให้ใครก็ได้มารีวิว
$stmt_check = $conn->prepare("SELECT id FROM bookings WHERE user_id = ? AND tour_id = ? AND status = 'confirmed' LIMIT 1");
$stmt_check->bind_param("ii", $user_id, $tour_id);
$stmt_check->execute();
$result_check = $stmt_check->get_result();

if ($result_check->num_rows === 0) {
    http_response_code(403); // Forbidden
    echo json_encode(['status' => 'error', 'message' => 'คุณไม่มีสิทธิ์รีวิวทัวร์นี้ (ต้องเป็นการจองที่ยืนยันแล้วเท่านั้น)']);
    exit();
}

// (Optional) ตรวจสอบว่าเคยรีวิวไปแล้วหรือยัง
$stmt_duplicate = $conn->prepare("SELECT id FROM reviews WHERE user_id = ? AND tour_id = ? LIMIT 1");
$stmt_duplicate->bind_param("ii", $user_id, $tour_id);
$stmt_duplicate->execute();
if ($stmt_duplicate->get_result()->num_rows > 0) {
    http_response_code(409); // Conflict
    echo json_encode(['status' => 'error', 'message' => 'คุณได้รีวิวทัวร์นี้ไปแล้ว']);
    exit();
}


// 4. บันทึกรีวิวลงในตาราง reviews
$stmt = $conn->prepare("INSERT INTO reviews (user_id, tour_id, rating, comment) VALUES (?, ?, ?, ?)");
$stmt->bind_param("iiis", $user_id, $tour_id, $rating, $comment);

if ($stmt->execute()) {
    http_response_code(201); // Created
    echo json_encode(['status' => 'success', 'message' => 'ขอบคุณสำหรับรีวิวของคุณ']);
} else {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'เกิดข้อผิดพลาดในการบันทึกรีวิว']);
}

$stmt_check->close();
$stmt_duplicate->close();
$stmt->close();
$conn->close();
?>