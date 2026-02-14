import { useState, useEffect } from 'react';
import { X, Save, User, Mail, Phone, Briefcase, Shield, Lock } from 'lucide-react';
import { supabase } from '../../lib/supabase'; // Client หลัก (Admin)
import { createClient } from '@supabase/supabase-js'; // เพิ่ม import นี้
import  type { Profile } from '../../types/database';
import ImageUpload from '../common/ImageUpload';
import Swal from 'sweetalert2';

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  userToEdit?: Profile | null;
}

export default function UserModal({ isOpen, onClose, onSuccess, userToEdit }: UserModalProps) {
  const [formData, setFormData] = useState({
    email: '',
    full_name: '',
    phone_number: '',
    position: '',
    role: 'staff',
    status: 'active',
    password: '',
    avatar_url: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (userToEdit) {
        setFormData({
          email: userToEdit.email || '',
          full_name: userToEdit.full_name || '',
          phone_number: userToEdit.phone_number || '',
          position: userToEdit.position || '',
          role: userToEdit.role || 'staff',
          status: userToEdit.status || 'active',
          password: '',
          avatar_url: userToEdit.avatar_url || ''
        });
      } else {
        setFormData({
          email: '', full_name: '', phone_number: '', position: '',
          role: 'staff', status: 'active', password: '', avatar_url: ''
        });
      }
    }
  }, [isOpen, userToEdit]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (userToEdit) {
        // --- กรณีแก้ไข (Update) ---
        const { error } = await supabase
          .from('profiles')
          .update({
            full_name: formData.full_name,
            phone_number: formData.phone_number,
            position: formData.position,
            role: formData.role as any,
            status: formData.status as any,
            avatar_url: formData.avatar_url
          })
          .eq('id', userToEdit.id);

        if (error) throw error;
        Swal.fire({ icon: 'success', title: 'อัปเดตข้อมูลสำเร็จ', timer: 1500, showConfirmButton: false });

      } else {
        // --- กรณีเพิ่มใหม่ (Create Real User) ---
        if (!formData.password || formData.password.length < 6) {
           throw new Error('กรุณากำหนดรหัสผ่านอย่างน้อย 6 ตัวอักษร');
        }

        // 1. สร้าง Temp Client เพื่อ SignUp แทน User (โดยไม่ทำให้ Admin หลุด)
        const tempSupabase = createClient(
          import.meta.env.VITE_SUPABASE_URL,
          import.meta.env.VITE_SUPABASE_ANON_KEY,
          { auth: { persistSession: false } } // สำคัญมาก! ไม่จำ Session
        );

        // 2. สมัครสมาชิก
        const { data: authData, error: authError } = await tempSupabase.auth.signUp({
          email: formData.email,
          password: formData.password,
        });

        if (authError) throw authError;
        if (!authData.user) throw new Error('ไม่สามารถสร้างผู้ใช้งานได้');

        // 3. บันทึกข้อมูล Profile ลงฐานข้อมูล (ใช้ Client หลักที่เป็น Admin)
        const { error: profileError } = await supabase.from('profiles').insert([{
            id: authData.user.id, // ใช้ ID จริงจาก Auth
            email: formData.email,
            full_name: formData.full_name,
            phone_number: formData.phone_number,
            position: formData.position,
            role: formData.role as any,
            status: 'active',
            avatar_url: formData.avatar_url
        }]);

        if (profileError) {
           // ถ้า insert profile พลาด ควรลบ user ทิ้ง (แต่ในที่นี้แจ้งเตือนไปก่อน)
           console.error('Profile Error:', profileError);
           throw new Error('สร้างบัญชีสำเร็จ แต่บันทึกประวัติล้มเหลว: ' + profileError.message);
        }

        Swal.fire({ 
            icon: 'success', 
            title: 'เพิ่มผู้ใช้งานเรียบร้อย', 
            text: `บัญชี ${formData.email} สามารถเข้าสู่ระบบได้ทันที`,
            confirmButtonText: 'ตกลง'
        });
      }

      onSuccess();
      onClose();
    } catch (error: any) {
      Swal.fire('Error', error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-opacity">
      <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between relative bg-white">
          <button onClick={onClose} className="absolute right-6 p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400">
            <X className="w-5 h-5" />
          </button>
          <div className="w-full text-center">
            <h3 className="text-xl font-bold text-slate-800 flex items-center justify-center gap-2">
              <span className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <User className="w-5 h-5" />
              </span>
              {userToEdit ? 'แก้ไขข้อมูลผู้ใช้งาน' : 'เพิ่มพนักงานใหม่'}
            </h3>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 overflow-y-auto custom-scrollbar bg-slate-50/50">
          <form id="user-form" onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-6">
            
            {/* Left: Avatar */}
            <div className="md:col-span-4 flex flex-col items-center space-y-4">
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm w-full flex flex-col items-center">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">รูปโปรไฟล์</label>
                <ImageUpload 
                  folder="avatars"
                  id={userToEdit?.id || 'new-user-temp'}
                  currentImageUrl={formData.avatar_url}
                  onUpload={(url) => setFormData({ ...formData, avatar_url: url })}
                />
              </div>

              {/* Password Field (แสดงเฉพาะตอนเพิ่มใหม่) */}
              {!userToEdit && (
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 w-full">
                    <div className="flex items-start gap-2">
                        <Lock className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                        <div>
                            <p className="text-xs font-bold text-blue-700 mb-1">กำหนดรหัสผ่าน <span className="text-red-500">*</span></p>
                            <input 
                                required
                                type="text" 
                                placeholder="เช่น 123456"
                                className="w-full px-3 py-1.5 bg-white border border-blue-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500/20"
                                value={formData.password}
                                onChange={e => setFormData({...formData, password: e.target.value})}
                            />
                            <p className="text-[10px] text-blue-500 mt-1">ผู้ใช้สามารถนำไปล็อกอินได้ทันที</p>
                        </div>
                    </div>
                </div>
              )}
            </div>

            {/* Right: Form Info */}
            <div className="md:col-span-8 space-y-4">
               {/* Personal Info */}
               <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                  <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2">
                      <Briefcase className="w-4 h-4 text-slate-400" /> ข้อมูลส่วนตัว
                  </h4>
                  
                  <div>
                    <label className="text-xs font-semibold text-slate-500 mb-1.5 block">ชื่อ-นามสกุล <span className="text-red-500">*</span></label>
                    <input required type="text" placeholder="เช่น สมชาย ใจดี"
                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                        value={formData.full_name}
                        onChange={e => setFormData({...formData, full_name: e.target.value})}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label className="text-xs font-semibold text-slate-500 mb-1.5 block">ตำแหน่ง</label>
                        <input type="text" placeholder="เช่น พนักงานขับรถ"
                            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none"
                            value={formData.position}
                            onChange={e => setFormData({...formData, position: e.target.value})}
                        />
                     </div>
                     <div>
                        <label className="text-xs font-semibold text-slate-500 mb-1.5 block">เบอร์โทรศัพท์</label>
                        <div className="relative">
                            <Phone className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                            <input type="tel" placeholder="08x-xxx-xxxx"
                                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none"
                                value={formData.phone_number}
                                onChange={e => setFormData({...formData, phone_number: e.target.value})}
                            />
                        </div>
                     </div>
                  </div>
               </div>

               {/* Access Info */}
               <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                  <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2">
                      <Shield className="w-4 h-4 text-slate-400" /> บัญชีและสิทธิ์
                  </h4>

                  <div>
                    <label className="text-xs font-semibold text-slate-500 mb-1.5 block">อีเมล (Login) <span className="text-red-500">*</span></label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                        <input required type="email" placeholder="example@doi-ngam.com"
                            className={`w-full pl-10 pr-4 py-2 border rounded-xl outline-none ${userToEdit ? 'bg-slate-100 text-slate-500 border-slate-200 cursor-not-allowed' : 'bg-slate-50 border-slate-200 focus:ring-2 focus:ring-primary/20'}`}
                            value={formData.email}
                            onChange={e => setFormData({...formData, email: e.target.value})}
                            readOnly={!!userToEdit}
                        />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label className="text-xs font-semibold text-slate-500 mb-1.5 block">สิทธิ์ (Role)</label>
                        <select 
                            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none cursor-pointer"
                            value={formData.role}
                            onChange={e => setFormData({...formData, role: e.target.value})}
                        >
                            <option value="staff">👤 พนักงาน (Staff)</option>
                            <option value="admin">🛡️ ผู้ดูแลระบบ (Admin)</option>
                        </select>
                     </div>
                     {userToEdit && (
                         <div>
                            <label className="text-xs font-semibold text-slate-500 mb-1.5 block">สถานะ</label>
                            <select 
                                className="w-full px-4 py-2 border rounded-xl outline-none cursor-pointer"
                                value={formData.status}
                                onChange={e => setFormData({...formData, status: e.target.value})}
                            >
                                <option value="active">✅ ใช้งานปกติ</option>
                                <option value="inactive">⛔ ระงับการใช้งาน</option>
                            </select>
                         </div>
                     )}
                  </div>
               </div>
            </div>

          </form>
        </div>

        {/* Footer */}
        <div className="px-8 py-5 border-t border-slate-100 bg-white flex justify-end gap-3">
          <button onClick={onClose} type="button" className="px-6 py-2.5 text-slate-500 font-bold hover:bg-slate-50 rounded-xl transition-colors text-sm">
            ยกเลิก
          </button>
          <button 
            type="submit" 
            form="user-form"
            disabled={loading}
            className="flex items-center gap-2 px-8 py-2.5 bg-primary hover:bg-primary-hover text-white font-bold rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-95 text-sm"
          >
            <Save className="w-4 h-4" />
            {loading ? 'บันทึก...' : 'สร้างบัญชี'}
          </button>
        </div>

      </div>
    </div>
  );
}