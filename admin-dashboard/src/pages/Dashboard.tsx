import { Users, Car, Map, TrendingUp } from 'lucide-react';
import StatCard from '../components/dashboard/StatCard';
import UsageChart from '../components/dashboard/UsageChart';
import StatusChart from '../components/dashboard/StatusChart';

export default function Dashboard() {
  return (
    // ใช้ flex-col และ h-full เพื่อคุมความสูง
    <div className="h-full flex flex-col gap-3 animate-fade-in-up">
      
      {/* 1. Header (สูงเท่าที่จำเป็น shrink-0) */}
      <div className="flex justify-between items-center shrink-0 py-1">
        <div>
          <h2 className="text-lg font-bold text-slate-800 tracking-tight flex items-center gap-2">
            ภาพรวมระบบ <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
          </h2>
        </div>
        <div className="hidden sm:block">
           <span className="text-[10px] font-medium bg-white px-3 py-1 rounded-full shadow-sm border border-slate-200 text-slate-500">
             📅 {new Date().toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' })}
           </span>
        </div>
      </div>

      {/* 2. KPI Section (สูง Fixed ประมาณ 72px) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 shrink-0 h-[72px]">
        <StatCard title="ผู้ใช้งาน" value="12" subValue="+2 ใหม่" icon={Users} trend="up" colorClass="bg-blue-500" />
        <StatCard title="ยานพาหนะ" value="8" subValue="พร้อม 5" icon={Car} colorClass="bg-green-600" />
        <StatCard title="ระยะทางรวม" value="45k" subValue="+12%" icon={Map} trend="up" colorClass="bg-amber-500" />
        <StatCard title="เฉลี่ย/วัน" value="2.1k" subValue="-8%" icon={TrendingUp} trend="down" colorClass="bg-indigo-500" />
      </div>

      {/* 3. Main Grid (ยืดเต็มพื้นที่ flex-1 min-h-0) */}
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-3 pb-2">
        
        {/* Left Column (กินพื้นที่ 8/12 ส่วน) */}
        <div className="lg:col-span-8 flex flex-col gap-3 h-full min-h-0">
          
          {/* กราฟเส้น (บน) - ให้พื้นที่ 55% */}
          <div className="flex-[55] bg-white p-3 rounded-xl shadow-sm border border-slate-200 relative min-h-0">
             <UsageChart />
          </div>
          
          {/* กิจกรรม (ล่าง) - ให้พื้นที่ 45% */}
          <div className="flex-[45] bg-white p-3 rounded-xl shadow-sm border border-slate-200 flex flex-col min-h-0">
             <h3 className="text-xs font-bold text-slate-700 mb-2 shrink-0">กิจกรรมล่าสุด</h3>
             <div className="overflow-y-auto pr-2 flex-1 space-y-2 custom-scrollbar">
                {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                    <div key={i} className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg transition-colors border border-transparent hover:border-slate-100 cursor-pointer group">
                        <div className="w-7 h-7 shrink-0 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-[10px] group-hover:bg-primary/10 group-hover:text-primary transition-colors">JD</div>
                        <div className="min-w-0 flex-1">
                            <div className="flex justify-between items-baseline">
                                <p className="text-xs font-medium text-slate-700 truncate">John Doe เช็คอินรถ BP-1234</p>
                                <span className="text-[10px] text-slate-400">10:30</span>
                            </div>
                        </div>
                    </div>
                ))}
             </div>
          </div>
        </div>

        {/* Right Column (กินพื้นที่ 4/12 ส่วน) */}
        <div className="lg:col-span-4 flex flex-col gap-3 h-full min-h-0">
           
           {/* กราฟวงกลม (บน) - ให้พื้นที่ 45% */}
           <div className="flex-[45] bg-white p-3 rounded-xl shadow-sm border border-slate-200 min-h-0">
              <StatusChart />
           </div>

           {/* ตารางคนขับ (ล่าง) - ให้พื้นที่ 55% */}
           <div className="flex-[55] bg-white p-3 rounded-xl shadow-sm border border-slate-200 flex flex-col min-h-0">
             <h3 className="text-xs font-bold text-slate-700 mb-2 shrink-0">Top Drivers</h3>
             <div className="overflow-y-auto pr-1 flex-1 custom-scrollbar">
               <table className="w-full text-xs text-left">
                  <tbody className="divide-y divide-slate-50">
                      {[
                          {name: 'John Doe', dist: '1,245'},
                          {name: 'Jane Smith', dist: '980'},
                          {name: 'Mike J.', dist: '756'},
                          {name: 'Sarah L.', dist: '654'},
                          {name: 'Tom B.', dist: '543'},
                          {name: 'Lisa W.', dist: '432'},
                      ].map((d, i) => (
                          <tr key={i} className="group hover:bg-slate-50">
                              <td className="py-2 pl-1 font-medium text-slate-600 truncate">{i+1}. {d.name}</td>
                              <td className="py-2 text-right font-bold text-primary group-hover:scale-105 transition-transform">{d.dist}</td>
                          </tr>
                      ))}
                  </tbody>
               </table>
             </div>
          </div>
        </div>

      </div>
    </div>
  );
}