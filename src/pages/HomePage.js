import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

function HomePage() {
  const [provinces, setProvinces] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProvinces = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get('http://localhost/tour-api/get_provinces.php');
        setProvinces(response.data);
      } catch (error) {
        console.error("เกิดข้อผิดพลาดในการดึงข้อมูลจังหวัด:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProvinces();
  }, []);

  return (
    <div className="container mx-auto px-4 py-12">
      {/* --- ส่วน Header ที่นำสีฟ้าออก --- */}
      <h1 className="text-4xl font-bold text-center text-sky-800 mb-4">
        ค้นหาทริปในฝันของคุณ
      </h1>
      <p className="text-center text-gray-600 mb-12">
        เลือกจังหวัดที่คุณสนใจเพื่อดูแพ็กเกจทัวร์ทั้งหมด
      </p>

      {/* --- ส่วนแสดงผลการ์ด --- */}
      {isLoading ? (
        <p className="text-center">กำลังโหลดข้อมูลจังหวัด...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center">
          {provinces.map(province => (
            <Link 
              key={province.id} 
              to={`/tours/province/${province.id}`} 
              className="group bg-white rounded-xl shadow-md overflow-hidden transform hover:shadow-xl hover:-translate-y-2 transition-all duration-300 w-full max-w-sm"
            >
              <div className="relative">
                <img 
                  src={province.image_url} 
                  alt={province.name} 
                  className="w-full h-56 object-cover" 
                />
                <div className="absolute inset-0 bg-black bg-opacity-20 group-hover:bg-opacity-30 transition-all duration-300"></div>
              </div>
              <div className="p-6">
                <h2 className="font-bold text-2xl text-gray-800 mb-2">{province.name}</h2>
                <p className="text-gray-600 text-base">{province.description}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default HomePage;

