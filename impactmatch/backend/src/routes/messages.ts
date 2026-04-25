import { Router } from 'express';
import { getMessages } from '../controllers/messageController';
import { authenticate } from '../middleware/auth';

const router = Router();
router.get('/:taskId', authenticate, getMessages);
export default router;
