<?php
include 'db_connect.php';
include 'validate_token.php';

// 1. ตรวจสอบสิทธิ์ผู้ใช้
$decoded_token = validate_token();
$user_id = $decoded_token->data->id;

// 2. รับ booking_id ที่ส่งมาพร้อมกับไฟล์
//    (การส่งไฟล์จะใช้ $_POST ไม่ใช่ JSON)
if (!isset($_POST['booking_id'])) {
    http_response_code(400);
    echo json_encode(['message' => 'กรุณาระบุ booking_id']);
    exit();
}
$booking_id = $_POST['booking_id'];

// 3. ตรวจสอบไฟล์ที่อัปโหลด
if (isset($_FILES['slip_image']) && $_FILES['slip_image']['error'] == 0) {
    $allowed = array("jpg" => "image/jpg", "jpeg" => "image/jpeg", "png" => "image/png");
    $filename = $_FILES["slip_image"]["name"];
    $filetype = $_FILES["slip_image"]["type"];
    $filesize = $_FILES["slip_image"]["size"];

    // ตรวจสอบนามสกุลไฟล์
    $ext = pathinfo($filename, PATHINFO_EXTENSION);
    if (!array_key_exists($ext, $allowed)) {
        die(json_encode(['message' => 'ผิดพลาด: กรุณาอัปโหลดไฟล์ที่มีนามสกุล .jpg, .jpeg, .png เท่านั้น']));
    }

    // ตรวจสอบขนาดไฟล์ (ไม่เกิน 5MB)
    $maxsize = 5 * 1024 * 1024;
    if ($filesize > $maxsize) {
        die(json_encode(['message' => 'ผิดพลาด: ขนาดไฟล์ต้องไม่เกิน 5MB']));
    }

    // 4. สร้างชื่อไฟล์ใหม่เพื่อป้องกันชื่อซ้ำ
    $new_filename = uniqid() . "." . $ext;
    $target_filepath = "uploads/" . $new_filename;

    // 5. ย้ายไฟล์ไปยังโฟลเดอร์ uploads
    if (move_uploaded_file($_FILES["slip_image"]["tmp_name"], $target_filepath)) {
        
        // 6. บันทึกข้อมูลลงฐานข้อมูล
        // -- เพิ่มข้อมูลในตาราง payments --
        $stmt_payment = $conn->prepare("INSERT INTO payments (booking_id, payment_method, slip_image_url) VALUES (?, 'slip_upload', ?)");
        $stmt_payment->bind_param("is", $booking_id, $target_filepath);
        $stmt_payment->execute();
        
        // -- อัปเดตสถานะในตาราง bookings --
        $stmt_booking = $conn->prepare("UPDATE bookings SET status = 'pending_verification' WHERE id = ? AND user_id = ?");
        $stmt_booking->bind_param("ii", $booking_id, $user_id);
        $stmt_booking->execute();

        echo json_encode(['status' => 'success', 'message' => 'อัปโหลดสลิปสำเร็จ รอการตรวจสอบ']);

    } else {
        echo json_encode(['message' => 'เกิดข้อผิดพลาดขณะอัปโหลดไฟล์']);
    }
} else {
    echo json_encode(['message' => 'ไม่พบไฟล์ที่อัปโหลด หรือเกิดข้อผิดพลาด']);
}

$conn->close();
?>