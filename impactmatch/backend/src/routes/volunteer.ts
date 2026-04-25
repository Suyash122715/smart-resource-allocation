import { Router } from 'express';
import { getProfile, updateProfile, getMatchedNeeds } from '../controllers/volunteerController';
import { authenticate, requireVolunteer } from '../middleware/auth';

const router = Router();
router.get('/profile', authenticate, requireVolunteer, getProfile);
router.patch('/profile', authenticate, requireVolunteer, updateProfile);
router.get('/matched-needs', authenticate, requireVolunteer, getMatchedNeeds);
export default router;
