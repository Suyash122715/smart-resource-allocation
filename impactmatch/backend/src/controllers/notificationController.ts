import { Response } from 'express';
import Notification from '../models/Notification';
import { AuthRequest } from '../middleware/auth';

export const getNotifications = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const notifications = await Notification.find({ userId: req.user?.id })
      .sort({ createdAt: -1 })
      .limit(20);
    res.json({ notifications });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch notifications', error: err });
  }
};

export const markAllRead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await Notification.updateMany({ userId: req.user?.id, read: false }, { read: true });
    res.json({ message: 'All notifications marked as read' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to mark notifications as read', error: err });
  }
};

export const markOneRead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user?.id },
      { read: true }
    );
    res.json({ message: 'Notification marked as read' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to mark notification as read', error: err });
  }
};
