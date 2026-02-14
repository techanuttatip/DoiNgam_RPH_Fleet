import { useState, useEffect } from 'react';
import { X, Save, Car, Upload } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { Vehicle } from '../../types/database';
import ImageUpload from '../common/ImageUpload';
import Swal from 'sweetalert2';

interface VehicleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  vehicleToEdit?: Vehicle | null;
}

export default function VehicleModal({ isOpen, onClose, onSuccess, vehicleToEdit }: VehicleModalProps) {
  const [formData, setFormData] = useState({
    plate_number: '',
    brand: '',
    model: '',
    vehicle_type: 'sedan',
    seat_capacity: 4,
    fuel_type: 'diesel',
    current_mileage: 0,
    status: 'available',
    image_url: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (vehicleToEdit) {
        setFormData({
          plate_number: vehicleToEdit.plate_number,
          brand: vehicleToEdit.brand || '',
          model: vehicleToEdit.model || '',
          vehicle_type: vehicleToEdit.vehicle_type || 'sedan',
          seat_capacity: vehicleToEdit.seat_capacity || 4,
          fuel_type: vehicleToEdit.fuel_type || 'diesel',
          current_mileage: vehicleToEdit.current_mileage,
          status: vehicleToEdit.status,
          image_url: vehicleToEdit.image_url || ''
        });
      } else {
        setFormData({
          plate_number: '', brand: '', model: '', vehicle_type: 'sedan',
          seat_capacity: 4, fuel_type: 'diesel', current_mileage: 0, status: 'available', image_url: ''
        });
      }
      // ล็อค Scroll ของ Body ไม่ให้ขยับ
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [vehicleToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (vehicleToEdit) {
        const { error } = await supabase.from('vehicles').update(formData).eq('id', vehicleToEdit.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('vehicles').insert([formData]);
        if (error) throw error;
      }
      Swal.fire({ icon: 'success', title: 'บันทึกสำเร็จ', timer: 1500, showConfirmButton: false });
      onSuccess();
      onClose();
    } catch (error: any) {
      Swal.fire('Error', error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    // Backdrop: สีเข้มขึ้นนิดนึงเพื่อให้ Modal เด่น
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-opacity">
      
      {/* Modal Container: ใช้ Animation Scale-In เพื่อความนิ่ง (ไม่เลื่อนขึ้นลง) */}
      <div 
        className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200"
        style={{ animationFillMode: 'forwards' }} // ป้องกันการกระพริบ
      >
        
        {/* --- Header (จัดกึ่งกลาง) --- */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between relative bg-white">
          {/* ปุ่มปิดอยู่มุมขวา (Absolute) */}
          <button onClick={onClose} className="absolute right-6 p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400">
            <X className="w-5 h-5" />
          </button>
          
          {/* Title ตรงกลาง */}
          <div className="w-full text-center">
            <h3 className="text-xl font-bold text-slate-800 flex items-center justify-center gap-2">
              <span className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <Car className="w-5 h-5" />
              </span>
              {vehicleToEdit ? 'แก้ไขข้อมูลรถ' : 'เพิ่มยานพาหนะใหม่'}
            </h3>
          </div>
        </div>

        {/* --- Content --- */}
        <div className="p-8 overflow-y-auto custom-scrollbar bg-slate-50/50">
          <form id="vehicle-form" onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            
            {/* Column 1: ข้อมูลหลัก */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                 <span className="w-1 h-4 bg-primary rounded-full"></span>
                 <h4 className="text-sm font-bold text-slate-700">ข้อมูลทั่วไป</h4>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500 mb-1.5 block">เลขทะเบียน <span className="text-red-500">*</span></label>
                <input required type="text" placeholder="เช่น กก-1234"
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-medium text-slate-700"
                  value={formData.plate_number}
                  onChange={e => setFormData({...formData, plate_number: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-500 mb-1.5 block">ยี่ห้อ</label>
                  <input type="text" placeholder="Toyota"
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    value={formData.brand}
                    onChange={e => setFormData({...formData, brand: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 mb-1.5 block">รุ่น</label>
                  <input type="text" placeholder="Revo"
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    value={formData.model}
                    onChange={e => setFormData({...formData, model: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500 mb-1.5 block">ประเภทรถ</label>
                <select 
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none cursor-pointer"
                  value={formData.vehicle_type}
                  onChange={e => setFormData({...formData, vehicle_type: e.target.value})}
                >
                  <option value="sedan">🚗 รถเก๋ง (Sedan)</option>
                  <option value="pickup">🛻 รถกระบะ (Pickup)</option>
                  <option value="van">🚐 รถตู้ (Van)</option>
                  <option value="suv">🚙 รถตรวจการณ์ (SUV)</option>
                  <option value="truck">🚛 รถบรรทุก (Truck)</option>
                  <option value="motorcycle">🛵 รถจักรยานยนต์</option>
                </select>
              </div>
            </div>

            {/* Column 2: สเปค & รูปภาพ */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                 <span className="w-1 h-4 bg-amber-500 rounded-full"></span>
                 <h4 className="text-sm font-bold text-slate-700">สเปค & รูปภาพ</h4>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                   <label className="text-xs font-semibold text-slate-500 mb-1.5 block">เชื้อเพลิง</label>
                   <select 
                      className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none cursor-pointer"
                      value={formData.fuel_type}
                      onChange={e => setFormData({...formData, fuel_type: e.target.value})}
                    >
                      <option value="diesel">⛽ ดีเซล</option>
                      <option value="benzine">⛽ เบนซิน</option>
                      <option value="ev">⚡ ไฟฟ้า (EV)</option>
                      <option value="hybrid">🔋 ไฮบริด</option>
                    </select>
                </div>
                <div>
                   <label className="text-xs font-semibold text-slate-500 mb-1.5 block">เลขไมล์ (กม.)</label>
                   <input type="number" min="0"
                      className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none"
                      value={formData.current_mileage}
                      onChange={e => setFormData({...formData, current_mileage: parseFloat(e.target.value) || 0})}
                   />
                </div>
              </div>

              {/* Image Upload - ปรับให้ Compact ขึ้น */}
              <div className="pt-1">
                <label className="text-xs font-semibold text-slate-500 mb-2 block text-center">รูปภาพรถ</label>
                <div className="bg-white p-3 rounded-2xl border border-slate-200">
                  <ImageUpload 
                    folder="vehicles"
                    id={vehicleToEdit?.id || `new-${Date.now()}`} 
                    currentImageUrl={formData.image_url}
                    onUpload={(url) => setFormData({ ...formData, image_url: url })}
                  />
                </div>
              </div>
            </div>

          </form>
        </div>

        {/* --- Footer --- */}
        <div className="px-8 py-5 border-t border-slate-100 bg-white flex justify-end gap-3">
          <button 
            onClick={onClose} 
            type="button" 
            className="px-6 py-2.5 text-slate-500 font-bold hover:bg-slate-50 rounded-xl transition-colors text-sm"
          >
            ยกเลิก
          </button>
          <button 
            type="submit" 
            form="vehicle-form"
            disabled={loading}
            className="flex items-center gap-2 px-8 py-2.5 bg-primary hover:bg-primary-hover text-white font-bold rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-95 text-sm"
          >
            <Save className="w-4 h-4" />
            {loading ? 'บันทึก...' : 'บันทึกข้อมูล'}
          </button>
        </div>

      </div>
    </div>
  );
}