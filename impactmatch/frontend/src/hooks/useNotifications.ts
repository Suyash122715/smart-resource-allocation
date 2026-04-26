import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../utils/api';
import { getSocket } from '../utils/socket';
import { useNotificationStore } from '../store/notificationStore';
import { useAuthStore } from '../store/authStore';
import { Notification } from '../types';

export function useNotifications() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { setNotifications, addNotification } = useNotificationStore();
  const listenersAttached = useRef(false);

  // Fetch existing notifications on mount
  useEffect(() => {
    api.get('/api/notifications')
      .then((res) => setNotifications(res.data.notifications))
      .catch(() => { /* silently ignore */ });
  }, [setNotifications]);

  // Set up socket listeners
  useEffect(() => {
    if (listenersAttached.current) return;
    listenersAttached.current = true;

    const socket = getSocket();

    const handleNewNeed = (payload: {
      needId: string;
      title: string;
      urgency: string;
      location: string;
      category: string;
      orgName: string;
    }) => {
      const notification: Notification = {
        _id: `temp-${Date.now()}`,
        userId: user?.id || '',
        type: 'new_need',
        title: '🔔 New Task Available',
        message: `${payload.title} in ${payload.location} (${payload.urgency})`,
        needId: payload.needId,
        read: false,
        createdAt: new Date().toISOString(),
      };
      addNotification(notification);

      // Use toast.success with an icon-prefixed string — no JSX needed in .ts file
      toast.success(
        `🔔 New Task: ${payload.title} — ${payload.location}`,
        {
          duration: 6000,
          style: {
            background: '#1e293b',
            color: '#e2e8f0',
            border: '1px solid rgba(20,184,166,0.3)',
            fontFamily: '"DM Sans", sans-serif',
            borderRadius: '12px',
            padding: '12px 16px',
            maxWidth: '340px',
          },
          iconTheme: { primary: '#14b8a6', secondary: '#0a0f1e' },
          onClick: () => navigate('/volunteer'),
        } as Parameters<typeof toast.success>[1]
      );
    };

    const handleTaskFulfilled = (payload: {
      needId: string;
      title: string;
      volunteersRewarded: number;
      creditsAwarded: number;
    }) => {
      const notification: Notification = {
        _id: `temp-${Date.now()}`,
        userId: user?.id || '',
        type: 'task_fulfilled',
        title: '✅ Task Fulfilled',
        message: `${payload.title} — ${payload.volunteersRewarded} volunteer(s) rewarded ${payload.creditsAwarded} credits each`,
        needId: payload.needId,
        read: false,
        createdAt: new Date().toISOString(),
      };
      addNotification(notification);

      toast.success(
        `✅ Fulfilled: ${payload.title} · ${payload.volunteersRewarded} volunteer(s) · ${payload.creditsAwarded} credits`,
        {
          duration: 6000,
          style: {
            background: '#1e293b',
            color: '#e2e8f0',
            border: '1px solid rgba(249,115,22,0.3)',
            fontFamily: '"DM Sans", sans-serif',
            borderRadius: '12px',
            padding: '12px 16px',
            maxWidth: '340px',
          },
          iconTheme: { primary: '#f97316', secondary: '#0a0f1e' },
          onClick: () => navigate('/admin'),
        } as Parameters<typeof toast.success>[1]
      );
    };

    socket.on('new_need_posted', handleNewNeed);
    socket.on('task_fulfilled_notify', handleTaskFulfilled);

    return () => {
      socket.off('new_need_posted', handleNewNeed);
      socket.off('task_fulfilled_notify', handleTaskFulfilled);
      listenersAttached.current = false;
    };
  }, [user, addNotification, navigate]);
}
