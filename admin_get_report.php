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

// สร้าง array สำหรับเก็บผลลัพธ์ทั้งหมด
$report = array();

// 2. ดึงข้อมูลสรุป: ยอดจองและรายรับทั้งหมด
$summary_sql = "SELECT 
                    COUNT(id) AS total_confirmed_bookings, 
                    SUM(total_price) AS total_revenue 
                FROM bookings 
                WHERE status = 'confirmed'";

$summary_result = $conn->query($summary_sql);
$report['summary'] = $summary_result->fetch_assoc();

// 3. ดึงข้อมูล 5 อันดับทัวร์ยอดนิยม
$top_tours_sql = "SELECT 
                      t.name AS tour_name, 
                      COUNT(b.id) AS booking_count
                  FROM bookings AS b
                  JOIN tours AS t ON b.tour_id = t.id
                  WHERE b.status = 'confirmed'
                  GROUP BY b.tour_id
                  ORDER BY booking_count DESC
                  LIMIT 5";

$top_tours_result = $conn->query($top_tours_sql);
$top_tours = array();
while($row = $top_tours_result->fetch_assoc()) {
    $top_tours[] = $row;
}
$report['top_tours'] = $top_tours;

// 4. ส่งผลลัพธ์ทั้งหมดกลับไปเป็น JSON
echo json_encode($report);

$conn->close();
?>