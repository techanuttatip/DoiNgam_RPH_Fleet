import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, Car, Calendar, FileText, Settings, LogOut } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import Swal from 'sweetalert2';

const menuItems = [
  { icon: LayoutDashboard, label: 'ภาพรวมระบบ', path: '/' },
  { icon: Users, label: 'จัดการผู้ใช้งาน', path: '/users' },
  { icon: Car, label: 'ยานพาหนะ', path: '/vehicles' },
  { icon: Calendar, label: 'ตารางการใช้รถ', path: '/events' },
  { icon: FileText, label: 'ประวัติและรายงาน', path: '/logs' },
  { icon: Settings, label: 'ตั้งค่าระบบ', path: '/settings' },
];

export default function Sidebar() {
  const { signOut } = useAuth();

  const handleLogout = () => {
    Swal.fire({
      title: 'ออกจากระบบ?',
      text: "คุณต้องการออกจากระบบใช่หรือไม่",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'ใช่, ออกจากระบบ',
      cancelButtonText: 'ยกเลิก'
    }).then((result) => {
      if (result.isConfirmed) signOut();
    });
  };

  return (
    <aside className="w-64 h-screen bg-white border-r border-gray-100 flex flex-col fixed left-0 top-0 shadow-sm z-50 font-sans">
      <div className="p-6 border-b border-gray-50 flex items-center gap-3">
        <img src="../src/assets/logo.jpg" alt="Logo" className="w-8 h-8 object-contain" />
        <div>
          <h1 className="text-lg font-bold text-primary tracking-tight">DoiNgam RPH</h1>
          <p className="text-[10px] text-gray-400 font-medium">ADMIN PORTAL</p>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 group ${
                isActive
                  ? 'bg-gradient-to-r from-primary/10 to-primary/5 text-primary shadow-sm ring-1 ring-primary/10'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
              }`
            }
          >
            <item.icon className={`w-5 h-5 mr-3 transition-colors ${item.path === location.pathname ? 'text-primary' : 'text-gray-400 group-hover:text-gray-600'}`} />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-50">
        <button onClick={handleLogout} className="flex items-center w-full px-4 py-3 text-sm font-medium text-red-600 rounded-xl hover:bg-red-50 transition-colors">
          <LogOut className="w-5 h-5 mr-3" />
          ออกจากระบบ
        </button>
      </div>
    </aside>
  );
}