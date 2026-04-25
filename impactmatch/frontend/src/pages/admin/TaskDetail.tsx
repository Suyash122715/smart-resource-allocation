import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Loader2, Users, CheckCircle2, MapPin, Calendar, Zap, Send, MessageCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../utils/api';
import { getSocket } from '../../utils/socket';
import { Need, MatchResult, Message } from '../../types';
import { urgencyConfig, getBadge, creditsByUrgency, formatTime, timeAgo } from '../../utils/helpers';
import { useAuthStore } from '../../store/authStore';

export default function TaskDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [need, setNeed] = useState<Need | null>(null);
  const [matches, setMatches] = useState<MatchResult[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [msgLoading, setMsgLoading] = useState(true);
  const [fulfilling, setFulfilling] = useState(false);
  const [msgInput, setMsgInput] = useState('');
  const [activeTab, setActiveTab] = useState<'matches' | 'chat'>('matches');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      try {
        const [needRes, matchRes, msgRes] = await Promise.all([
          api.get(`/api/needs/${id}`),
          api.get(`/api/match/${id}`),
          api.get(`/api/messages/${id}`),
        ]);
        setNeed(needRes.data.need);
        setMatches(matchRes.data.matches);
        setMessages(msgRes.data.messages);
      } catch {
        toast.error('Failed to load task');
      } finally {
        setLoading(false);
        setMsgLoading(false);
      }
    };
    load();

    const socket = getSocket();
    socket.emit('join_room', id);
    socket.on('receive_message', (msg: Message) => {
      setMessages(prev => [...prev, msg]);
    });
    return () => {
      socket.emit('leave_room', id);
      socket.off('receive_message');
    };
  }, [id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleFulfill = async () => {
    if (!id) return;
    if (!confirm('Mark this task as fulfilled? Credits will be awarded to all volunteers.')) return;
    setFulfilling(true);
    try {
      const { data } = await api.patch(`/api/needs/${id}/fulfill`);
      setNeed(prev => prev ? { ...prev, status: 'fulfilled' } : prev);
      toast.success(`Task fulfilled! ${data.creditsAwarded} credits awarded to ${data.volunteersRewarded} volunteers.`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to fulfill');
    } finally {
      setFulfilling(false);
    }
  };

  const sendMessage = () => {
    if (!msgInput.trim() || !id) return;
    const socket = getSocket();
    socket.emit('send_message', { taskId: id, content: msgInput.trim() });
    setMsgInput('');
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 size={32} className="animate-spin text-brand-500" />
    </div>
  );
  if (!need) return <div className="text-center text-slate-400 py-20">Task not found.</div>;

  const urg = urgencyConfig[need.urgency];
  const accepted = matches.filter(m => m.isAccepted);

  return (
    <div className="max-w-5xl animate-fade-in">
      <button onClick={() => navigate('/admin')} className="flex items-center gap-1 text-slate-500 hover:text-slate-300 transition-colors mb-6 text-sm">
        <ChevronLeft size={16} /> Back to Dashboard
      </button>

      {/* Task Header */}
      <div className="glass p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className={`badge-pill ${urg.color}`}>{urg.label}</span>
              <span className={`badge-pill capitalize ${need.status === 'fulfilled' ? 'bg-brand-500/15 text-brand-400 border border-brand-500/25' : need.status === 'assigned' ? 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/25' : 'bg-white/5 text-slate-400 border border-white/10'}`}>
                {need.status}
              </span>
              <span className="badge-pill bg-white/5 text-slate-400 border border-white/10">{need.category}</span>
            </div>
            <h1 className="font-display text-2xl font-bold text-white mb-3">{need.title}</h1>
            <p className="text-slate-400 text-sm leading-relaxed mb-4">{need.description}</p>
            <div className="flex flex-wrap gap-4 text-sm text-slate-400">
              <span className="flex items-center gap-1.5"><MapPin size={14} className="text-brand-400" />{need.location}</span>
              {need.schedule && <span className="flex items-center gap-1.5"><Calendar size={14} className="text-brand-400" />{need.schedule}</span>}
            </div>
          </div>
          {need.status !== 'fulfilled' && (
            <button onClick={handleFulfill} disabled={fulfilling} className="btn-primary flex items-center gap-2 flex-shrink-0">
              {fulfilling ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
              Mark Fulfilled
            </button>
          )}
          {need.status === 'fulfilled' && (
            <div className="flex items-center gap-2 text-brand-400 bg-brand-500/10 border border-brand-500/20 rounded-xl px-4 py-2">
              <CheckCircle2 size={16} />
              <span className="font-semibold text-sm">Fulfilled! {creditsByUrgency[need.urgency]} credits awarded</span>
            </div>
          )}
        </div>
        {need.skillsRequired.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-white/5">
            {need.skillsRequired.map(s => (
              <span key={s} className="badge-pill bg-white/5 text-slate-300 border border-white/10 text-xs">{s}</span>
            ))}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white/5 rounded-xl p-1 mb-6 w-fit">
        {(['matches', 'chat'] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all capitalize ${activeTab === tab ? 'bg-brand-500 text-white' : 'text-slate-400 hover:text-white'}`}>
            {tab === 'matches' ? <span className="flex items-center gap-1.5"><Users size={14} />Matched ({matches.length})</span>
              : <span className="flex items-center gap-1.5"><MessageCircle size={14} />Chat ({messages.length})</span>}
          </button>
        ))}
      </div>

      {/* Matches Tab */}
      {activeTab === 'matches' && (
        <div className="space-y-3">
          {matches.length === 0 && (
            <div className="glass p-12 text-center">
              <p className="text-slate-400">No volunteers matched yet. Check back once volunteers create profiles.</p>
            </div>
          )}
          {matches.map((m, i) => {
            const badge = getBadge(m.socialCredits);
            return (
              <div key={m.volunteerId} className={`glass p-5 hover:border-white/15 transition-all animate-slide-up stagger-${Math.min(i + 1, 5)} ${m.isAccepted ? 'border-brand-500/30' : ''}`}>
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="relative">
                      <div className="w-11 h-11 rounded-full bg-brand-500/20 flex items-center justify-center flex-shrink-0">
                        <span className="text-brand-400 font-bold">{m.name[0]}</span>
                      </div>
                      <span className="absolute -bottom-0.5 -right-0.5 text-sm">{badge.emoji}</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white">{m.name}</span>
                        {m.isAccepted && <span className="badge-pill bg-brand-500/15 text-brand-400 border border-brand-500/25 text-xs">✓ Accepted</span>}
                      </div>
                      <div className="text-xs text-slate-500">{m.location} · {badge.emoji} {badge.label} · {m.socialCredits} credits</div>
                    </div>
                  </div>

                  {/* Score */}
                  <div className="flex items-center gap-3">
                    <div className="text-center">
                      <div className="font-display text-2xl font-bold text-gradient">{m.matchScore}%</div>
                      <div className="text-xs text-slate-500">match</div>
                    </div>
                    <div className="space-y-1 w-32">
                      {[
                        { label: 'Skill', val: m.skillScore },
                        { label: 'Location', val: m.locationScore },
                        { label: 'Avail', val: m.availabilityScore },
                      ].map(b => (
                        <div key={b.label} className="flex items-center gap-2">
                          <span className="text-xs text-slate-600 w-12">{b.label}</span>
                          <div className="score-bar flex-1"><div className="score-fill" style={{ width: `${b.val}%` }} /></div>
                          <span className="text-xs text-slate-500 w-6">{b.val}%</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {m.skills.slice(0, 3).map(s => (
                      <span key={s} className={`badge-pill text-xs ${need.skillsRequired.includes(s) ? 'bg-brand-500/15 text-brand-400 border border-brand-500/25' : 'bg-white/5 text-slate-400 border border-white/10'}`}>{s}</span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Chat Tab */}
      {activeTab === 'chat' && (
        <div className="glass overflow-hidden">
          <div className="h-96 overflow-y-auto p-5 space-y-3 scrollbar-thin" id="chat-messages">
            {msgLoading && <div className="flex justify-center py-8"><Loader2 size={20} className="animate-spin text-brand-500" /></div>}
            {!msgLoading && messages.length === 0 && (
              <div className="text-center text-slate-500 py-12">No messages yet. Start the conversation!</div>
            )}
            {messages.map(msg => {
              const isMe = msg.senderId.toString() === user?.id;
              return (
                <div key={msg._id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-slide-up`}>
                  <div className={`max-w-xs lg:max-w-md ${isMe ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                    {!isMe && (
                      <div className="flex items-center gap-1.5 px-1">
                        <div className="w-5 h-5 rounded-full bg-brand-500/20 flex items-center justify-center">
                          <span className="text-brand-400 text-xs font-bold">{msg.senderName[0]}</span>
                        </div>
                        <span className="text-xs text-slate-500">{msg.senderName}</span>
                        <span className="text-xs text-slate-600">{timeAgo(msg.createdAt)}</span>
                      </div>
                    )}
                    <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${isMe
                      ? 'bg-brand-500 text-white rounded-br-md'
                      : 'bg-white/8 text-slate-200 rounded-bl-md border border-white/8'}`}>
                      {msg.content}
                    </div>
                    {isMe && <span className="text-xs text-slate-600 px-1">{timeAgo(msg.createdAt)}</span>}
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
          <div className="border-t border-white/5 p-4 flex gap-3">
            <input
              className="input-field flex-1"
              placeholder="Type a message..."
              value={msgInput}
              onChange={e => setMsgInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), sendMessage())}
            />
            <button onClick={sendMessage} disabled={!msgInput.trim()} className="btn-primary px-4">
              <Send size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
