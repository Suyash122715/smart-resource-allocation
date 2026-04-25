import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ChevronLeft, Loader2, Send, MapPin, Calendar, CheckCircle2, MessageCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../utils/api';
import { getSocket } from '../../utils/socket';
import { Need, Message } from '../../types';
import { urgencyConfig, timeAgo } from '../../utils/helpers';
import { useAuthStore } from '../../store/authStore';

export default function VolunteerTask() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [need, setNeed] = useState<Need | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [msgInput, setMsgInput] = useState('');
  const [accepting, setAccepting] = useState(false);
  const [isAccepted, setIsAccepted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      try {
        const needRes = await api.get(`/api/needs/${id}`);
        setNeed(needRes.data.need);

        // Check if already accepted
        const assignmentsRes = await api.get('/api/assignments/mine');
        const accepted = assignmentsRes.data.assignments.some((a: any) => a.needId?._id === id);
        setIsAccepted(accepted);

        if (accepted) {
          const msgRes = await api.get(`/api/messages/${id}`);
          setMessages(msgRes.data.messages);
        }
      } catch (err: any) {
        if (err.response?.status !== 403) toast.error('Failed to load task');
      } finally {
        setLoading(false);
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

  const handleAccept = async () => {
    if (!id) return;
    setAccepting(true);
    try {
      await api.post('/api/assignments/accept', { needId: id });
      setIsAccepted(true);
      const msgRes = await api.get(`/api/messages/${id}`);
      setMessages(msgRes.data.messages);
      toast.success('Task accepted! You can now chat with the NGO.');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to accept');
    } finally {
      setAccepting(false);
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
  const orgName = typeof need.orgId === 'object' ? need.orgId.name : 'NGO';

  return (
    <div className="max-w-3xl animate-fade-in">
      <button onClick={() => navigate('/volunteer')} className="flex items-center gap-1 text-slate-500 hover:text-slate-300 transition-colors mb-6 text-sm">
        <ChevronLeft size={16} /> Back to Dashboard
      </button>

      {/* Task card */}
      <div className="glass p-6 mb-6">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className={`badge-pill ${urg.color}`}>{urg.label}</span>
          <span className={`badge-pill capitalize ${need.status === 'fulfilled' ? 'bg-brand-500/15 text-brand-400 border border-brand-500/25' : 'bg-white/5 text-slate-400 border border-white/10'}`}>
            {need.status}
          </span>
          <span className="text-xs text-slate-500">{orgName}</span>
        </div>
        <h1 className="font-display text-2xl font-bold text-white mb-2">{need.title}</h1>
        <p className="text-slate-400 text-sm leading-relaxed mb-4">{need.description}</p>
        <div className="flex flex-wrap gap-4 text-sm text-slate-400 mb-4">
          <span className="flex items-center gap-1.5"><MapPin size={14} className="text-brand-400" />{need.location}</span>
          {need.schedule && <span className="flex items-center gap-1.5"><Calendar size={14} className="text-brand-400" />{need.schedule}</span>}
        </div>
        {need.skillsRequired.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {need.skillsRequired.map(s => (
              <span key={s} className="badge-pill bg-white/5 text-slate-400 border border-white/10 text-xs">{s}</span>
            ))}
          </div>
        )}

        {!isAccepted && need.status !== 'fulfilled' && (
          <button onClick={handleAccept} disabled={accepting} className="btn-primary mt-5 flex items-center gap-2">
            {accepting ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
            {accepting ? 'Accepting...' : 'Accept This Task'}
          </button>
        )}
        {isAccepted && (
          <div className="flex items-center gap-2 text-brand-400 mt-4 text-sm">
            <CheckCircle2 size={16} />
            <span className="font-semibold">You've accepted this task</span>
          </div>
        )}
      </div>

      {/* Chat */}
      {isAccepted ? (
        <div className="glass overflow-hidden">
          <div className="p-4 border-b border-white/5 flex items-center gap-2">
            <MessageCircle size={16} className="text-brand-400" />
            <h2 className="font-display font-semibold text-white">Task Chat</h2>
            <span className="text-slate-500 text-xs">with {orgName} and other volunteers</span>
          </div>
          <div className="h-80 overflow-y-auto p-5 space-y-3 scrollbar-thin">
            {messages.length === 0 && (
              <div className="text-center text-slate-500 py-12">No messages yet. Say hello!</div>
            )}
            {messages.map(msg => {
              const isMe = msg.senderId.toString() === user?.id;
              return (
                <div key={msg._id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-slide-up`}>
                  <div className={`max-w-xs lg:max-w-md flex flex-col gap-1 ${isMe ? 'items-end' : 'items-start'}`}>
                    {!isMe && (
                      <div className="flex items-center gap-1.5 px-1">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center ${msg.senderRole === 'admin' ? 'bg-brand-500/20' : 'bg-accent-500/20'}`}>
                          <span className={`text-xs font-bold ${msg.senderRole === 'admin' ? 'text-brand-400' : 'text-accent-400'}`}>{msg.senderName[0]}</span>
                        </div>
                        <span className="text-xs text-slate-500">{msg.senderName}</span>
                        {msg.senderRole === 'admin' && <span className="text-xs text-brand-500 bg-brand-500/10 px-1.5 rounded">NGO</span>}
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
      ) : (
        <div className="glass p-8 text-center">
          <MessageCircle size={32} className="text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400">Accept this task to join the coordination chat.</p>
        </div>
      )}
    </div>
  );
}
