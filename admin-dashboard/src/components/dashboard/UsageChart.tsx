import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'จ.', distance: 40 },
  { name: 'อ.', distance: 85 },
  { name: 'พ.', distance: 60 },
  { name: 'พฤ.', distance: 95 },
  { name: 'ศ.', distance: 110 },
  { name: 'ส.', distance: 55 },
  { name: 'อา.', distance: 30 },
];

export default function UsageChart() {
  return (
    <div className="h-full flex flex-col w-full">
      <h3 className="text-xs font-bold text-slate-700 mb-2 flex items-center gap-2 shrink-0">
        <span className="w-1 h-3 bg-primary rounded-full"></span>
        สถิติการใช้งาน (กม.)
      </h3>
      {/* min-h-0 สำคัญมาก เพื่อให้กราฟหดตัวได้ */}
      <div className="flex-1 min-h-0 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 10}} dy={10} />
            <YAxis axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 10}} />
            <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '12px' }}
            />
            <Line 
                type="monotone" 
                dataKey="distance" 
                stroke="#2E7D32" 
                strokeWidth={2} 
                dot={{ r: 3, fill: '#2E7D32', strokeWidth: 1, stroke: '#fff' }} 
                activeDot={{ r: 5 }} 
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}