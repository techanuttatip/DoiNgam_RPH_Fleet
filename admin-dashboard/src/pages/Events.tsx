import { useState, useEffect } from 'react';
import { Plus, Search, Calendar as CalendarIcon, List } from 'lucide-react';
import { supabase } from '../lib/supabase';
import  type { Event } from '../types/database';
import EventModal from '../components/events/EventModal';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import Swal from 'sweetalert2';

export default function Events() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar'); // เพิ่มโหมดสลับมุมมอง

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);

  const fetchEvents = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('events')
      .select(`*, vehicle:vehicles(*), participants:event_participants(user:profiles(*))`)
      .order('start_time', { ascending: true });

    if (error) console.error(error);
    else setEvents(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchEvents(); }, []);

  // แปลงข้อมูลจาก Database ให้เข้ากับรูปแบบของ FullCalendar
  const calendarEvents = events.map(event => ({
    id: event.id,
    title: `${event.vehicle?.plate_number || ''} ${event.title}`,
    start: event.start_time,
    end: event.end_time,
    backgroundColor: 
      event.event_type === 'delivery' ? '#3b82f6' : 
      event.event_type === 'inspection' ? '#f59e0b' : '#ef4444',
    extendedProps: { ...event }
  }));

  const handleEventClick = (info: any) => {
    handleEdit(info.event.extendedProps);
  };

  const handleAdd = () => { setEditingEvent(null); setIsModalOpen(true); };
  const handleEdit = (event: Event) => { setEditingEvent(event); setIsModalOpen(true); };

  return (
    <div className="h-full flex flex-col gap-4 animate-fade-in-up">
      {/* Header */}
      <div className="flex justify-between items-center shrink-0">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
            ตารางการใช้รถ <span className="text-sm font-normal text-slate-400">| Schedule</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">จัดการภารกิจและการจองรถ ({events.length} รายการ)</p>
        </div>
        <div className="flex gap-2">
          {/* ปุ่มสลับโหมด */}
          <div className="bg-white border border-slate-200 rounded-xl p-1 flex shadow-sm">
             <button 
                onClick={() => setViewMode('calendar')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'calendar' ? 'bg-primary text-white shadow-md' : 'text-slate-400 hover:bg-slate-50'}`}
             >
                <CalendarIcon className="w-4 h-4" />
             </button>
             <button 
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-primary text-white shadow-md' : 'text-slate-400 hover:bg-slate-50'}`}
             >
                <List className="w-4 h-4" />
             </button>
          </div>
          <button onClick={handleAdd} className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm transition-all hover:scale-105">
            <Plus className="w-4 h-4" /> สร้างภารกิจ
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 min-h-0 bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
        {viewMode === 'calendar' ? (
          <div className="flex-1 p-6 overflow-y-auto calendar-container">
            <FullCalendar
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              initialView="dayGridMonth"
              headerToolbar={{
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek,timeGridDay'
              }}
              locale="th"
              events={calendarEvents}
              eventClick={handleEventClick}
              height="100%"
              buttonText={{
                today: 'วันนี้',
                month: 'เดือน',
                week: 'สัปดาห์',
                day: 'วัน'
              }}
              eventTimeFormat={{
                hour: '2-digit',
                minute: '2-digit',
                meridiem: false,
                hour12: false
              }}
            />
          </div>
        ) : (
          <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
             {/* ... ส่วน List งานเดิมที่คุณมีอยู่ ... */}
             <p className="text-center text-slate-400">แสดงผลแบบรายการ (List View)</p>
          </div>
        )}
      </div>

      <EventModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSuccess={fetchEvents} eventToEdit={editingEvent} />
      
      {/* CSS สำหรับปรับแต่งหน้าตา FullCalendar ให้เข้ากับ Theme โปรเจกต์ */}
      <style>{`
        .fc { --fc-border-color: #f1f5f9; --fc-button-bg-color: #2E7D32; --fc-button-border-color: #2E7D32; --fc-event-resizer-thickness: 8px; font-family: inherit; }
        .fc .fc-toolbar-title { font-size: 1.25rem; font-weight: 800; color: #1e293b; }
        .fc .fc-col-header-cell-cushion { font-size: 0.875rem; font-weight: 600; color: #64748b; padding: 10px 0; }
        .fc-event { border: none !important; padding: 2px 4px; border-radius: 6px !important; font-size: 11px !important; cursor: pointer !important; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
        .fc-v-event { border-left: 4px solid rgba(0,0,0,0.2) !important; }
        .fc .fc-button-primary:disabled { background-color: #cbd5e1; border-color: #cbd5e1; }
        .fc .fc-button-primary:not(:disabled):active, .fc .fc-button-primary:not(:disabled).fc-button-active { background-color: #1b5e20; border-color: #1b5e20; }
      `}</style>
    </div>
  );
}