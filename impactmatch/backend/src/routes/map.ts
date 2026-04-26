import { Router } from 'express';
import { getMapData } from '../controllers/mapController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/data', authenticate, getMapData);

export default router;
