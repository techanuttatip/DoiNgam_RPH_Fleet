// src/App.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import DashboardLayout from './components/layout/DashboardLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users'; 
import Vehicles from './pages/Vehicles';
import Events from './pages/Events';

// Placeholder Pages (หน้าอื่นๆ ที่รอการพัฒนาใน Step ถัดไป)
function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          {/* Protected Routes (ต้อง Login ก่อนถึงจะเข้าได้) */}
          <Route element={<DashboardLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/users" element={<Users />} />
            <Route path="/vehicles" element={<Vehicles />} />
            
            {/* หน้าอื่นๆ ใช้ Placeholder ไปก่อน */}
            <Route path="/events" element={<Events />} />
            <Route path="/logs" element={<div className="p-6">ประวัติและรายงาน (Logs)</div>} />
            <Route path="/settings" element={<div className="p-6">ตั้งค่าระบบ (Settings)</div>} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;