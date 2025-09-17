<?php
include 'db_connect.php';

// แก้ไข SQL query ให้มีการ JOIN กับตาราง reviews
// และคำนวณค่าเฉลี่ย (AVG) กับจำนวน (COUNT)
$sql = "SELECT 
            t.*, 
            AVG(r.rating) as avg_rating, 
            COUNT(r.id) as review_count
        FROM tours AS t
        LEFT JOIN reviews AS r ON t.id = r.tour_id";

if (isset($_GET['province_id']) && !empty($_GET['province_id'])) {
    $province_id = $_GET['province_id'];
    $sql .= " WHERE t.province_id = ?";
    $sql .= " GROUP BY t.id"; // ต้อง Group By เสมอเมื่อใช้ AVG, COUNT

    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $province_id);
    $stmt->execute();
    $result = $stmt->get_result();

} else {
    $sql .= " GROUP BY t.id"; // Group By สำหรับดึงทัวร์ทั้งหมด
    $result = $conn->query($sql);
}

$tours = array();
if ($result && $result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        $tours[] = $row;
    }
}

echo json_encode($tours);

if (isset($stmt)) {
    $stmt->close();
}
$conn->close();
?>