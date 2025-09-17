import { Navigate } from 'react-router-dom';

function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token');

  if (!token) {
    // ถ้าไม่มี token ให้ส่งกลับไปที่หน้า login
    return <Navigate to="/login" replace />;
  }

  // ถ้ามี token ให้แสดงหน้าที่ต้องการ
  return children;
}

export default ProtectedRoute;
