import { useState, useEffect } from 'react';
import { Plus, Search, Filter, Car, Zap, Wrench } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Vehicle } from '../types/database';
import VehicleCard from '../components/vehicles/VehicleCard';
import VehicleModal from '../components/vehicles/VehicleModal'; // Import Modal ที่เราสร้าง
import Swal from 'sweetalert2';

export default function Vehicles() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'available' | 'in_use' | 'maintenance'>('all');

  // State สำหรับ Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);

  // 1. Fetch Data
  const fetchVehicles = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('vehicles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error(error);
      Swal.fire('Error', 'โหลดข้อมูลรถไม่สำเร็จ', 'error');
    } else {
      setVehicles(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  // 2. Filter Logic
  const filteredVehicles = vehicles.filter(v => {
    const matchesSearch = 
      v.plate_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.model?.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesStatus = statusFilter === 'all' || v.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // 3. Handle Add (เปิด Modal แบบว่างเปล่า)
  const handleAddVehicle = () => {
    setEditingVehicle(null);
    setIsModalOpen(true);
  };

  // 4. Handle Edit (เปิด Modal พร้อมข้อมูลเดิม)
  const handleEdit = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
    setIsModalOpen(true);
  };

  // 5. Delete Logic (ยังใช้ SweetAlert สำหรับยืนยันการลบ)
  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: 'ลบรถคันนี้?',
      text: "ข้อมูลการใช้งานย้อนหลังอาจได้รับผลกระทบ กรุณาตรวจสอบให้แน่ใจ",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'ยืนยันลบ',
      cancelButtonText: 'ยกเลิก'
    });

    if (result.isConfirmed) {
      const { error } = await supabase.from('vehicles').delete().eq('id', id);
      if (error) {
        Swal.fire('Error', error.message, 'error');
      } else {
        Swal.fire('Deleted', 'ลบข้อมูลเรียบร้อย', 'success');
        fetchVehicles();
      }
    }
  };

  return (
    <div className="h-full flex flex-col gap-4 animate-fade-in-up">
      {/* Header */}
      <div className="flex justify-between items-center shrink-0">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
            ยานพาหนะ <span className="text-sm font-normal text-slate-400">| Fleet Management</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">จัดการรถยนต์และสถานะความพร้อม ({filteredVehicles.length} คัน)</p>
        </div>
        <button 
          onClick={handleAddVehicle}
          className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm shadow-primary/30 transition-all hover:scale-105"
        >
          <Plus className="w-4 h-4" />
          เพิ่มรถใหม่
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 shrink-0 bg-white p-2 rounded-2xl shadow-sm border border-slate-100">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="ค้นหาทะเบียน, ยี่ห้อ, รุ่น..." 
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-none rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 text-slate-600 placeholder-slate-400"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex gap-2 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'all', label: 'ทั้งหมด', icon: Car },
            { id: 'available', label: 'ว่าง', icon: Zap },
            { id: 'in_use', label: 'ใช้งานอยู่', icon: Zap },
            { id: 'maintenance', label: 'ซ่อมบำรุง', icon: Wrench },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setStatusFilter(f.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap border ${
                statusFilter === f.id 
                ? 'bg-slate-800 text-white border-slate-800 shadow-md' 
                : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
              }`}
            >
              {statusFilter === f.id && <f.icon className="w-3 h-3" />}
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid Content */}
      <div className="flex-1 min-h-0 overflow-y-auto -mr-2 pr-2 custom-scrollbar">
         {loading ? (
             <div className="flex items-center justify-center h-full text-slate-400">กำลังโหลด...</div>
         ) : filteredVehicles.length === 0 ? (
             <div className="flex flex-col items-center justify-center h-full text-slate-400 bg-white/50 rounded-2xl border-2 border-dashed border-slate-200 m-2">
                 <Car className="w-12 h-12 mb-2 text-slate-200" />
                 <p>ไม่พบข้อมูลยานพาหนะ</p>
             </div>
         ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 pb-10">
                {filteredVehicles.map((vehicle) => (
                    <VehicleCard 
                        key={vehicle.id} 
                        vehicle={vehicle} 
                        onEdit={handleEdit} 
                        onDelete={handleDelete} 
                    />
                ))}
            </div>
         )}
      </div>

      {/* Modal Form (วางไว้นอกสุด เพื่อให้แสดงทับหน้าจอ) */}
      <VehicleModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={fetchVehicles} 
        vehicleToEdit={editingVehicle}
      />
    </div>
  );
}