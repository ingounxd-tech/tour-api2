<?php
include 'db_connect.php';
include 'validate_token.php';

$decoded_token = validate_token();
$user_id = $decoded_token->data->id;

// เพิ่ม LEFT JOIN กับตาราง reviews และใช้ EXISTS เพื่อเช็คว่าเคยรีวิวหรือไม่
$sql = "SELECT 
            b.id, b.tour_id, b.travel_date, b.status, b.booking_date,
            t.name AS tour_name, t.cover_image_url AS tour_image,
            EXISTS(SELECT 1 FROM reviews r WHERE r.user_id = b.user_id AND r.tour_id = b.tour_id) as is_reviewed
        FROM bookings AS b
        JOIN tours AS t ON b.tour_id = t.id
        WHERE b.user_id = ?
        ORDER BY b.booking_date DESC";

$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $user_id);
$stmt->execute();
$result = $stmt->get_result();

$bookings = array();
if ($result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        $bookings[] = $row;
    }
}

echo json_encode($bookings);
$stmt->close();
$conn->close();
?>