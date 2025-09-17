<?php
include 'db_connect.php';
include 'validate_token.php';

// 1. ตรวจสอบสิทธิ์ Admin
$decoded_token = validate_token();
if ($decoded_token->data->role !== 'admin') {
    http_response_code(403);
    echo json_encode(['status' => 'error', 'message' => 'คุณไม่มีสิทธิ์เข้าถึงฟังก์ชันนี้']);
    exit();
}

// 2. ดึงข้อมูลการจองที่รอตรวจสอบ พร้อมข้อมูล user และ tour
$sql = "SELECT 
            b.id, b.travel_date, b.status, b.booking_date,
            u.full_name AS user_name,
            t.name AS tour_name,
            p.slip_image_url
        FROM bookings AS b
        JOIN users AS u ON b.user_id = u.id
        JOIN tours AS t ON b.tour_id = t.id
        LEFT JOIN payments AS p ON b.id = p.booking_id
        WHERE b.status = 'pending_verification'
        ORDER BY b.booking_date ASC";

$result = $conn->query($sql);

$bookings = array();
if ($result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        $bookings[] = $row;
    }
}

echo json_encode($bookings);

$conn->close();
?>