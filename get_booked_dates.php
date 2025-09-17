<?php
include 'db_connect.php';

// ตรวจสอบว่ามีการส่ง tour_id มาหรือไม่
if (!isset($_GET['tour_id']) || empty($_GET['tour_id'])) {
    http_response_code(400);
    echo json_encode([]);
    exit();
}

$tour_id = $_GET['tour_id'];
$booked_dates = array();

// ดึงข้อมูลวันที่เดินทางที่มีการจองแล้ว (สถานะ confirmed หรือ รอตรวจสอบ)
// เราไม่นับสถานะ pending เพราะยังไม่มีการจ่ายเงิน
$sql = "SELECT DISTINCT travel_date FROM bookings 
        WHERE tour_id = ? AND (status = 'confirmed' OR status = 'pending_verification')";

$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $tour_id);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        // เพิ่มเฉพาะวันที่ (YYYY-MM-DD) เข้าไปใน array
        $booked_dates[] = $row['travel_date'];
    }
}

echo json_encode($booked_dates);

$stmt->close();
$conn->close();
?>
