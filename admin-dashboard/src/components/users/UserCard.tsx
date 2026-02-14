import { Edit, Trash2, Mail, Phone, Shield, User as UserIcon } from 'lucide-react';
import type { Profile } from '../../types/database';

interface UserCardProps {
  user: Profile;
  onEdit: (user: Profile) => void;
  onDelete: (id: string) => void;
}

export default function UserCard({ user, onEdit, onDelete }: UserCardProps) {
  const isAdmin = user.role === 'admin';
  const isActive = user.status === 'active';

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:shadow-md transition-all duration-300 group relative overflow-hidden flex flex-col">
      {/* Decorative Top Gradient */}
      <div className={`absolute top-0 left-0 w-full h-1.5 ${isAdmin ? 'bg-purple-500' : 'bg-primary'}`}></div>
      
      {/* Header: Status & Actions */}
      <div className="flex justify-between items-start mb-4">
        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide border ${
          isActive 
            ? 'bg-green-50 text-green-600 border-green-100' 
            : 'bg-slate-50 text-slate-500 border-slate-100'
        }`}>
          {isActive ? 'ACTIVE' : 'INACTIVE'}
        </span>
        
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => onEdit(user)} className="p-1.5 text-slate-400 hover:text-amber-500 hover:bg-amber-50 rounded-lg transition-colors">
            <Edit className="w-4 h-4" />
          </button>
          <button onClick={() => onDelete(user.id)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Body: Profile Info */}
      <div className="flex flex-col items-center text-center flex-1">
        {/* Avatar */}
        <div className="relative mb-3">
          <div className={`w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold border-4 border-white shadow-sm ${
            isAdmin ? 'bg-purple-100 text-purple-600' : 'bg-green-100 text-green-600'
          }`}>
            {user.avatar_url ? (
              <img src={user.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
            ) : (
              user.full_name?.charAt(0).toUpperCase() || 'U'
            )}
          </div>
          {/* Role Badge */}
          <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center border-2 border-white shadow-sm ${
             isAdmin ? 'bg-purple-500 text-white' : 'bg-slate-200 text-slate-500'
          }`}>
            {isAdmin ? <Shield className="w-3 h-3" /> : <UserIcon className="w-3 h-3" />}
          </div>
        </div>

        {/* Name & Position */}
        <h3 className="text-base font-bold text-slate-800 truncate w-full px-2">
          {user.full_name || 'ไม่ระบุชื่อ'}
        </h3>
        <p className="text-xs text-primary font-medium mt-1 mb-3 bg-primary/5 px-2 py-0.5 rounded-md">
          {user.position || 'พนักงานทั่วไป'}
        </p>

        {/* Details */}
        <div className="w-full space-y-2 mt-auto pt-3 border-t border-slate-50">
          <div className="flex items-center gap-2 text-xs text-slate-500 justify-center">
            <Mail className="w-3.5 h-3.5" />
            <span className="truncate max-w-[150px]">{user.email}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500 justify-center">
            <Phone className="w-3.5 h-3.5" />
            <span>{user.phone_number || '-'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}