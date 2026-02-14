import { useState, useEffect } from 'react';
import { X, Save, Calendar, Clock, MapPin, Users, Car, Bell } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { Profile, Vehicle, Event } from '../../types/database';
import Swal from 'sweetalert2';

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  eventToEdit?: Event | null;
}

export default function EventModal({ isOpen, onClose, onSuccess, eventToEdit }: EventModalProps) {
  // Master Data (ตัวเลือกใน Dropdown)
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [users, setUsers] = useState<Profile[]>([]);
  
  // Form State
  const [formData, setFormData] = useState({
    title: '',
    event_type: 'delivery',
    start_date: '',
    start_time: '',
    end_date: '',
    end_time: '',
    vehicle_id: '',
    description: '',
    participant_ids: [] as string[], // เก็บ ID คนที่ถูกเลือกหลายคน
    is_line_notify_enabled: true
  });
  
  const [loading, setLoading] = useState(false);

  // 1. โหลดข้อมูลรถและคน เมื่อเปิด Modal
  useEffect(() => {
    if (isOpen) {
      const fetchMasterData = async () => {
        const [vReq, uReq] = await Promise.all([
          supabase.from('vehicles').select('*').eq('status', 'available').order('plate_number'),
          supabase.from('profiles').select('*').eq('status', 'active').order('full_name')
        ]);
        
        // ถ้าเป็นการแก้ไข ให้เอารถคันเดิมมาด้วย (แม้สถานะจะไม่ว่าง)
        if (eventToEdit && eventToEdit.vehicle) {
           setVehicles(prev => {
              const exists = vReq.data?.find(v => v.id === eventToEdit.vehicle_id);
              return exists ? (vReq.data || []) : [...(vReq.data || []), eventToEdit.vehicle!];
           });
        } else {
           setVehicles(vReq.data || []);
        }
        
        setUsers(uReq.data || []);
      };
      
      fetchMasterData();
      document.body.style.overflow = 'hidden';
      
      // Setup Form Data
      if (eventToEdit) {
        const start = new Date(eventToEdit.start_time);
        const end = new Date(eventToEdit.end_time);
        
        setFormData({
          title: eventToEdit.title,
          event_type: eventToEdit.event_type,
          start_date: start.toISOString().split('T')[0],
          start_time: start.toTimeString().slice(0, 5),
          end_date: end.toISOString().split('T')[0],
          end_time: end.toTimeString().slice(0, 5),
          vehicle_id: eventToEdit.vehicle_id || '',
          description: eventToEdit.description || '',
          participant_ids: eventToEdit.participants?.map(p => p.user.id) || [],
          is_line_notify_enabled: eventToEdit.is_line_notify_enabled
        });
      } else {
         // Default ค่าเริ่มต้น
         const today = new Date().toISOString().split('T')[0];
         setFormData({
            title: '', event_type: 'delivery',
            start_date: today, start_time: '09:00',
            end_date: today, end_time: '12:00',
            vehicle_id: '', description: '', participant_ids: [], is_line_notify_enabled: true
         });
      }
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isOpen, eventToEdit]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // แปลงวันเวลาเป็น ISO String
      const startDateTime = new Date(`${formData.start_date}T${formData.start_time}:00`).toISOString();
      const endDateTime = new Date(`${formData.end_date}T${formData.end_time}:00`).toISOString();

      // ข้อมูลที่จะลงตาราง events
      const eventPayload = {
        title: formData.title,
        event_type: formData.event_type,
        start_time: startDateTime,
        end_time: endDateTime,
        vehicle_id: formData.vehicle_id || null,
        description: formData.description,
        is_line_notify_enabled: formData.is_line_notify_enabled,
      };

      let eventId = eventToEdit?.id;

      if (eventToEdit) {
        // UPDATE
        const { error } = await supabase.from('events').update(eventPayload).eq('id', eventId);
        if (error) throw error;
        
        // ลบ Participants เดิมออกก่อน แล้วค่อยเพิ่มใหม่ (วิธีง่ายสุด)
        await supabase.from('event_participants').delete().eq('event_id', eventId);
      } else {
        // INSERT
        const { data, error } = await supabase.from('events').insert([eventPayload]).select().single();
        if (error) throw error;
        eventId = data.id;
        
        // อัปเดตสถานะรถเป็น 'in_use' (ถ้ามีการเลือกรถ)
        if (formData.vehicle_id) {
           await supabase.from('vehicles').update({ status: 'in_use' }).eq('id', formData.vehicle_id);
        }
      }

      // Insert Participants ใหม่
      if (formData.participant_ids.length > 0) {
        const participantsPayload = formData.participant_ids.map(userId => ({
          event_id: eventId,
          user_id: userId
        }));
        const { error: partError } = await supabase.from('event_participants').insert(participantsPayload);
        if (partError) throw partError;
      }

      Swal.fire({ icon: 'success', title: 'บันทึกสำเร็จ', timer: 1500, showConfirmButton: false });
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error(error);
      Swal.fire('Error', error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Helper สำหรับเลือก Multi-select User
  const toggleParticipant = (userId: string) => {
    setFormData(prev => {
      const exists = prev.participant_ids.includes(userId);
      return {
        ...prev,
        participant_ids: exists 
          ? prev.participant_ids.filter(id => id !== userId)
          : [...prev.participant_ids, userId]
      };
    });
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-opacity">
      <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
          <div className="flex-1 text-center">
             <h3 className="text-xl font-bold text-slate-800 flex items-center justify-center gap-2">
               <span className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                 <Calendar className="w-5 h-5" />
               </span>
               {eventToEdit ? 'แก้ไขรายละเอียดงาน' : 'จองรถ / สร้างงานใหม่'}
             </h3>
          </div>
          <button onClick={onClose} className="absolute right-6 p-2 hover:bg-slate-100 rounded-full text-slate-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 overflow-y-auto custom-scrollbar bg-slate-50/50">
          <form id="event-form" onSubmit={handleSubmit} className="space-y-6">
            
            {/* 1. ชื่องาน & ประเภท */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="text-xs font-bold text-slate-500 mb-1.5 block">หัวข้อภารกิจ <span className="text-red-500">*</span></label>
                <input required type="text" placeholder="เช่น ไปรับท่านผู้อำนวยการ"
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none"
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 mb-1.5 block">ประเภท</label>
                <select 
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl outline-none"
                  value={formData.event_type}
                  onChange={e => setFormData({...formData, event_type: e.target.value})}
                >
                  <option value="delivery">🚚 ไปราชการ</option>
                  <option value="inspection">🔍 ลงตรวจเยี่ยม</option>
                  <option value="other">📝 อื่นๆ</option>
                </select>
              </div>
            </div>

            {/* 2. วันเวลา */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
               <div className="flex items-center gap-2 mb-3 text-primary font-bold text-sm">
                  <Clock className="w-4 h-4" /> กำหนดการ
               </div>
               <div className="grid grid-cols-2 gap-4">
                  <div>
                     <label className="text-[10px] text-slate-400 block mb-1">เริ่ม</label>
                     <div className="flex gap-2">
                        <input type="date" required className="flex-1 px-3 py-2 border rounded-lg text-sm" 
                           value={formData.start_date} onChange={e => setFormData({...formData, start_date: e.target.value})} />
                        <input type="time" required className="w-24 px-3 py-2 border rounded-lg text-sm"
                           value={formData.start_time} onChange={e => setFormData({...formData, start_time: e.target.value})} />
                     </div>
                  </div>
                  <div>
                     <label className="text-[10px] text-slate-400 block mb-1">สิ้นสุด</label>
                     <div className="flex gap-2">
                        <input type="date" required className="flex-1 px-3 py-2 border rounded-lg text-sm"
                           value={formData.end_date} onChange={e => setFormData({...formData, end_date: e.target.value})} />
                        <input type="time" required className="w-24 px-3 py-2 border rounded-lg text-sm"
                           value={formData.end_time} onChange={e => setFormData({...formData, end_time: e.target.value})} />
                     </div>
                  </div>
               </div>
            </div>

            {/* 3. เลือกรถ */}
            <div>
               <label className="text-xs font-bold text-slate-500 mb-1.5 flex items-center gap-2">
                  <Car className="w-4 h-4" /> ยานพาหนะ
               </label>
               <select 
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl outline-none"
                  value={formData.vehicle_id}
                  onChange={e => setFormData({...formData, vehicle_id: e.target.value})}
               >
                  <option value="">-- ไม่ระบุ / ใช้รถส่วนตัว --</option>
                  {vehicles.map(v => (
                     <option key={v.id} value={v.id}>
                        {v.plate_number} - {v.brand} {v.model} ({v.seat_capacity} ที่นั่ง)
                     </option>
                  ))}
               </select>
            </div>

            {/* 4. เลือกคน (Multi-select แบบง่าย) */}
            <div>
               <label className="text-xs font-bold text-slate-500 mb-1.5 flex items-center gap-2">
                  <Users className="w-4 h-4" /> ผู้เข้าร่วม / คนขับ
               </label>
               <div className="bg-white border border-slate-200 rounded-xl p-3 max-h-32 overflow-y-auto custom-scrollbar grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {users.map(u => (
                     <label key={u.id} className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-all ${
                        formData.participant_ids.includes(u.id) ? 'bg-primary/10 border-primary' : 'border-transparent hover:bg-slate-50'
                     }`}>
                        <input 
                           type="checkbox" 
                           className="rounded text-primary focus:ring-0"
                           checked={formData.participant_ids.includes(u.id)}
                           onChange={() => toggleParticipant(u.id)}
                        />
                        <span className="text-sm truncate">{u.full_name}</span>
                        <span className="text-[10px] text-slate-400 bg-slate-100 px-1.5 rounded">{u.position}</span>
                     </label>
                  ))}
               </div>
            </div>

            {/* 5. รายละเอียด & แจ้งเตือน */}
            <div className="grid grid-cols-1 gap-4">
               <div>
                  <label className="text-xs font-bold text-slate-500 mb-1.5 block">รายละเอียดเพิ่มเติม</label>
                  <textarea rows={3} placeholder="ระบุสถานที่ หรือหมายเหตุ..."
                     className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none resize-none"
                     value={formData.description}
                     onChange={e => setFormData({...formData, description: e.target.value})}
                  />
               </div>
               
               <div className="flex items-center gap-3 bg-green-50 p-3 rounded-xl border border-green-100">
                  <div className="p-2 bg-white rounded-full text-green-600 shadow-sm">
                     <Bell className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                     <p className="text-sm font-bold text-green-800">แจ้งเตือนผ่าน LINE</p>
                     <p className="text-xs text-green-600">ส่งข้อความแจ้งเตือนผู้เข้าร่วมทุกคนอัตโนมัติ</p>
                  </div>
                  <input 
                     type="checkbox" 
                     className="w-5 h-5 text-green-600 rounded focus:ring-green-500"
                     checked={formData.is_line_notify_enabled}
                     onChange={e => setFormData({...formData, is_line_notify_enabled: e.target.checked})}
                  />
               </div>
            </div>

          </form>
        </div>

        {/* Footer */}
        <div className="px-8 py-5 border-t border-slate-100 bg-white flex justify-end gap-3 shrink-0">
          <button onClick={onClose} type="button" className="px-6 py-2.5 text-slate-500 font-bold hover:bg-slate-50 rounded-xl transition-colors text-sm">
            ยกเลิก
          </button>
          <button 
            type="submit" 
            form="event-form"
            disabled={loading}
            className="flex items-center gap-2 px-8 py-2.5 bg-primary hover:bg-primary-hover text-white font-bold rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-95 text-sm"
          >
            <Save className="w-4 h-4" />
            {loading ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}
          </button>
        </div>

      </div>
    </div>
  );
}