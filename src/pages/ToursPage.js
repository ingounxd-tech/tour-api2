import { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';

const StarRating = ({ rating }) => {
  const totalStars = 5;
  const fullStars = Math.round(rating);
  
  if (!rating) {
    return <div style={{ color: '#aaa' }}>ยังไม่มีรีวิว</div>;
  }

  return (
    <div>
      {[...Array(totalStars)].map((_, index) => (
        <span key={index} style={{ color: index < fullStars ? 'gold' : '#ccc' }}>
          ★
        </span>
      ))}
    </div>
  );
};

function ToursPage() {
  const [tours, setTours] = useState([]);
  const { provinceId } = useParams();

  useEffect(() => {
    let apiUrl = 'http://localhost/tour-api/get_tours.php';
    if (provinceId) {
      apiUrl += `?province_id=${provinceId}`;
    }

    const fetchTours = async () => {
      try {
        const response = await axios.get(apiUrl);
        setTours(response.data);
      } catch (error) {
        console.error("เกิดข้อผิดพลาดในการดึงข้อมูลทัวร์:", error);
      }
    };

    fetchTours();
  }, [provinceId]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">{provinceId ? `ทัวร์ในจังหวัดที่เลือก` : 'แพ็กเกจทัวร์ทั้งหมด'}</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {tours.length > 0 ? (
          tours.map(tour => (
            <Link key={tour.id} to={`/tour/${tour.id}`} className="group bg-white rounded-lg shadow-md overflow-hidden transform hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <img src={tour.cover_image_url} alt={tour.name} className="w-full h-48 object-cover" />
              <div className="p-4">
                <h3 className="font-bold text-lg mb-2 truncate">{tour.name}</h3>
                <div className="flex items-center mb-2">
                  <StarRating rating={tour.avg_rating} />
                  <span className="ml-2 text-gray-500 text-sm">({tour.review_count} รีวิว)</span>
                </div>
                <p className="text-gray-600 text-sm h-16 overflow-hidden">{tour.description ? tour.description.substring(0, 100) : ''}...</p>
                <div className="mt-4 flex justify-between items-center">
                    <p className="text-lg font-semibold text-sky-600">{tour.price ? parseFloat(tour.price).toLocaleString() : ''} บาท /ท่าน</p>
                    <p className="text-sm text-gray-500">{tour.duration_days} วัน</p>
                </div>
              </div>
            </Link>
          ))
        ) : (
          <p className="text-center col-span-full">กำลังโหลดข้อมูลทัวร์...</p>
        )}
      </div>
    </div>
  );
}

export default ToursPage;
