<?php
include 'db_connect.php';
include 'validate_token.php';

// ตรวจสอบ Token และเอา user_id
$decoded_token = validate_token();
$user_id = $decoded_token->data->id;

// รับ booking_id จาก URL parameter
if (!isset($_GET['booking_id'])) {
    http_response_code(400);
    echo json_encode(['message' => 'กรุณาระบุรหัสการจอง']);
    exit();
}
$booking_id = $_GET['booking_id'];

// ดึงข้อมูลการจองแบบเจาะจง โดย JOIN กับตาราง tours
$sql = "SELECT 
            b.id AS booking_id,
            b.travel_date,
            b.num_of_people,
            b.total_price,
            b.status,
            t.name AS tour_name,
            t.cover_image_url
        FROM bookings AS b
        JOIN tours AS t ON b.tour_id = t.id
        WHERE b.id = ? AND b.user_id = ?
        LIMIT 1";

$stmt = $conn->prepare($sql);
$stmt->bind_param("ii", $booking_id, $user_id);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    $booking_details = $result->fetch_assoc();
    echo json_encode($booking_details);
} else {
    http_response_code(404);
    echo json_encode(['message' => 'ไม่พบข้อมูลการจอง']);
}

$stmt->close();
$conn->close();
?>

