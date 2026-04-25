import { Router } from 'express';
import { getMatches } from '../controllers/matchController';
import { authenticate } from '../middleware/auth';

const router = Router();
router.get('/:needId', authenticate, getMatches);
export default router;
