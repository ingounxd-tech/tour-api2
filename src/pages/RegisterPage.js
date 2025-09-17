import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

function RegisterPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [error, setError] = useState('');
  
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    try {
      const response = await axios.post('http://localhost/tour-api/register.php', {
        full_name: fullName,
        email: email,
        password: password,
        phone_number: phoneNumber
      });

      if (response.data.status === 'success') {
        alert('สมัครสมาชิกสำเร็จ! กรุณาเข้าสู่ระบบ');
        navigate('/login');
      } else {
        setError(response.data.message);
      }
    } catch (err) {
      setError('เกิดข้อผิดพลาดในการเชื่อมต่อ');
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center bg-cover bg-center"
      style={{ backgroundImage: 'url(https://f.ptcdn.info/768/044/000/ob199a9417NbQ6z44lv-o.jpg)' }}
    >
      <div className="absolute inset-0 bg-black bg-opacity-40 backdrop-blur-sm"></div>
      
      <div className="relative bg-white/95 p-8 rounded-xl shadow-lg w-full max-w-md">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">สร้างบัญชีใหม่</h1>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="fullName">
              ชื่อ-นามสกุล
            </label>
            <input 
              id="fullName"
              type="text" 
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required 
              className="shadow appearance-none border rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>
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
           <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="phone">
              เบอร์โทรศัพท์
            </label>
            <input 
              id="phone"
              type="tel" 
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
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
              สมัครสมาชิก
            </button>
          </div>
          
          <p className="text-center text-gray-600 text-sm mt-6">
            มีบัญชีอยู่แล้ว?{' '}
            <Link to="/login" className="font-bold text-sky-500 hover:text-sky-700">
              กลับไปหน้าล็อกอิน
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default RegisterPage;
