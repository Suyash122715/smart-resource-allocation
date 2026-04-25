import { Router } from 'express';
import { acceptAssignment, getMyAssignments } from '../controllers/assignmentController';
import { authenticate, requireVolunteer } from '../middleware/auth';

const router = Router();
router.post('/accept', authenticate, requireVolunteer, acceptAssignment);
router.get('/mine', authenticate, requireVolunteer, getMyAssignments);
export default router;
