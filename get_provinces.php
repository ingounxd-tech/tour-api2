<?php
// เรียกใช้ไฟล์เชื่อมต่อฐานข้อมูล
include 'db_connect.php';

// เตรียมคำสั่ง SQL เพื่อดึงข้อมูลจังหวัดทั้งหมด
$sql = "SELECT id, name, description, image_url FROM provinces ORDER BY name ASC";
$result = $conn->query($sql);

$provinces = array();

if ($result->num_rows > 0) {
    // วนลูปเพื่อดึงข้อมูลแต่ละแถว
    while($row = $result->fetch_assoc()) {
        $provinces[] = $row;
    }
}

// ส่งข้อมูลกลับไปในรูปแบบ JSON
echo json_encode($provinces);

$conn->close();
?>