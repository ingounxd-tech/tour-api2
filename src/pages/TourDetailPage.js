import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const generateDateOptions = () => {
  const options = [];
  const today = new Date();
  for (let i = 1; i <= 7; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    const dateString = date.toISOString().split('T')[0];
    options.push(dateString);
  }
  return options;
};

function TourDetailPage() {
  const { tourId } = useParams();
  const navigate = useNavigate();
  const [tour, setTour] = useState(null);
  const [personCount, setPersonCount] = useState(4);
  const [totalPrice, setTotalPrice] = useState(0);
  const [selectedDate, setSelectedDate] = useState('');
  const [dateOptions, setDateOptions] = useState([]);
  const [bookedDates, setBookedDates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [tourDetailRes, bookedDatesRes] = await Promise.all([
          axios.get(`http://localhost/tour-api/get_tour_detail.php?id=${tourId}`),
          axios.get(`http://localhost/tour-api/get_booked_dates.php?tour_id=${tourId}`)
        ]);
        setTour(tourDetailRes.data);
        const booked = bookedDatesRes.data.map(item => item.travel_date);
        setBookedDates(booked);
        const generatedDates = generateDateOptions();
        const availableDates = generatedDates.filter(date => !booked.includes(date));
        setDateOptions(generatedDates);
        if (availableDates.length > 0) {
          setSelectedDate(availableDates[0]);
        }
      } catch (error) {
        console.error("เกิดข้อผิดพลาดในการดึงข้อมูล:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [tourId]);

  useEffect(() => {
    if (tour) {
      const pricePerPerson = parseFloat(tour.price);
      setTotalPrice(pricePerPerson * personCount);
    }
  }, [tour, personCount]);

  const handleIncrease = () => personCount < 10 && setPersonCount(p => p + 1);
  const handleDecrease = () => personCount > 4 && setPersonCount(p => p - 1);

  const handleBooking = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('กรุณาเข้าสู่ระบบก่อนทำการจอง');
      navigate('/login');
      return;
    }
    try {
      const response = await axios.post('http://localhost/tour-api/create_booking.php', 
        {
          tour_id: tourId,
          travel_date: selectedDate,
          num_of_people: personCount
        }, 
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      if (response.data.status === 'success' && response.data.booking_id) {
        const newBookingId = response.data.booking_id;
        // ส่งแค่ booking_id ไปที่หน้า checkout
        navigate('/checkout', { state: { booking_id: newBookingId } });
      } else {
        alert(`เกิดข้อผิดพลาด: ${response.data.message || 'ไม่ได้รับ booking_id'}`);
      }
    } catch (error) {
      console.error("เกิดข้อผิดพลาดในการสร้างการจอง:", error);
      alert('เกิดข้อผิดพลาดรุนแรงในการเชื่อมต่อเพื่อสร้างการจอง');
    }
  };

  if (isLoading) return <p className="text-center p-10">กำลังโหลดข้อมูลทัวร์...</p>;
  if (!tour) return <p className="text-center p-10">ไม่พบข้อมูลทัวร์</p>;
  
  const images = [tour.cover_image_url, tour.image_url_2, tour.image_url_3].filter(Boolean);

  return (
    <div className="container mx-auto px-4 py-8">
       <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div>
            {images.length > 0 && <img src={images[0]} alt={tour.name} className="w-full h-96 object-cover rounded-lg shadow-lg mb-4" />}
            <div className="grid grid-cols-2 gap-4">
                {images[1] && <img src={images[1]} alt={`${tour.name} 2`} className="w-full h-48 object-cover rounded-lg shadow-md" />}
                {images[2] && <img src={images[2]} alt={`${tour.name} 3`} className="w-full h-48 object-cover rounded-lg shadow-md" />}
            </div>
        </div>
        
        <div className="flex flex-col">
          <h1 className="text-4xl font-bold text-sky-800 mb-2">{tour.name}</h1>
          <p className="text-lg text-gray-600 mb-4"><strong>จังหวัด:</strong> {tour.province_name}</p>
          <p className="text-2xl font-bold text-red-600 mb-4">{parseFloat(tour.price).toLocaleString()} บาท/ท่าน</p>
          <p className="text-gray-700 mb-2"><strong>ระยะเวลา:</strong> {tour.duration_days} วัน</p>
          <p className="text-gray-700 mb-6"><strong>จำนวนคน:</strong> 4-10 ท่าน</p>
          
          <div className="bg-gray-50 p-6 rounded-lg shadow-inner mt-auto">
            <div className="mb-4">
              <h3 className="font-semibold text-lg mb-2">เลือกวันเดินทาง</h3>
              <select 
                value={selectedDate} 
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                {dateOptions.length > 0 ? dateOptions.map(date => {
                  const isBooked = bookedDates.includes(date);
                  const statusText = isBooked ? '(ไม่ว่าง)' : '(ว่าง)';
                  return (
                    <option 
                        key={date} 
                        value={date} 
                        disabled={isBooked}
                        style={{ color: isBooked ? 'red' : 'green' }}
                    >
                      {new Date(date).toLocaleDateString('th-TH', { weekday: 'long', day: 'numeric', month: 'long' })} {statusText}
                    </option>
                  );
                }) : <option disabled>ไม่มีวันเดินทางที่ว่าง</option>}
              </select>
            </div>

            <div className="mb-4">
              <h3 className="font-semibold text-lg mb-2">เลือกจำนวนผู้เดินทาง</h3>
              <div className="flex items-center">
                <button onClick={handleDecrease} disabled={personCount <= 4} className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors">-</button>
                <span className="mx-4 text-xl font-bold w-12 text-center">{personCount}</span>
                <button onClick={handleIncrease} disabled={personCount >= 10} className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors">+</button>
              </div>
            </div>
             <h2 className="text-2xl font-bold text-right text-sky-800">
              ราคารวม: {totalPrice.toLocaleString()} บาท
            </h2>
          </div>

          <button onClick={handleBooking} disabled={!selectedDate || bookedDates.includes(selectedDate)} className="mt-6 w-full bg-sky-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-sky-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed">
            {selectedDate && !bookedDates.includes(selectedDate) ? 'ดำเนินการจอง' : 'กรุณาเลือกวันที่ว่าง'}
          </button>
        </div>
      </div>
      
      <div className="mt-12">
        <h3 className="text-2xl font-bold border-b-2 border-sky-500 pb-2 mb-4">รายละเอียด</h3>
        <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{tour.description}</p>
        <h3 className="text-2xl font-bold border-b-2 border-sky-500 pb-2 mt-8 mb-4">แผนการเดินทาง</h3>
        <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{tour.itinerary}</p>
      </div>
    </div>
  );
}

export default TourDetailPage;

