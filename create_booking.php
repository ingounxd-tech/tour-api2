<?php
// เรียกใช้ไฟล์เชื่อมต่อ DB และไฟล์ตรวจสอบ Token
include 'db_connect.php';
include 'validate_token.php';

// 1. ตรวจสอบ Token และดึง user_id
$decoded_token = validate_token();
$user_id = $decoded_token->data->id;

// 2. รับข้อมูลการจองจาก request body
$data = json_decode(file_get_contents("php://input"), true);

$tour_id = $data['tour_id'];
$travel_date_str = $data['travel_date'];
$num_of_people = $data['num_of_people'];

// --- เพิ่มโค้ดตรวจสอบจำนวนคน ---
if ($num_of_people < 4 || $num_of_people > 10) {
    http_response_code(400); // Bad Request
    echo json_encode(['message' => 'จำนวนผู้เดินทางต้องอยู่ระหว่าง 4-10 ท่านเท่านั้น']);
    exit();
}
// --- สิ้นสุดส่วนตรวจสอบ ---


// --- (โค้ดส่วนตรวจสอบวันที่เหมือนเดิม) ---
try {
    $travel_date = new DateTime($travel_date_str);
    $tomorrow = (new DateTime('today'))->modify('+1 day');
    $limit_date = (new DateTime('today'))->modify('+7 days');

    if ($travel_date < $tomorrow || $travel_date > $limit_date) {
        http_response_code(400);
        echo json_encode(['message' => 'วันที่เดินทางที่เลือกไม่ถูกต้อง (ต้องจองล่วงหน้า 1-7 วัน)']);
        exit();
    }
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(['message' => 'รูปแบบวันที่ไม่ถูกต้อง']);
    exit();
}
// --- สิ้นสุดส่วนตรวจสอบวันที่ ---

// 3. ดึงราคาของทัวร์จากฐานข้อมูล (เพื่อความปลอดภัย)
$stmt = $conn->prepare("SELECT price FROM tours WHERE id = ?");
$stmt->bind_param("i", $tour_id);
$stmt->execute();
$result = $stmt->get_result();
if ($result->num_rows === 0) {
    http_response_code(404);
    echo json_encode(['message' => 'ไม่พบข้อมูลทัวร์']);
    exit();
}
$tour = $result->fetch_assoc();
$price_per_person = (float) $tour['price'];

// 4. คำนวณราคารวมที่ฝั่ง Backend
$total_price = $price_per_person * $num_of_people;

// 5. บันทึกข้อมูลลงในตาราง bookings
$sql = "INSERT INTO bookings (user_id, tour_id, travel_date, num_of_people, total_price, status) VALUES (?, ?, ?, ?, ?, 'pending')";
$stmt = $conn->prepare($sql);
$stmt->bind_param("iisid", $user_id, $tour_id, $travel_date_str, $num_of_people, $total_price);

if ($stmt->execute()) {
    $booking_id = $conn->insert_id;
    http_response_code(201);
    echo json_encode([
        'status' => 'success', 
        'message' => 'สร้างรายการจองสำเร็จ', 
        'booking_id' => $booking_id
    ]);
} else {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'ไม่สามารถสร้างรายการจองได้']);
}

$stmt->close();
$conn->close();
?>

