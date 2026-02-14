import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import Swal from 'sweetalert2';
import { Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulator delay นิดหน่อยให้เห็น loading state สวยๆ (ลบออกได้ตอนใช้จริง)
    await new Promise(resolve => setTimeout(resolve, 800));

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      Swal.fire({
        title: 'Access Denied',
        text: error.message,
        icon: 'error',
        confirmButtonColor: '#2E7D32',
        background: '#fff',
        customClass: {
            popup: 'rounded-2xl'
        }
      });
    } else {
      const Toast = Swal.mixin({
        toast: true, position: 'top', showConfirmButton: false, timer: 3000,
        background: '#2E7D32', color: '#fff', iconColor: '#fff',
        customClass: { popup: 'rounded-xl font-medium shadow-lg' }
      });
      Toast.fire({ icon: 'success', title: 'Welcome back to DoiNgam RPH' });
      navigate('/');
    }
    setLoading(false);
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-slate-900">
      {/* --- Background Elements (ลูกเล่นพื้นหลัง) --- */}
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-dark via-[#0f3d1e] to-slate-900 opacity-90"></div>
      
      {/* Subtle Abstract Pattern (ลายเส้นภูเขา/แผนที่จางๆ) */}
      <div className="absolute inset-0 opacity-[0.03]" 
           style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }}>
      </div>

      {/* Glowing Orbs (แสงฟุ้งๆ เพิ่มมิติ) */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-primary-light/20 rounded-full blur-3xl mix-blend-overlay animate-pulse duration-[10s]"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-accent-brass/10 rounded-full blur-3xl mix-blend-overlay animate-pulse duration-[12s] delay-1000"></div>


      {/* --- Main Login Card (Glassmorphism) --- */}
      <div className="relative w-full max-w-[440px] p-10 mx-4 animate-fade-in-up">
        {/* Glass Effect Container */}
        <div className="absolute inset-0 bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl shadow-primary-dark/30"></div>

        <div className="relative z-10 flex flex-col items-center text-center">
          {/* Logo Section */}
          <div className="mb-6 p-3 bg-white/10 rounded-2xl border border-white/10 shadow-inner backdrop-blur-sm">
             {/* ตรวจสอบว่ามีไฟล์ public/logo.png อยู่จริง */}
            <img src="../src/assets/logo.jpg" alt="Doi Ngam RPH Logo" className="h-20 w-auto object-contain drop-shadow-md bg-white/50 rounded-full" />
          </div>
          
          <h1 className="text-3xl font-bold text-white tracking-tight">
            Doi Ngam <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-light to-accent-brass">RPH</span>
          </h1>
          <p className="mt-3 text-sm text-white/70 font-medium">
            Smart Administrative Portal 2026
          </p>

          {/* Form Section */}
          <form onSubmit={handleLogin} className="w-full mt-10 space-y-5">
            {/* Email Input */}
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-accent-brass text-white/50">
                <Mail className="h-5 w-5" />
              </div>
              <input
                type="email"
                required
                className="block w-full pl-11 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-accent-brass/50 focus:border-accent-brass/50 transition-all shadow-sm"
                placeholder="Official Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {/* Password Input */}
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-accent-brass text-white/50">
                <Lock className="h-5 w-5" />
              </div>
              <input
                type="password"
                required
                className="block w-full pl-11 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-accent-brass/50 focus:border-accent-brass/50 transition-all shadow-sm"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center text-white/80 cursor-pointer hover:text-white transition-colors">
                <input type="checkbox" className="w-4 h-4 rounded border-white/30 text-primary focus:ring-offset-0 focus:ring-accent-brass bg-white/10" />
                <span className="ml-2 font-medium">Remember me</span>
              </label>
              <a href="#" className="font-medium text-accent-brass hover:text-accent-brass/80 transition-colors">
                Forgot password?
              </a>
            </div>

            {/* Submit Button (Gradient & Glow) */}
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-xl text-white font-bold text-[15px] overflow-hidden transition-all disabled:opacity-70"
            >
              {/* Button Gradient Background */}
              <div className="absolute inset-0 bg-gradient-to-r from-primary to-primary-dark transition-transform group-hover:scale-105"></div>
              {/* Subtle Shine Effect on Hover */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-20 bg-gradient-to-r from-transparent via-white to-transparent -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-all duration-700"></div>
              
              <span className="relative z-10 flex items-center">
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin text-white/80" />
                    Authorizing...
                  </>
                ) : (
                  <>
                    Sign In 
                    <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </span>
            </button>
          </form>
        </div>
      </div>
       
       {/* Footer Credit */}
      <div className="absolute bottom-6 text-white/40 text-xs font-medium tracking-wider">
        © 2026 Doi Ngam  Project Hospital. &  Techanut Tatip .
      </div>
    </div>
  );
}