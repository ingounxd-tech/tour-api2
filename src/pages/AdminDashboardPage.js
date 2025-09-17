import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function AdminDashboardPage() {
  const [pendingBookings, setPendingBookings] = useState([]);
  const [report, setReport] = useState(null);
  const navigate = useNavigate();

  const fetchData = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      const [reportResponse, pendingResponse] = await Promise.all([
        axios.get('http://localhost/tour-api/admin_get_report.php', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        axios.get('http://localhost/tour-api/admin_get_pending_bookings.php', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);
      
      setReport(reportResponse.data);
      setPendingBookings(pendingResponse.data);

    } catch (error) {
      console.error("เกิดข้อผิดพลาด:", error);
      if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        navigate('/login');
      }
    }
  };

  useEffect(() => {
    fetchData();
  }, [navigate]);

  const handleApprove = async (bookingId) => {
    if (!window.confirm(`คุณต้องการอนุมัติการจอง ID: ${bookingId} ใช่หรือไม่?`)) return;
    const token = localStorage.getItem('token');
    try {
      await axios.post('http://localhost/tour-api/admin_approve_booking.php', 
        { booking_id: bookingId },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      alert('อนุมัติสำเร็จ!');
      fetchData();
    } catch (error) {
      alert('เกิดข้อผิดพลาดในการอนุมัติ');
    }
  };

  if (!report) {
    return <p className="text-center p-10">กำลังโหลดข้อมูล Dashboard...</p>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-gray-500 font-semibold">รายรับทั้งหมด</h3>
          <p className="text-3xl font-bold text-sky-600 mt-2">{parseFloat(report.summary.total_revenue || 0).toLocaleString()} บาท</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-gray-500 font-semibold">ยอดจอง (Confirmed)</h3>
          <p className="text-3xl font-bold text-sky-600 mt-2">{report.summary.total_confirmed_bookings || 0} รายการ</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-gray-500 font-semibold">ทัวร์ยอดนิยม</h3>
          {report.top_tours.length > 0 ? (
            <ol className="list-decimal list-inside mt-2">
              {report.top_tours.map(tour => (
                <li key={tour.tour_name} className="truncate">{tour.tour_name} ({tour.booking_count} ครั้ง)</li>
              ))}
            </ol>
          ) : <p className="mt-2">ยังไม่มีข้อมูล</p>}
        </div>
      </div>
      
      <h2 className="text-2xl font-bold mb-4">รายการรอตรวจสอบ</h2>
      <div className="bg-white rounded-lg shadow-md overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b-2 border-gray-200">
            <tr>
              <th className="p-4">Booking ID</th>
              <th className="p-4">ชื่อทัวร์</th>
              <th className="p-4">ชื่อผู้จอง</th>
              <th className="p-4">สลิป</th>
              <th className="p-4">จัดการ</th>
            </tr>
          </thead>
          <tbody>
            {pendingBookings.length > 0 ? pendingBookings.map(booking => (
              <tr key={booking.id} className="border-b hover:bg-gray-50">
                <td className="p-4">{booking.id}</td>
                <td className="p-4">{booking.tour_name}</td>
                <td className="p-4">{booking.user_name}</td>
                <td className="p-4">
                  <a href={`http://localhost/tour-api/${booking.slip_image_url}`} target="_blank" rel="noopener noreferrer" className="text-sky-600 hover:underline">
                    ดูสลิป
                  </a>
                </td>
                <td className="p-4">
                  <button onClick={() => handleApprove(booking.id)} className="bg-green-500 text-white font-semibold py-1 px-3 rounded hover:bg-green-600">อนุมัติ</button>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="5" className="text-center p-4 text-gray-500">ไม่มีรายการที่รอการตรวจสอบ</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminDashboardPage;
