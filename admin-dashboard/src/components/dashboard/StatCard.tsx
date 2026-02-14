import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  subValue?: string;
  icon: LucideIcon;
  trend?: 'up' | 'down';
  colorClass?: string;
}

export default function StatCard({ title, value, subValue, icon: Icon, trend, colorClass = "bg-primary" }: StatCardProps) {
  return (
    <div className="bg-white p-3 rounded-xl shadow-sm border border-slate-200 h-full flex items-center gap-3 relative overflow-hidden group">
      {/* Icon Compact ด้านซ้าย */}
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${colorClass} bg-opacity-10 text-current`}>
        <Icon className={`w-5 h-5 ${colorClass.replace('bg-', 'text-')}`} />
      </div>

      {/* Text Info */}
      <div className="flex-1 min-w-0">
        <h3 className="text-slate-500 text-[10px] font-medium mb-0.5 truncate uppercase tracking-wider">{title}</h3>
        <div className="flex items-baseline gap-2">
           <span className="text-lg font-bold text-slate-800 leading-none">{value}</span>
           {trend && (
             <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${trend === 'up' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {trend === 'up' ? '↑' : '↓'}
             </span>
           )}
        </div>
        {subValue && <p className="text-[10px] text-slate-400 mt-0.5 truncate">{subValue}</p>}
      </div>
    </div>
  );
}