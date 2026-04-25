import { Router } from 'express';
import { extractNeed, createNeed, getNeeds, getNeedById, fulfillNeed, getAdminStats } from '../controllers/needsController';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = Router();

router.post('/extract', authenticate, requireAdmin, extractNeed);
router.post('/', authenticate, requireAdmin, createNeed);
router.get('/stats', authenticate, requireAdmin, getAdminStats);
router.get('/', authenticate, getNeeds);
router.get('/:id', authenticate, getNeedById);
router.patch('/:id/fulfill', authenticate, requireAdmin, fulfillNeed);

export default router;
