import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, User, LogOut, Handshake, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { disconnectSocket } from '../../utils/socket';
import toast from 'react-hot-toast';

const navItems = [
  { to: '/volunteer', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/volunteer/profile', label: 'My Profile', icon: User, end: false },
];

export default function VolunteerLayout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    disconnectSocket();
    logout();
    toast.success('Logged out');
    navigate('/');
  };

  const Sidebar = () => (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-accent-500 flex items-center justify-center flex-shrink-0">
            <Handshake size={18} className="text-white" />
          </div>
          <div>
            <div className="font-display font-bold text-white text-sm">ImpactMatch</div>
            <div className="text-slate-500 text-xs">Volunteer Portal</div>
          </div>
        </div>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map(item => (
          <NavLink key={item.to} to={item.to} end={item.end} onClick={() => setMobileOpen(false)}
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <item.icon size={18} />
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="p-4 border-t border-white/5">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-full bg-accent-500/20 flex items-center justify-center flex-shrink-0">
            <span className="text-accent-400 font-bold text-sm">{user?.name[0]}</span>
          </div>
          <div className="min-w-0">
            <div className="text-white text-sm font-semibold truncate">{user?.name}</div>
            <div className="text-slate-500 text-xs">Volunteer</div>
          </div>
        </div>
        <button onClick={handleLogout} className="w-full sidebar-link text-red-400 hover:text-red-300 hover:bg-red-500/8">
          <LogOut size={16} />Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-surface-900 flex">
      <aside className="hidden lg:flex flex-col w-64 bg-surface-800/60 border-r border-white/5 backdrop-blur-xl fixed h-full z-30">
        <Sidebar />
      </aside>
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <aside className="relative w-72 h-full bg-surface-800 border-r border-white/10 flex flex-col">
            <button onClick={() => setMobileOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white"><X size={20} /></button>
            <Sidebar />
          </aside>
        </div>
      )}
      <main className="flex-1 lg:ml-64 min-h-screen">
        <div className="lg:hidden sticky top-0 z-20 bg-surface-900/80 backdrop-blur-xl border-b border-white/5 px-4 h-14 flex items-center justify-between">
          <button onClick={() => setMobileOpen(true)} className="text-slate-400 hover:text-white"><Menu size={22} /></button>
          <span className="font-display font-bold text-white">ImpactMatch</span>
          <div className="w-8 h-8 rounded-full bg-accent-500/20 flex items-center justify-center">
            <span className="text-accent-400 font-bold text-xs">{user?.name[0]}</span>
          </div>
        </div>
        <div className="p-6 lg:p-8 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
