import { useState, useEffect } from 'react';
import { Plus, Search, Filter, RefreshCw } from 'lucide-react';
import { supabase } from '../lib/supabase';
import  type { Profile } from '../types/database';
import UserCard from '../components/users/UserCard'; // Import Card มาใช้
import Swal from 'sweetalert2';
import UserModal from '../components/users/UserModal';

export default function Users() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'staff'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<Profile | null>(null);
  
  const fetchUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error:', error);
      Swal.fire('Error', 'โหลดข้อมูลไม่สำเร็จ', 'error');
    } else {
      setUsers(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleAddUser = () => {
    setEditingUser(null); // เคลียร์ค่า = เพิ่มใหม่
    setIsModalOpen(true); // เปิด Modal
  };

  const handleEditUser = (user: Profile) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  const handleDeleteUser = async (id: string) => {
    // ... (Logic ลบเหมือนเดิม) ...
  };

  return (
    <div className="h-full flex flex-col gap-4 animate-fade-in-up">
      {/* 1. Header Section */}
      <div className="flex justify-between items-center shrink-0">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
            บุคลากร <span className="text-sm font-normal text-slate-400">| Staff Directory</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">จัดการรายชื่อและสิทธิ์การเข้าใช้งาน ({filteredUsers.length} คน)</p>
        </div>
        <button 
          onClick={handleAddUser}
          className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm shadow-primary/30 transition-all hover:scale-105"
        >
          <Plus className="w-4 h-4" />
          เพิ่มผู้ใช้งาน
        </button>
      </div>

      {/* 2. Tools Bar */}
      <div className="flex flex-col sm:flex-row gap-3 shrink-0 bg-white p-2 rounded-2xl shadow-sm border border-slate-100">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="ค้นหาชื่อ, อีเมล..." 
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-none rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 text-slate-600 placeholder-slate-400"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex gap-2">
            <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-xl border border-transparent hover:border-slate-200 transition-colors">
            <Filter className="w-4 h-4 text-slate-500" />
            <select 
                className="bg-transparent text-sm text-slate-600 focus:outline-none cursor-pointer min-w-[100px]"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value as any)}
            >
                <option value="all">ทุกตำแหน่ง</option>
                <option value="admin">ผู้ดูแล (Admin)</option>
                <option value="staff">พนักงาน (Staff)</option>
            </select>
            </div>
            
            <button onClick={fetchUsers} className="p-2.5 bg-slate-50 rounded-xl text-slate-500 hover:text-primary hover:bg-primary/5 transition-colors">
                <RefreshCw className="w-4 h-4" />
            </button>
        </div>
      </div>

      {/* 3. Grid Content (Scrollable) */}
      <div className="flex-1 min-h-0 overflow-y-auto -mr-2 pr-2 custom-scrollbar">
        {loading ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-3">
                <RefreshCw className="w-8 h-8 animate-spin text-primary/30" />
                <p>กำลังโหลดข้อมูล...</p>
            </div>
        ) : filteredUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 bg-white/50 rounded-2xl border-2 border-dashed border-slate-200 m-2">
                <Search className="w-12 h-12 mb-2 text-slate-200" />
                <p>ไม่พบข้อมูลผู้ใช้งาน</p>
            </div>
        ) : (
            // Grid Layout: Mobile=1, Tablet=2, Desktop=3, Large=4
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 pb-10">
                {filteredUsers.map((user) => (
                    <UserCard 
                        key={user.id} 
                        user={user} 
                        onEdit={handleEditUser} 
                        onDelete={handleDeleteUser} 
                    />
                ))}
            </div>
        )}
      </div>
      <UserModal 
      isOpen={isModalOpen}
      onClose={() => setIsModalOpen(false)}
      onSuccess={fetchUsers}
      userToEdit={editingUser}
    />
    </div>
  );
}