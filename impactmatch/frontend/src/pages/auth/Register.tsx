import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff, ArrowRight, Loader2, Building2, User } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../utils/api';
import { useAuthStore } from '../../store/authStore';

export default function Register() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { login } = useAuthStore();
  const [role, setRole] = useState<'admin' | 'volunteer'>((params.get('role') as any) || 'volunteer');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', organizationName: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/api/auth/register', { ...form, role });
      login(data.user, data.token);
      toast.success(`Welcome to Aultrix, ${data.user.name}!`);
      navigate(role === 'admin' ? '/admin' : '/volunteer');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-900 bg-mesh-gradient flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md animate-slide-up">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-9 h-9 rounded-xl bg-brand-500 flex items-center justify-center">
              <span className="text-white font-bold font-display">AX</span>
            </div>
            <span className="font-display font-bold text-xl text-white">Aultrix</span>
          </Link>
          <h1 className="font-display text-3xl font-bold text-white mb-2">Create your account</h1>
          <p className="text-slate-400">Join the impact movement</p>
        </div>

        <div className="glass p-8">
          {/* Role selector */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <button
              type="button"
              onClick={() => setRole('volunteer')}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all duration-200 ${
                role === 'volunteer'
                  ? 'bg-brand-500/15 border-brand-500/40 text-brand-400'
                  : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/8'
              }`}
            >
              <User size={20} />
              <span className="text-sm font-semibold font-display">Volunteer</span>
              <span className="text-xs opacity-70">Help communities</span>
            </button>
            <button
              type="button"
              onClick={() => setRole('admin')}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all duration-200 ${
                role === 'admin'
                  ? 'bg-brand-500/15 border-brand-500/40 text-brand-400'
                  : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/8'
              }`}
            >
              <Building2 size={20} />
              <span className="text-sm font-semibold font-display">NGO Admin</span>
              <span className="text-xs opacity-70">Post needs</span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Full Name</label>
              <input type="text" className="input-field" placeholder="Your name" value={form.name}
                onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required />
            </div>

            {role === 'admin' && (
              <div>
                <label className="label">Organization Name</label>
                <input type="text" className="input-field" placeholder="Your NGO's name" value={form.organizationName}
                  onChange={e => setForm(p => ({ ...p, organizationName: e.target.value }))} required />
              </div>
            )}

            <div>
              <label className="label">Email</label>
              <input type="email" className="input-field" placeholder="you@example.com" value={form.email}
                onChange={e => setForm(p => ({ ...p, email: e.target.value }))} required />
            </div>

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input type={showPass ? 'text' : 'password'} className="input-field pr-10"
                  placeholder="Min 6 characters" value={form.password}
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))} required minLength={6} />
                <button type="button" onClick={() => setShowPass(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 mt-2">
              {loading ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={16} />}
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-slate-500 text-sm mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-brand-400 hover:text-brand-300 font-semibold transition-colors">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
