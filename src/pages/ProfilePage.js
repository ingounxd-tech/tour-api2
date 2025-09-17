import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import ReviewForm from '../components/ReviewForm';

function ProfilePage() {
  const [bookings, setBookings] = useState([]);
  const [showReviewFormFor, setShowReviewFormFor] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const fetchMyBookings = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    try {
      const response = await axios.get('http://localhost/tour-api/get_my_bookings.php', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setBookings(response.data);
    } catch (error) {
      console.error("เกิดข้อผิดพลาดในการดึงข้อมูลการจอง:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMyBookings();
  }, [navigate]);

  // --- ฟังก์ชันสำหรับยกเลิกการจอง ---
  const handleCancel = async (bookingId) => {
    if (!window.confirm(`คุณต้องการยกเลิกการจองรหัส ${bookingId} ใช่หรือไม่?`)) {
        return;
    }
    const token = localStorage.getItem('token');
    try {
        await axios.post('http://localhost/tour-api/cancel_booking.php', 
            { booking_id: bookingId },
            { headers: { 'Authorization': `Bearer ${token}` } }
        );
        alert('ยกเลิกการจองสำเร็จ');
        // โหลดข้อมูลใหม่เพื่ออัปเดตสถานะ
        fetchMyBookings();
    } catch (error) {
        alert(error.response?.data?.message || 'เกิดข้อผิดพลาดในการยกเลิก');
    }
  };

  const getStatusInfo = (status) => {
    switch(status) {
        case 'pending': return { text: 'รอชำระเงิน', color: '#db8e00' };
        case 'pending_verification': return { text: 'รอตรวจสอบสลิป', color: '#007bff' };
        case 'confirmed': return { text: 'ยืนยันการจองแล้ว', color: '#28a745' };
        case 'cancelled': return { text: 'ยกเลิกแล้ว', color: '#dc3545' };
        default: return { text: status, color: '#6c757d' };
    }
  };

  if (isLoading) {
    return <p>กำลังโหลดข้อมูลประวัติการจอง...</p>;
  }

  return (
    <div style={{ maxWidth: '800px', margin: 'auto' }}>
      <h1>ประวัติการจองของฉัน</h1>
      {bookings.length > 0 ? (
        bookings.map(booking => {
          const statusInfo = getStatusInfo(booking.status);
          const canCancel = booking.status === 'pending' || booking.status === 'pending_verification';

          return (
            <div key={booking.id} style={{ border: '1px solid #ddd', padding: '20px', marginBottom: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
              
              <div style={{display: 'flex', gap: '20px', flexWrap: 'wrap'}}>
                <img src={booking.tour_image} alt={booking.tour_name} style={{width: '200px', height: '130px', objectFit: 'cover', borderRadius: '4px'}}/>
                <div style={{flex: 1}}>
                    <h3 style={{marginTop: 0}}>{booking.tour_name}</h3>
                    <p><strong>รหัสการจอง:</strong> {booking.id}</p>
                    <p><strong>วันที่จอง:</strong> {new Date(booking.booking_date).toLocaleString('th-TH', { dateStyle: 'long', timeStyle: 'short' })} น.</p>
                    <p><strong>วันที่เดินทาง:</strong> {new Date(booking.travel_date).toLocaleDateString('th-TH', { dateStyle: 'long' })}</p>
                    <p>
                        <strong>สถานะ:</strong>
                        <span style={{ fontWeight: 'bold', color: statusInfo.color, marginLeft: '8px' }}>
                        {statusInfo.text}
                        </span>
                    </p>
                </div>
              </div>

              <div style={{marginTop: '15px', paddingTop: '15px', borderTop: '1px solid #eee'}}>
                {booking.status === 'confirmed' && (
                  booking.is_reviewed ? (
                    <p style={{ color: 'green', fontWeight: 'bold' }}>✓ คุณได้รีวิวทัวร์นี้แล้ว</p>
                  ) : (
                    <div>
                      <button onClick={() => setShowReviewFormFor(showReviewFormFor === booking.id ? null : booking.id)}>
                        {showReviewFormFor === booking.id ? 'ยกเลิก' : 'เขียนรีวิว'}
                      </button>
                      {showReviewFormFor === booking.id && (
                        <ReviewForm 
                          tourId={booking.tour_id} 
                          onReviewSubmit={() => {
                            setShowReviewFormFor(null);
                            fetchMyBookings();
                          }} 
                        />
                      )}
                    </div>
                  )
                )}
                
                {/* --- ปุ่มยกเลิกการจอง --- */}
                {canCancel && (
                    <button onClick={() => handleCancel(booking.id)} style={{backgroundColor: '#dc3545', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '4px', cursor: 'pointer'}}>
                        ยกเลิกการจอง
                    </button>
                )}
              </div>
            </div>
          )
        })
      ) : (
        <p>คุณยังไม่มีรายการจอง</p>
      )}
    </div>
  );
}

export default ProfilePage;