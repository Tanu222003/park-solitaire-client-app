import { Router } from 'express';
import {
  getComplaints,
  createComplaint,
  updateComplaint,
  deleteComplaint
} from '../controllers/complaints.controller.js';
import { verifyToken } from '../middleware/auth.js';

const router = Router();
router.use(verifyToken);

router.get('/', getComplaints);
router.post('/', createComplaint);
router.put('/:id', updateComplaint);
router.delete('/:id', deleteComplaint);

export default router;
