import { Router } from 'express';
import { getNotifications, markAllRead, markOneRead } from '../controllers/notificationController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, getNotifications);
router.patch('/read', authenticate, markAllRead);
router.patch('/:id/read', authenticate, markOneRead);

export default router;
