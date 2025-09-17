import { useState } from 'react';
import axios from 'axios';

function UploadSlip({ bookingId }) {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('กรุณาเลือกไฟล์สลิป');
      return;
    }

    const formData = new FormData();
    formData.append('booking_id', bookingId);
    formData.append('slip_image', file);

    const token = localStorage.getItem('token');

    try {
      const response = await axios.post('http://localhost/tour-api/upload_slip.php', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.status === 'success') {
        setMessage('อัปโหลดสำเร็จ! สถานะการจองของคุณจะถูกอัปเดตเร็วๆ นี้');
        setError('');
        // ทำให้ฟอร์มหายไปหลังจากอัปโหลดสำเร็จ
        e.target.style.display = 'none'; 
      } else {
        setError(response.data.message);
      }
    } catch (err) {
      setError('เกิดข้อผิดพลาดในการอัปโหลด');
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginTop: '10px', padding: '10px', border: '1px solid #eee' }}>
      <label>อัปโหลดสลิปการโอนเงิน:</label><br/>
      <input type="file" onChange={handleFileChange} accept="image/png, image/jpeg, image/jpg" />
      <button type="submit" style={{ marginLeft: '10px' }}>ยืนยัน</button>
      {error && <p style={{ color: 'red', margin: '5px 0 0' }}>{error}</p>}
      {message && <p style={{ color: 'green', margin: '5px 0 0' }}>{message}</p>}
    </form>
  );
}

export default UploadSlip;