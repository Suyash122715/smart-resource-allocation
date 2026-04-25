import { Response } from 'express';
import Message from '../models/Message';
import Assignment from '../models/Assignment';
import Need from '../models/Need';
import Organization from '../models/Organization';
import { AuthRequest } from '../middleware/auth';

export const getMessages = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { taskId } = req.params;

    // Check authorization
    if (req.user?.role === 'volunteer') {
      const assignment = await Assignment.findOne({ needId: taskId, volunteerId: req.user.id });
      if (!assignment) {
        res.status(403).json({ message: 'Not authorized for this chat' });
        return;
      }
    } else if (req.user?.role === 'admin') {
      const need = await Need.findById(taskId);
      if (!need) { res.status(404).json({ message: 'Task not found' }); return; }
      const org = await Organization.findOne({ adminUserId: req.user.id });
      if (!org || need.orgId.toString() !== org._id.toString()) {
        res.status(403).json({ message: 'Not authorized' });
        return;
      }
    }

    const messages = await Message.find({ taskId }).sort({ createdAt: 1 });
    res.json({ messages });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch messages', error: err });
  }
};
