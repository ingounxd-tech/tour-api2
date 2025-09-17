import { BrowserRouter, Routes, Route, Link, useNavigate } from "react-router-dom";
import { jwtDecode } from 'jwt-decode';

// Import Component และหน้าทั้งหมด
import ProtectedRoute from './components/ProtectedRoute';
import HomePage from './pages/HomePage';
import ToursPage from './pages/ToursPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import TourDetailPage from './pages/TourDetailPage';
import ProfilePage from './pages/ProfilePage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import CheckoutPage from './pages/CheckoutPage';

function App() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  let userRole = null;
  if (token) {
    try {
      const decodedToken = jwtDecode(token);
      userRole = decodedToken.data.role;
    } catch (error) {
      console.error("Invalid token specified");
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
    window.location.reload();
  };

  return (
    <>
      {token && (
        <nav className="bg-sky-600 text-white shadow-md p-5 flex items-center justify-between sticky top-0 z-50">
          <div className="flex items-center gap-6 w-1/3">
            <Link to="/" className="hover:text-sky-200 transition-colors">หน้าแรก</Link>
            <Link to="/tours" className="hover:text-sky-200 transition-colors">ทัวร์ทั้งหมด</Link>
          </div>
          <div className="text-3xl font-bold w-1/3 text-center">
            TourBooking.com <span role="img" aria-label="pin">📍</span>
          </div>
          <div className="flex items-center gap-4 w-1/3 justify-end">
            {userRole === 'admin' && (
              <Link to="/admin/dashboard" className="font-bold text-yellow-300 hover:text-yellow-200 transition-colors">
                Admin Dashboard
              </Link>
            )}
            <Link to="/profile" className="hover:text-sky-200 transition-colors">โปรไฟล์</Link>
            <button 
              onClick={handleLogout} 
              className="bg-sky-700 hover:bg-red-500 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
            >
              ออกจากระบบ
            </button>
          </div>
        </nav>
      )}

      <main className={!token ? "" : "py-8"}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          
          <Route path="/checkout/:bookingId" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
          
          <Route path="/" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
          <Route path="/tours" element={<ProtectedRoute><ToursPage /></ProtectedRoute>} />
          <Route path="/tours/province/:provinceId" element={<ProtectedRoute><ToursPage /></ProtectedRoute>} />
          <Route path="/tour/:tourId" element={<ProtectedRoute><TourDetailPage /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="/admin/dashboard" element={<ProtectedRoute><AdminDashboardPage /></ProtectedRoute>} />
        </Routes>
      </main>
    </>
  );
}

function AppWrapper() {
  return (
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
}

export default AppWrapper;

