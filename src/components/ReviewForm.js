import { useState } from 'react';
import axios from 'axios';

function ReviewForm({ tourId, onReviewSubmit }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      await axios.post('http://localhost/tour-api/create_review.php', 
        { tour_id: tourId, rating, comment },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      alert('ขอบคุณสำหรับรีวิวครับ!');
      onReviewSubmit(); // เรียกฟังก์ชันที่ส่งมาจาก ProfilePage เพื่ออัปเดต UI
    } catch (err) {
      setError(err.response?.data?.message || 'เกิดข้อผิดพลาด');
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginTop: '15px', padding: '15px', borderTop: '1px solid #eee' }}>
      <h4>ให้คะแนนทัวร์นี้</h4>
      <div>
        {[1, 2, 3, 4, 5].map(star => (
          <span key={star} onClick={() => setRating(star)} style={{ cursor: 'pointer', color: star <= rating ? 'gold' : '#ccc', fontSize: '2.5rem' }}>★</span>
        ))}
      </div>
      <textarea 
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="เล่าประสบการณ์และความประทับใจของคุณ..."
        rows="4"
        style={{ width: '98%', marginTop: '10px', padding: '8px', fontSize: '1rem' }}
        required
      />
      <button type="submit" style={{ marginTop: '10px' }}>ส่งรีวิว</button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </form>
  );
}

export default ReviewForm;

