import { Edit, Trash2, Gauge, CalendarClock, Car } from 'lucide-react';
import type { Vehicle } from '../../types/database';

interface VehicleCardProps {
  vehicle: Vehicle;
  onEdit: (vehicle: Vehicle) => void;
  onDelete: (id: string) => void;
}

export default function VehicleCard({ vehicle, onEdit, onDelete }: VehicleCardProps) {
  // กำหนดสีตามสถานะ
  const statusColors = {
    available: 'bg-green-100 text-green-700 border-green-200',
    in_use: 'bg-blue-100 text-blue-700 border-blue-200',
    maintenance: 'bg-orange-100 text-orange-700 border-orange-200'
  };

  const statusLabels = {
    available: 'ว่าง / พร้อมใช้',
    in_use: 'กำลังใช้งาน',
    maintenance: 'ซ่อมบำรุง'
  };

  return (
    <div className="group bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col h-full">
      {/* 1. Image Area */}
      <div className="relative h-32 bg-slate-100">
        {vehicle.image_url ? (
          <img src={vehicle.image_url} alt={vehicle.plate_number} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-slate-300">
            <Car className="w-12 h-12 mb-2" />
            <span className="text-xs">ไม่มีรูปภาพ</span>
          </div>
        )}
        
        {/* Badge สถานะ ลอยอยู่มุมขวาบน */}
        <div className={`absolute top-2 right-2 px-2.5 py-1 rounded-full text-[10px] font-bold border shadow-sm backdrop-blur-md ${statusColors[vehicle.status] || 'bg-slate-100'}`}>
          {statusLabels[vehicle.status] || vehicle.status}
        </div>
      </div>

      {/* 2. Content Area */}
      <div className="p-4 flex flex-col flex-1">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="text-lg font-bold text-slate-800 tracking-tight">{vehicle.plate_number}</h3>
            <p className="text-xs text-slate-500 font-medium">Toyota Hilux Revo (ตัวอย่าง)</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-2 mt-auto pt-3 border-t border-slate-50">
          <div className="flex flex-col items-center p-2 bg-slate-50 rounded-lg">
            <div className="flex items-center gap-1 text-slate-400 mb-1">
              <Gauge className="w-3 h-3" />
              <span className="text-[10px]">เลขไมล์</span>
            </div>
            <span className="text-sm font-bold text-slate-700">{vehicle.current_mileage.toLocaleString()}</span>
          </div>
          <div className="flex flex-col items-center p-2 bg-slate-50 rounded-lg">
             <div className="flex items-center gap-1 text-slate-400 mb-1">
              <CalendarClock className="w-3 h-3" />
              <span className="text-[10px]">เช็คระยะ</span>
            </div>
            <span className="text-xs font-medium text-slate-600">3 เดือนที่แล้ว</span>
          </div>
        </div>
        
        {/* Action Buttons (Hover Reveal) */}
        <div className="flex gap-2 mt-3 pt-2 opacity-0 group-hover:opacity-100 transition-opacity justify-end">
           <button onClick={() => onEdit(vehicle)} className="flex-1 flex items-center justify-center gap-2 py-1.5 text-xs font-medium text-amber-600 bg-amber-50 hover:bg-amber-100 rounded-lg transition-colors">
              <Edit className="w-3 h-3" /> แก้ไข
           </button>
           <button onClick={() => onDelete(vehicle.id)} className="flex-1 flex items-center justify-center gap-2 py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors">
              <Trash2 className="w-3 h-3" /> ลบ
           </button>
        </div>
      </div>
    </div>
  );
}