import { Outlet, Navigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useAuth } from '../../contexts/AuthContext';

export default function DashboardLayout() {
  const { session } = useAuth();

  if (!session) return <Navigate to="/login" replace />;

  return (
    // 1. ลบ class 'flex' ออกจากตรงนี้ เพราะเราจะจัดการ layout แบบ Fixed Position
    <div className="h-screen w-screen bg-[#F1F5F9] overflow-hidden font-sans relative">
      
      {/* Sidebar เป็น Fixed อยู่แล้ว ไม่ต้องแก้ */}
      <Sidebar />

      {/* 2. เพิ่ม 'ml-64' ตรงนี้ เพื่อดันเนื้อหาหนี Sidebar (64 x 4 = 256px) */}
      <main className="ml-64 flex flex-col h-full overflow-hidden relative transition-all duration-300">
        
        {/* Container เนื้อหาภายใน */}
        <div className="flex-1 p-3 h-full w-full overflow-hidden">
             <Outlet />
        </div>
      </main>
    </div>
  );
}