import { Router } from 'express';
import {
  getVisits,
  getVisitById,
  createVisit,
  updateVisit,
  deleteVisit
} from '../controllers/visits.controller.js';
import { verifyToken } from '../middleware/auth.js';

const router = Router();
router.use(verifyToken);

router.get('/', getVisits);
router.post('/', createVisit);
router.get('/:id', getVisitById);
router.put('/:id', updateVisit);
router.delete('/:id', deleteVisit);

export default router;
