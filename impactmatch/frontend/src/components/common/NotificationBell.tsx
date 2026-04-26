import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell } from 'lucide-react';
import { useNotificationStore } from '../../store/notificationStore';
import { useAuthStore } from '../../store/authStore';
import api from '../../utils/api';
import { Notification } from '../../types';

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

const TYPE_ICON: Record<Notification['type'], string> = {
  new_need: '🔔',
  task_fulfilled: '✅',
};

export default function NotificationBell() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { notifications, unreadCount, markAllRead, markOneRead } = useNotificationStore();
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleMarkAllRead = async () => {
    markAllRead();
    await api.patch('/api/notifications/read').catch(() => {});
  };

  const handleClickNotification = async (n: Notification) => {
    if (!n.read) {
      markOneRead(n._id);
      // Only call API if it's a real DB id (not a temp socket one)
      if (!n._id.startsWith('temp-')) {
        await api.patch(`/api/notifications/${n._id}/read`).catch(() => {});
      }
    }
    setOpen(false);
    if (user?.role === 'admin') {
      navigate(n.needId ? `/admin/task/${n.needId}` : '/admin');
    } else {
      navigate('/volunteer');
    }
  };

  return (
    <div ref={wrapperRef} style={{ position: 'relative', display: 'inline-block' }}>
      {/* Bell button */}
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          position: 'relative',
          background: 'rgba(255,255,255,0.06)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 10,
          width: 36,
          height: 36,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          color: unreadCount > 0 ? '#14b8a6' : '#64748b',
          transition: 'all 0.2s',
        }}
        title="Notifications"
      >
        <Bell size={17} />
        {unreadCount > 0 && (
          <span
            style={{
              position: 'absolute',
              top: -4,
              right: -4,
              background: '#ef4444',
              color: '#fff',
              borderRadius: 999,
              fontSize: 9,
              fontWeight: 800,
              minWidth: 16,
              height: 16,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0 3px',
              lineHeight: 1,
              border: '2px solid #0a0f1e',
            }}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      {open && (
        <div
          style={{
            position: 'absolute',
            right: 0,
            top: 44,
            width: 320,
            maxHeight: 400,
            overflowY: 'auto',
            background: 'rgba(15,23,42,0.97)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 12,
            zIndex: 200,
            boxShadow: '0 16px 48px rgba(0,0,0,0.5)',
            backdropFilter: 'blur(16px)',
            fontFamily: '"DM Sans", sans-serif',
          }}
        >
          {/* Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 16px',
              borderBottom: '1px solid rgba(255,255,255,0.07)',
            }}
          >
            <span style={{ fontFamily: '"Syne", sans-serif', fontWeight: 700, fontSize: 14, color: '#f1f5f9' }}>
              Notifications
            </span>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#14b8a6',
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                  padding: '2px 6px',
                  borderRadius: 6,
                }}
              >
                Mark all read
              </button>
            )}
          </div>

          {/* Notification list */}
          {notifications.length === 0 ? (
            <div
              style={{
                padding: 32,
                textAlign: 'center',
                color: '#475569',
                fontSize: 13,
              }}
            >
              <Bell size={28} style={{ margin: '0 auto 8px', display: 'block', opacity: 0.4 }} />
              No notifications yet
            </div>
          ) : (
            notifications.map((n) => (
              <button
                key={n._id}
                onClick={() => handleClickNotification(n)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 10,
                  padding: '11px 16px',
                  background: n.read ? 'transparent' : 'rgba(20,184,166,0.05)',
                  borderLeft: n.read ? '2px solid transparent' : '2px solid #14b8a6',
                  borderRight: 'none',
                  borderTop: 'none',
                  borderBottom: '1px solid rgba(255,255,255,0.05)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'background 0.2s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.04)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = n.read ? 'transparent' : 'rgba(20,184,166,0.05)')}
              >
                <span style={{ fontSize: 18, flexShrink: 0, lineHeight: 1.2 }}>
                  {TYPE_ICON[n.type]}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 12, color: '#e2e8f0', marginBottom: 2, lineHeight: 1.3 }}>
                    {n.title}
                  </div>
                  <div style={{ fontSize: 11, color: '#64748b', lineHeight: 1.4, marginBottom: 4 }}>
                    {n.message}
                  </div>
                  <div style={{ fontSize: 10, color: '#475569' }}>
                    {timeAgo(n.createdAt)}
                  </div>
                </div>
                {!n.read && (
                  <div style={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    background: '#14b8a6',
                    flexShrink: 0,
                    marginTop: 4,
                  }} />
                )}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
