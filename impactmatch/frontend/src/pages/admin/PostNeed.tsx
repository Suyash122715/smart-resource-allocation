import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Loader2, Send, X, Plus, ChevronLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../utils/api';
import { ExtractedNeed } from '../../types';
import { SKILLS_OPTIONS, DAYS_OPTIONS, CATEGORY_OPTIONS } from '../../utils/helpers';

const defaultForm: ExtractedNeed & { description: string } = {
  title: '', category: '', skillsRequired: [], urgency: 'medium',
  location: '', schedule: '', scheduleDays: [], description: '',
};

export default function PostNeed() {
  const navigate = useNavigate();
  const [aiText, setAiText] = useState('');
  const [extracting, setExtracting] = useState(false);
  const [form, setForm] = useState(defaultForm);
  const [submitting, setSubmitting] = useState(false);
  const [skillInput, setSkillInput] = useState('');
  const [extracted, setExtracted] = useState(false);

  const handleExtract = async () => {
    if (!aiText.trim()) { toast.error('Please enter a description first'); return; }
    setExtracting(true);
    try {
      const { data } = await api.post('/api/needs/extract', { text: aiText });
      setForm(prev => ({ ...prev, ...data.extracted, description: aiText }));
      setExtracted(true);
      toast.success('AI extracted need data! Review and edit below.');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'AI extraction failed');
    } finally {
      setExtracting(false);
    }
  };

  const toggleSkill = (skill: string) => {
    setForm(p => ({
      ...p,
      skillsRequired: p.skillsRequired.includes(skill)
        ? p.skillsRequired.filter(s => s !== skill)
        : [...p.skillsRequired, skill],
    }));
  };

  const toggleDay = (day: string) => {
    setForm(p => ({
      ...p,
      scheduleDays: p.scheduleDays.includes(day)
        ? p.scheduleDays.filter(d => d !== day)
        : [...p.scheduleDays, day],
    }));
  };

  const addCustomSkill = () => {
    const s = skillInput.trim();
    if (s && !form.skillsRequired.includes(s)) {
      setForm(p => ({ ...p, skillsRequired: [...p.skillsRequired, s] }));
      setSkillInput('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.location || !form.category) {
      toast.error('Please fill in all required fields');
      return;
    }
    setSubmitting(true);
    try {
      await api.post('/api/needs', form);
      toast.success('Need published successfully!');
      navigate('/admin');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to publish');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl animate-fade-in">
      {/* Header */}
      <button onClick={() => navigate('/admin')} className="flex items-center gap-1 text-slate-500 hover:text-slate-300 transition-colors mb-6 text-sm">
        <ChevronLeft size={16} /> Back to Dashboard
      </button>
      <h1 className="font-display text-3xl font-bold text-white mb-2">Post a New Need</h1>
      <p className="text-slate-400 mb-8">Describe your need and let AI extract the details, or fill in manually.</p>

      {/* AI Input */}
      <div className="glass p-6 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles size={18} className="text-brand-400" />
          <h2 className="font-display font-semibold text-white">AI Extraction</h2>
          <span className="badge-pill bg-brand-500/15 text-brand-400 border border-brand-500/25 ml-1">Powered by Gemini</span>
        </div>
        <p className="text-slate-400 text-sm mb-4">Describe your need in plain English and let AI structure it for you.</p>
        <textarea
          className="input-field min-h-28 resize-none mb-4"
          placeholder='e.g. "We need 5 volunteers this Saturday in Bangalore for flood relief. Need drivers and first aid trained people. Very urgent."'
          value={aiText}
          onChange={e => setAiText(e.target.value)}
        />
        <button
          onClick={handleExtract}
          disabled={extracting || !aiText.trim()}
          className="btn-primary flex items-center gap-2"
        >
          {extracting ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
          {extracting ? 'Extracting...' : 'Extract with AI'}
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="glass p-6 space-y-6">
        <div className="flex items-center gap-2 mb-2">
          <h2 className="font-display font-semibold text-white">Need Details</h2>
          {extracted && <span className="badge-pill bg-green-500/15 text-green-400 border border-green-500/25 text-xs">✓ AI Filled</span>}
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          <div className="md:col-span-2">
            <label className="label">Title *</label>
            <input type="text" className="input-field" placeholder="Short, clear title" value={form.title}
              onChange={e => setForm(p => ({ ...p, title: e.target.value }))} required />
          </div>

          <div className="md:col-span-2">
            <label className="label">Description</label>
            <textarea className="input-field min-h-20 resize-none" placeholder="Full description"
              value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
          </div>

          <div>
            <label className="label">Category *</label>
            <select className="input-field" value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} required>
              <option value="">Select category</option>
              {CATEGORY_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div>
            <label className="label">Urgency *</label>
            <select className="input-field" value={form.urgency} onChange={e => setForm(p => ({ ...p, urgency: e.target.value as any }))}>
              <option value="critical">🔴 Critical</option>
              <option value="high">🟠 High</option>
              <option value="medium">🟡 Medium</option>
              <option value="low">🟢 Low</option>
            </select>
          </div>

          <div>
            <label className="label">Location *</label>
            <input type="text" className="input-field" placeholder="e.g. Koramangala, Bangalore" value={form.location}
              onChange={e => setForm(p => ({ ...p, location: e.target.value }))} required />
          </div>

          <div>
            <label className="label">Schedule</label>
            <input type="text" className="input-field" placeholder="e.g. This Saturday 9am-2pm" value={form.schedule}
              onChange={e => setForm(p => ({ ...p, schedule: e.target.value }))} />
          </div>
        </div>

        {/* Skills */}
        <div>
          <label className="label">Skills Required</label>
          <div className="flex flex-wrap gap-2 mb-3">
            {SKILLS_OPTIONS.map(skill => (
              <button key={skill} type="button" onClick={() => toggleSkill(skill)}
                className={`badge-pill border text-xs transition-all ${form.skillsRequired.includes(skill)
                  ? 'bg-brand-500/20 text-brand-400 border-brand-500/40'
                  : 'bg-white/5 text-slate-400 border-white/10 hover:border-white/20'}`}>
                {form.skillsRequired.includes(skill) && <X size={10} />}
                {skill}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <input className="input-field flex-1" placeholder="Add custom skill" value={skillInput}
              onChange={e => setSkillInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addCustomSkill())} />
            <button type="button" onClick={addCustomSkill} className="btn-secondary px-3 py-2">
              <Plus size={16} />
            </button>
          </div>
          {form.skillsRequired.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {form.skillsRequired.map(s => (
                <span key={s} className="badge-pill bg-brand-500/15 text-brand-400 border border-brand-500/25 text-xs">
                  {s}
                  <button type="button" onClick={() => setForm(p => ({ ...p, skillsRequired: p.skillsRequired.filter(x => x !== s) }))}
                    className="ml-1 hover:text-white"><X size={10} /></button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Days */}
        <div>
          <label className="label">Schedule Days</label>
          <div className="flex flex-wrap gap-2">
            {DAYS_OPTIONS.map(day => (
              <button key={day} type="button" onClick={() => toggleDay(day)}
                className={`badge-pill border text-xs transition-all ${form.scheduleDays.includes(day)
                  ? 'bg-accent-500/20 text-accent-400 border-accent-500/40'
                  : 'bg-white/5 text-slate-400 border-white/10 hover:border-white/20'}`}>
                {day}
              </button>
            ))}
          </div>
        </div>

        <button type="submit" disabled={submitting} className="btn-primary w-full flex items-center justify-center gap-2">
          {submitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
          {submitting ? 'Publishing...' : 'Publish Need'}
        </button>
      </form>
    </div>
  );
}
