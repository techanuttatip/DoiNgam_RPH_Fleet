import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const data = [
  { name: 'ว่าง', value: 5, color: '#388E3C' },
  { name: 'ใช้งาน', value: 2, color: '#1976D2' },
  { name: 'ซ่อม', value: 1, color: '#F57C00' },
];

export default function StatusChart() {
  return (
    <div className="h-full flex flex-col w-full">
      <h3 className="text-xs font-bold text-slate-700 mb-2 flex items-center gap-2 shrink-0">
        <span className="w-1 h-3 bg-amber-500 rounded-full"></span>
        สถานะรถ
      </h3>
      <div className="flex-1 min-h-0 w-full relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={50} // ลดขนาดวงกลมลง
              outerRadius={70}
              paddingAngle={5}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
              ))}
            </Pie>
            <Tooltip contentStyle={{ fontSize: '12px', borderRadius: '8px' }} />
            <Legend 
                verticalAlign="bottom" 
                height={24} 
                iconType="circle" 
                iconSize={8}
                wrapperStyle={{ fontSize: '10px' }}
            />
          </PieChart>
        </ResponsiveContainer>
        {/* Text ตรงกลาง Donut */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-6">
            <span className="text-xl font-bold text-slate-700">8</span>
            <span className="text-[8px] text-slate-400">ทั้งหมด</span>
        </div>
      </div>
    </div>
  );
}