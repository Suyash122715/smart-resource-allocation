import { useEffect, useState } from 'react';
import { Loader2, Save, Plus, X, Award, Zap, TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../utils/api';
import { VolunteerProfile as IProfile, Badge } from '../../types';
import { SKILLS_OPTIONS, DAYS_OPTIONS, getBadge } from '../../utils/helpers';
import { useAuthStore } from '../../store/authStore';

export default function VolunteerProfile() {
  const { user } = useAuthStore();
  const [profile, setProfile] = useState<IProfile | null>(null);
  const [badge, setBadge] = useState<Badge | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ skills: [] as string[], availability: [] as string[], location: '', bio: '' });
  const [customSkill, setCustomSkill] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get('/api/volunteer/profile');
        setProfile(data.profile);
        setBadge(data.badge);
        setForm({
          skills: data.profile.skills || [],
          availability: data.profile.availability || [],
          location: data.profile.location || '',
          bio: data.profile.bio || '',
        });
      } catch {
        toast.error('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const toggleSkill = (skill: string) => {
    setForm(p => ({
      ...p,
      skills: p.skills.includes(skill) ? p.skills.filter(s => s !== skill) : [...p.skills, skill],
    }));
  };

  const toggleDay = (day: string) => {
    setForm(p => ({
      ...p,
      availability: p.availability.includes(day) ? p.availability.filter(d => d !== day) : [...p.availability, day],
    }));
  };

  const addCustom = () => {
    const s = customSkill.trim();
    if (s && !form.skills.includes(s)) { setForm(p => ({ ...p, skills: [...p.skills, s] })); setCustomSkill(''); }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data } = await api.patch('/api/volunteer/profile', form);
      setProfile(data.profile);
      setBadge(data.badge);
      toast.success('Profile updated!');
    } catch {
      toast.error('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 size={32} className="animate-spin text-brand-500" />
    </div>
  );

  const badgeInfo = profile ? getBadge(profile.socialCredits) : null;

  return (
    <div className="max-w-3xl animate-fade-in">
      <h1 className="font-display text-3xl font-bold text-white mb-8">My Profile</h1>

      {/* Badge card */}
      {profile && badgeInfo && (
        <div className="glass p-6 mb-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-brand-500/8 to-transparent pointer-events-none" />
          <div className="relative flex flex-col sm:flex-row sm:items-center gap-6">
            {/* Avatar + badge */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-brand-500/20 border-2 border-brand-500/30 flex items-center justify-center">
                  <span className="font-display text-3xl font-bold text-brand-400">{user?.name[0]}</span>
                </div>
                <span className="absolute -bottom-1 -right-1 text-2xl">{badgeInfo.emoji}</span>
              </div>
              <div>
                <h2 className="font-display text-xl font-bold text-white">{user?.name}</h2>
                <div className="flex items-center gap-1.5 mt-1">
                  <Award size={14} className="text-brand-400" />
                  <span className="text-brand-400 font-semibold text-sm">{badgeInfo.emoji} {badgeInfo.label}</span>
                </div>
                <p className="text-slate-500 text-xs mt-0.5">{user?.email}</p>
              </div>
            </div>

            {/* Credits + progress */}
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Zap size={14} className="text-accent-400" />
                  <span className="text-white font-semibold font-display text-2xl">{profile.socialCredits}</span>
                  <span className="text-slate-500 text-sm">social credits</span>
                </div>
                {badgeInfo.next && (
                  <span className="text-xs text-slate-500">{badgeInfo.next - profile.socialCredits} to next</span>
                )}
              </div>
              {badgeInfo.next && (
                <div className="score-bar">
                  <div className="score-fill transition-all duration-1000" style={{ width: `${badgeInfo.progress}%` }} />
                </div>
              )}
              <div className="flex gap-3 mt-4">
                {[
                  { emoji: '🌱', label: 'Seedling', credits: 0 },
                  { emoji: '🌿', label: 'Contributor', credits: 300 },
                  { emoji: '⭐', label: 'Champion', credits: 900 },
                  { emoji: '🏆', label: 'Legend', credits: 2100 },
                ].map(b => (
                  <div key={b.label} className={`text-center flex-1 p-2 rounded-xl border transition-all ${profile.socialCredits >= b.credits ? 'bg-brand-500/10 border-brand-500/30' : 'bg-white/3 border-white/5'}`}>
                    <div className="text-lg">{b.emoji}</div>
                    <div className={`text-xs font-semibold ${profile.socialCredits >= b.credits ? 'text-brand-400' : 'text-slate-600'}`}>{b.label}</div>
                    <div className="text-xs text-slate-600">{b.credits}+</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit form */}
      <div className="glass p-6 space-y-6">
        <h2 className="font-display font-semibold text-white flex items-center gap-2">
          <TrendingUp size={18} className="text-brand-400" /> Edit Details
        </h2>

        <div>
          <label className="label">Location</label>
          <input type="text" className="input-field" placeholder="e.g. Koramangala, Bangalore"
            value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value }))} />
        </div>

        <div>
          <label className="label">Bio</label>
          <textarea className="input-field resize-none min-h-20" placeholder="Tell NGOs a bit about yourself..."
            value={form.bio} onChange={e => setForm(p => ({ ...p, bio: e.target.value }))} />
        </div>

        {/* Skills */}
        <div>
          <label className="label">Your Skills</label>
          <div className="flex flex-wrap gap-2 mb-3">
            {SKILLS_OPTIONS.map(skill => (
              <button key={skill} type="button" onClick={() => toggleSkill(skill)}
                className={`badge-pill border text-xs transition-all ${form.skills.includes(skill)
                  ? 'bg-brand-500/20 text-brand-400 border-brand-500/40'
                  : 'bg-white/5 text-slate-400 border-white/10 hover:border-white/20'}`}>
                {skill}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <input className="input-field flex-1" placeholder="Add custom skill"
              value={customSkill} onChange={e => setCustomSkill(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addCustom())} />
            <button type="button" onClick={addCustom} className="btn-secondary px-3"><Plus size={16} /></button>
          </div>
          {form.skills.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {form.skills.map(s => (
                <span key={s} className="badge-pill bg-brand-500/15 text-brand-400 border border-brand-500/25 text-xs">
                  {s}
                  <button onClick={() => setForm(p => ({ ...p, skills: p.skills.filter(x => x !== s) }))} className="ml-1"><X size={10} /></button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Availability */}
        <div>
          <label className="label">Availability</label>
          <div className="flex flex-wrap gap-2">
            {DAYS_OPTIONS.map(day => (
              <button key={day} type="button" onClick={() => toggleDay(day)}
                className={`badge-pill border text-xs transition-all ${form.availability.includes(day)
                  ? 'bg-accent-500/20 text-accent-400 border-accent-500/40'
                  : 'bg-white/5 text-slate-400 border-white/10 hover:border-white/20'}`}>
                {day}
              </button>
            ))}
          </div>
        </div>

        <button onClick={handleSave} disabled={saving} className="btn-primary flex items-center gap-2">
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          {saving ? 'Saving...' : 'Save Profile'}
        </button>
      </div>
    </div>
  );
}
