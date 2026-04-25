import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, MapPin, Calendar, ChevronRight, Filter, CheckCircle2, Clock, Zap } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../utils/api';
import { Need } from '../../types';
import { urgencyConfig, SKILLS_OPTIONS } from '../../utils/helpers';
import { useAuthStore } from '../../store/authStore';

interface MatchedNeed { need: Need; matchPercent: number; isAccepted: boolean; }

export default function VolunteerDashboard() {
  const { user } = useAuthStore();
  const [matchedNeeds, setMatchedNeeds] = useState<MatchedNeed[]>([]);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState<string | null>(null);
  const [filterSkill, setFilterSkill] = useState('');
  const [filterUrgency, setFilterUrgency] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const load = async () => {
    try {
      const { data } = await api.get('/api/volunteer/matched-needs');
      setMatchedNeeds(data.needs);
    } catch {
      toast.error('Failed to load needs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleAccept = async (needId: string) => {
    setAccepting(needId);
    try {
      await api.post('/api/assignments/accept', { needId });
      toast.success('Task accepted! Join the chat to coordinate.');
      setMatchedNeeds(prev => prev.map(mn =>
        mn.need._id === needId ? { ...mn, isAccepted: true } : mn
      ));
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to accept task');
    } finally {
      setAccepting(null);
    }
  };

  const filtered = matchedNeeds.filter(mn => {
    if (filterSkill && !mn.need.skillsRequired.some(s => s.toLowerCase().includes(filterSkill.toLowerCase()))) return false;
    if (filterUrgency && mn.need.urgency !== filterUrgency) return false;
    return true;
  });

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 size={32} className="animate-spin text-brand-500" />
    </div>
  );

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-white">Matched Needs</h1>
          <p className="text-slate-400 mt-1">Opportunities ranked by your match score, {user?.name?.split(' ')[0]} 👋</p>
        </div>
        <button
          onClick={() => setShowFilters(p => !p)}
          className={`btn-secondary flex items-center gap-2 text-sm ${showFilters ? 'border-brand-500/40 text-brand-400' : ''}`}
        >
          <Filter size={15} /> Filters
        </button>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="glass p-5 mb-6 animate-slide-up grid sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Filter by Skill</label>
            <select className="input-field" value={filterSkill} onChange={e => setFilterSkill(e.target.value)}>
              <option value="">All Skills</option>
              {SKILLS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Filter by Urgency</label>
            <select className="input-field" value={filterUrgency} onChange={e => setFilterUrgency(e.target.value)}>
              <option value="">All Urgency</option>
              <option value="critical">🔴 Critical</option>
              <option value="high">🟠 High</option>
              <option value="medium">🟡 Medium</option>
              <option value="low">🟢 Low</option>
            </select>
          </div>
        </div>
      )}

      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Available Tasks', value: matchedNeeds.length, icon: Clock, color: 'text-slate-400' },
          { label: 'Accepted', value: matchedNeeds.filter(m => m.isAccepted).length, icon: CheckCircle2, color: 'text-brand-400' },
          { label: 'High Match', value: matchedNeeds.filter(m => m.matchPercent >= 60).length, icon: Zap, color: 'text-accent-400' },
        ].map((s, i) => (
          <div key={i} className="glass p-4 text-center">
            <s.icon size={18} className={`${s.color} mx-auto mb-1`} />
            <div className="font-display text-2xl font-bold text-white">{s.value}</div>
            <div className="text-slate-500 text-xs">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Need cards */}
      {filtered.length === 0 ? (
        <div className="glass p-16 text-center">
          <div className="text-4xl mb-3">🔍</div>
          <p className="text-slate-400 mb-2">No matching tasks found.</p>
          <p className="text-slate-600 text-sm">Update your profile skills to improve matching.</p>
          <Link to="/volunteer/profile" className="btn-primary inline-flex items-center gap-2 mt-4">Update Profile</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((mn, i) => {
            const { need, matchPercent, isAccepted } = mn;
            const urg = urgencyConfig[need.urgency];
            const orgName = typeof need.orgId === 'object' ? need.orgId.name : 'NGO';

            return (
              <div key={need._id} className={`glass p-5 hover:border-white/15 transition-all duration-200 animate-slide-up stagger-${Math.min(i + 1, 5)} ${isAccepted ? 'border-brand-500/25' : ''}`}>
                <div className="flex flex-col md:flex-row md:items-center gap-5">
                  {/* Match score circle */}
                  <div className="flex-shrink-0 text-center">
                    <div className="relative w-16 h-16 mx-auto md:mx-0">
                      <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
                        <circle cx="32" cy="32" r="26" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6" />
                        <circle cx="32" cy="32" r="26" fill="none" stroke={matchPercent >= 60 ? '#14b8a6' : matchPercent >= 30 ? '#f97316' : '#64748b'}
                          strokeWidth="6" strokeLinecap="round"
                          strokeDasharray={`${(matchPercent / 100) * 163.4} 163.4`} />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="font-display font-bold text-sm text-white">{matchPercent}%</span>
                      </div>
                    </div>
                    <div className="text-xs text-slate-500 mt-1">match</div>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <span className={`badge-pill ${urg.color}`}>{urg.label}</span>
                      {isAccepted && <span className="badge-pill bg-brand-500/15 text-brand-400 border border-brand-500/25">✓ Accepted</span>}
                      <span className="text-xs text-slate-500">{orgName}</span>
                    </div>
                    <h3 className="font-display font-semibold text-white text-lg mb-1 truncate">{need.title}</h3>
                    <p className="text-slate-400 text-sm mb-3 line-clamp-2">{need.description}</p>
                    <div className="flex flex-wrap gap-3 text-xs text-slate-500">
                      <span className="flex items-center gap-1"><MapPin size={11} className="text-brand-400" />{need.location}</span>
                      {need.schedule && <span className="flex items-center gap-1"><Calendar size={11} className="text-brand-400" />{need.schedule}</span>}
                    </div>
                    {need.skillsRequired.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {need.skillsRequired.map(s => (
                          <span key={s} className="badge-pill bg-white/5 text-slate-400 border border-white/10 text-xs">{s}</span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 flex-shrink-0">
                    {!isAccepted ? (
                      <button
                        onClick={() => handleAccept(need._id)}
                        disabled={accepting === need._id}
                        className="btn-primary text-sm py-2 px-4 flex items-center gap-1.5"
                      >
                        {accepting === need._id ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                        Accept Task
                      </button>
                    ) : (
                      <Link to={`/volunteer/task/${need._id}`} className="btn-primary text-sm py-2 px-4 flex items-center gap-1.5">
                        Open Chat <ChevronRight size={14} />
                      </Link>
                    )}
                    <Link to={`/volunteer/task/${need._id}`} className="btn-secondary text-sm py-2 px-4 text-center flex items-center justify-center gap-1">
                      View Details <ChevronRight size={14} />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
