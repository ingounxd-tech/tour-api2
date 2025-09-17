import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    try {
      const response = await axios.post('http://localhost/tour-api/login.php', {
        email: email,
        password: password
      });

      if (response.data.status === 'success') {
        alert('ล็อกอินสำเร็จ!');
        localStorage.setItem('token', response.data.token);
        navigate('/');
        window.location.reload();
      } else {
        setError(response.data.message);
      }
    } catch (err) {
      setError('เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์');
    }
  };

  return (
    // ส่วนพื้นหลังที่ใช้รูปภาพ
    <div 
      className="min-h-screen flex items-center justify-center bg-cover bg-center"
      style={{ backgroundImage: 'url(https://f.ptcdn.info/768/044/000/ob199a9417NbQ6z44lv-o.jpg)' }}
    >
      {/* Overlay สีดำโปร่งแสงเพื่อความสวยงามและอ่านง่าย */}
      <div className="absolute inset-0 bg-black bg-opacity-40 backdrop-blur-sm"></div>
      
      {/* การ์ดฟอร์มล็อกอิน */}
      <div className="relative bg-white/95 p-8 rounded-xl shadow-lg w-full max-w-md">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">TourBooking.com 📍</h1>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
              อีเมล
            </label>
            <input 
              id="email"
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
              className="shadow appearance-none border rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
              รหัสผ่าน
            </label>
            <input 
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)} 
              required
              className="shadow appearance-none border rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>
          
          {error && <p className="text-red-500 text-center text-sm mb-4">{error}</p>}

          <div className="flex items-center justify-center">
            <button 
              type="submit" 
              className="bg-sky-500 hover:bg-sky-600 text-white font-bold py-3 px-6 rounded-lg focus:outline-none focus:shadow-outline w-full transition-colors"
            >
              ล็อกอิน
            </button>
          </div>
          
          <p className="text-center text-gray-600 text-sm mt-6">
            ยังไม่มีบัญชี?{' '}
            <Link to="/register" className="font-bold text-sky-500 hover:text-sky-700">
              สมัครสมาชิกที่นี่
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;

