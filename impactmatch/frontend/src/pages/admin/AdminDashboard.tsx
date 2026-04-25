import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, AlertTriangle, CheckCircle2, Users, Loader2, ChevronRight, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../utils/api';
import { Need, AdminStats } from '../../types';
import { urgencyConfig, formatDate } from '../../utils/helpers';
import { useAuthStore } from '../../store/authStore';

export default function AdminDashboard() {
  const { user } = useAuthStore();
  const [needs, setNeeds] = useState<Need[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [needsRes, statsRes] = await Promise.all([
          api.get('/api/needs'),
          api.get('/api/needs/stats'),
        ]);
        setNeeds(needsRes.data.needs);
        setStats(statsRes.data.stats);
      } catch {
        toast.error('Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 size={32} className="animate-spin text-brand-500" />
    </div>
  );

  const statCards = [
    { label: 'Total Needs', value: stats?.total ?? 0, icon: Clock, color: 'text-slate-400', bg: 'bg-slate-500/10' },
    { label: 'Open Needs', value: stats?.open ?? 0, icon: AlertTriangle, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
    { label: 'Fulfilled', value: stats?.fulfilled ?? 0, icon: CheckCircle2, color: 'text-brand-400', bg: 'bg-brand-500/10' },
    { label: 'Volunteers Helped', value: stats?.volunteersHelped ?? 0, icon: Users, color: 'text-accent-400', bg: 'bg-accent-500/10' },
  ];

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-slate-400 mt-1">Good to see you, {user?.name?.split(' ')[0]} 👋</p>
        </div>
        <Link to="/admin/post-need" className="btn-primary flex items-center gap-2">
          <PlusCircle size={16} />
          Post Need
        </Link>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((s, i) => (
          <div key={i} className={`card animate-slide-up stagger-${i + 1}`}>
            <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center mb-3`}>
              <s.icon size={20} className={s.color} />
            </div>
            <div className="font-display text-3xl font-bold text-white mb-1">{s.value}</div>
            <div className="text-slate-500 text-sm">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Needs list */}
      <div className="glass overflow-hidden">
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-white">Your Needs</h2>
          <Link to="/admin/post-need" className="text-brand-400 hover:text-brand-300 text-sm flex items-center gap-1 font-medium transition-colors">
            Post new <ChevronRight size={14} />
          </Link>
        </div>

        {needs.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-4xl mb-3">📋</div>
            <p className="text-slate-400 mb-4">No needs posted yet.</p>
            <Link to="/admin/post-need" className="btn-primary inline-flex items-center gap-2">
              <PlusCircle size={16} /> Post Your First Need
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {needs.map((need, i) => {
              const urg = urgencyConfig[need.urgency];
              const statusColor = need.status === 'fulfilled' ? 'text-brand-400 bg-brand-500/10' :
                need.status === 'assigned' ? 'text-yellow-400 bg-yellow-500/10' : 'text-slate-400 bg-white/5';
              return (
                <Link
                  key={need._id}
                  to={`/admin/task/${need._id}`}
                  className={`flex items-center gap-4 p-5 hover:bg-white/3 transition-colors group animate-slide-up stagger-${Math.min(i + 1, 5)}`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-white truncate group-hover:text-brand-400 transition-colors">{need.title}</h3>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <span className="flex items-center gap-1"><Clock size={11} />{formatDate(need.createdAt)}</span>
                      <span>{need.location}</span>
                      <span>{need.skillsRequired.slice(0, 2).join(', ')}{need.skillsRequired.length > 2 ? '...' : ''}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`badge-pill ${urg.color}`}>{urg.label}</span>
                    <span className={`badge-pill ${statusColor} capitalize`}>{need.status}</span>
                    <ChevronRight size={16} className="text-slate-600 group-hover:text-slate-400 transition-colors" />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
