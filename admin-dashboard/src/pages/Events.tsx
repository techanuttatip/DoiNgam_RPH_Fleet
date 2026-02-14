import { useState, useEffect } from 'react';
import { Plus, Search, Calendar, Clock, MapPin, Car, Users } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Event } from '../types/database';
import EventModal from '../components/events/EventModal';
import Swal from 'sweetalert2';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';

export default function Events() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);

  const fetchEvents = async () => {
    setLoading(true);
    // ดึงข้อมูล Event พร้อม Join ตาราง users และ vehicles
    const { data, error } = await supabase
      .from('events')
      .select(`
        *,
        vehicle:vehicles(*),
        participants:event_participants(
          user:profiles(*)
        )
      `)
      .order('start_time', { ascending: true }); // เรียงตามเวลาเริ่ม (ใกล้สุดขึ้นก่อน)

    if (error) {
      console.error(error);
      Swal.fire('Error', 'ไม่สามารถโหลดข้อมูลงานได้', 'error');
    } else {
      setEvents(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  // Filter
  const filteredEvents = events.filter(e => 
    e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.vehicle?.plate_number.includes(searchTerm)
  );

  const handleAdd = () => {
    setEditingEvent(null);
    setIsModalOpen(true);
  };

  const handleEdit = (event: Event) => {
    setEditingEvent(event);
    setIsModalOpen(true);
  };
  
  const handleDelete = async (id: string) => {
      // (ใส่ Logic Delete เหมือนหน้าอื่น)
      // ...
  };

  return (
    <div className="h-full flex flex-col gap-4 animate-fade-in-up">
      {/* Header */}
      <div className="flex justify-between items-center shrink-0">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
            ตารางการใช้รถ <span className="text-sm font-normal text-slate-400">| Schedule</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">จัดการภารกิจและการจองรถ ({filteredEvents.length} รายการ)</p>
        </div>
        <button onClick={handleAdd} className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm shadow-primary/30 transition-all hover:scale-105">
          <Plus className="w-4 h-4" /> สร้างภารกิจใหม่
        </button>
      </div>

      {/* Filter */}
      <div className="bg-white p-2 rounded-2xl shadow-sm border border-slate-100 shrink-0">
         <div className="relative">
             <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
             <input type="text" placeholder="ค้นหาชื่องาน, ทะเบียนรถ..." 
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-none rounded-xl text-sm outline-none"
                value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
         </div>
      </div>

      {/* Events List */}
      <div className="flex-1 min-h-0 overflow-y-auto -mr-2 pr-2 custom-scrollbar space-y-3 pb-10">
         {loading ? (
             <div className="text-center text-slate-400 py-10">กำลังโหลดข้อมูล...</div>
         ) : filteredEvents.length === 0 ? (
             <div className="text-center text-slate-400 py-10 bg-white/50 rounded-2xl border-2 border-dashed">ไม่พบรายการจอง</div>
         ) : (
             filteredEvents.map(event => {
                const start = new Date(event.start_time);
                const end = new Date(event.end_time);
                const isPast = end < new Date(); // งานที่จบไปแล้ว

                return (
                   <div key={event.id} 
                      onClick={() => handleEdit(event)}
                      className={`bg-white p-4 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-all cursor-pointer group relative overflow-hidden ${isPast ? 'opacity-60 grayscale-[0.5]' : ''}`}
                   >
                      <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${
                         event.event_type === 'delivery' ? 'bg-blue-500' :
                         event.event_type === 'inspection' ? 'bg-orange-500' : 
                         event.event_type === 'maintenance' ? 'bg-red-500' : 'bg-purple-500'
                      }`}></div>

                      <div className="flex flex-col sm:flex-row gap-4">
                         {/* Date Box */}
                         <div className="flex flex-col items-center justify-center bg-slate-50 p-3 rounded-xl min-w-[80px]">
                            <span className="text-xs font-bold text-red-500 uppercase">{format(start, 'MMM', { locale: th })}</span>
                            <span className="text-2xl font-bold text-slate-800">{format(start, 'd')}</span>
                            <span className="text-[10px] text-slate-400">{format(start, 'EEE', { locale: th })}</span>
                         </div>

                         {/* Content */}
                         <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start">
                               <h3 className="text-lg font-bold text-slate-800 truncate pr-2">{event.title}</h3>
                               <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${isPast ? 'bg-slate-100 text-slate-500' : 'bg-green-50 text-green-600 border-green-100'}`}>
                                  {isPast ? 'เสร็จสิ้น' : 'กำลังดำเนินการ'}
                               </span>
                            </div>
                            
                            <div className="flex flex-wrap gap-x-6 gap-y-2 mt-2 text-sm text-slate-600">
                               <div className="flex items-center gap-1.5">
                                  <Clock className="w-4 h-4 text-slate-400" />
                                  <span>{format(start, 'HH:mm')} - {format(end, 'HH:mm')} น.</span>
                               </div>
                               {event.vehicle && (
                                  <div className="flex items-center gap-1.5">
                                     <Car className="w-4 h-4 text-slate-400" />
                                     <span className="font-medium">{event.vehicle.plate_number}</span>
                                  </div>
                               )}
                            </div>

                            {/* Participants Avatars */}
                            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-50">
                               <div className="flex -space-x-2">
                                  {event.participants?.map((p, i) => (
                                     <div key={i} className="w-6 h-6 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center text-[8px] overflow-hidden" title={p.user.full_name}>
                                        {p.user.avatar_url ? <img src={p.user.avatar_url} className="w-full h-full object-cover" /> : p.user.full_name[0]}
                                     </div>
                                  ))}
                                  {(!event.participants || event.participants.length === 0) && <span className="text-xs text-slate-400 italic">ไม่ระบุผู้เข้าร่วม</span>}
                               </div>
                               <div className="text-xs text-slate-400 truncate flex-1">
                                  {event.description || '-'}
                               </div>
                            </div>
                         </div>
                      </div>
                   </div>
                );
             })
         )}
      </div>

      <EventModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchEvents}
        eventToEdit={editingEvent}
      />
    </div>
  );
}