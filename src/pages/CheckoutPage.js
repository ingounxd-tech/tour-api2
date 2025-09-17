import { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

// ใส่ลิงก์รูป QR Code ของคุณที่นี่
const QR_CODE_IMAGE_URL = 'https://promptpay.io/0812345678/1500.png'; // ตัวอย่าง

function CheckoutPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const booking_id = location.state?.booking_id; 

  const [bookingDetails, setBookingDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  
  useEffect(() => {
    if (!booking_id) {
      setError('ไม่พบข้อมูลการจอง กรุณาเริ่มใหม่');
      setIsLoading(false);
      return;
    }
    
    const token = localStorage.getItem('token');
    const fetchBookingDetails = async () => {
      try {
        const response = await axios.get(`http://localhost/tour-api/get_booking_detail.php?booking_id=${booking_id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        setBookingDetails(response.data);
      } catch (err) {
        console.error("Error fetching booking details:", err);
        setError("ไม่สามารถโหลดข้อมูลการจองได้ หรือคุณไม่ใช่เจ้าของการจองนี้");
      } finally {
        setIsLoading(false);
      }
    };
    fetchBookingDetails();
  }, [booking_id, navigate]);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setError('');
  };

  const handleSlipSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('กรุณาเลือกไฟล์สลิปก่อนยืนยัน');
      return;
    }
    setIsUploading(true);
    setError('');
    setMessage('');
    const formData = new FormData();
    formData.append('booking_id', booking_id);
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
        setMessage('อัปโหลดสลิปสำเร็จ! ระบบกำลังนำท่านไปที่หน้าประวัติการจอง');
        setTimeout(() => {
          navigate('/profile');
        }, 3000);
      } else {
        setError(response.data.message);
      }
    } catch (err) {
      setError('เกิดข้อผิดพลาดในการอัปโหลดสลิป');
    } finally {
      setIsUploading(false);
    }
  };
  
  if (isLoading) return <div className="text-center p-10">กำลังโหลดข้อมูลการจอง...</div>;
  if (error && !bookingDetails) return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-center p-4">
          <h1 className="text-2xl font-bold text-red-600 mb-4">{error}</h1>
          <Link to="/" className="bg-sky-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-sky-700">
            กลับไปหน้าแรก
          </Link>
      </div>
    );
  
  return (
    <div className="bg-gray-100 min-h-screen py-12 px-4">
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="bg-white p-8 rounded-xl shadow-lg">
          <h1 className="text-3xl font-bold text-sky-800 border-b pb-4 mb-6">สรุปรายการจอง</h1>
          {bookingDetails && (
            <>
              <img src={bookingDetails.cover_image_url} alt={bookingDetails.tour_name} className="w-full h-48 object-cover rounded-lg mb-4"/>
              <h2 className="text-2xl font-semibold text-gray-800">{bookingDetails.tour_name}</h2>
              <div className="space-y-3 mt-6 text-gray-700">
                <p><strong>รหัสการจอง:</strong> {bookingDetails.booking_id}</p>
                <p><strong>วันเดินทาง:</strong> {new Date(bookingDetails.travel_date).toLocaleDateString('th-TH', { dateStyle: 'long' })}</p>
                <p><strong>จำนวนผู้เดินทาง:</strong> {bookingDetails.num_of_people} คน</p>
              </div>
              <div className="mt-6 pt-6 border-t">
                <p className="text-lg text-gray-600">ยอดชำระทั้งหมด</p>
                <p className="text-4xl font-bold text-red-600">{parseFloat(bookingDetails.total_price).toLocaleString()} บาท</p>
              </div>
            </>
          )}
        </div>
        <div className="bg-white p-8 rounded-xl shadow-lg">
          <h1 className="text-3xl font-bold text-sky-800 border-b pb-4 mb-6">ขั้นตอนการชำระเงิน</h1>
          <div>
            <h2 className="text-xl font-semibold mb-2">1. สแกน QR Code เพื่อชำระเงิน</h2>
            <img src={QR_CODE_IMAGE_URL} alt="QR Code" className="mx-auto my-4 border rounded-lg max-w-[250px]"/>
          </div>
          <div className="mt-8">
             <h2 className="text-xl font-semibold mb-2">2. แนบสลิปการโอนเงิน</h2>
            <form onSubmit={handleSlipSubmit}>
              <input 
                type="file"
                onChange={handleFileChange}
                accept="image/png, image/jpeg, image/jpg"
                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-sky-50 file:text-sky-700 hover:file:bg-sky-100"
              />
              <button 
                type="submit" 
                disabled={isUploading || !!message}
                className="mt-4 w-full bg-green-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400"
              >
                {isUploading ? 'กำลังอัปโหลด...' : 'ยืนยันการชำระเงิน'}
              </button>
            </form>
            {error && <p className="text-red-500 text-center mt-2">{error}</p>}
            {message && <p className="text-green-600 font-bold text-center mt-2">{message}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CheckoutPage;

