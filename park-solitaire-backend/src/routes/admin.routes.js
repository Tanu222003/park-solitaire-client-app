import { Router } from 'express';
import {
  getDashboard,
  getPartners,
  createPartner,
  updatePartnerStatus
} from '../controllers/admin.controller.js';
import { verifyToken, requireRole } from '../middleware/auth.js';

const router = Router();
router.use(verifyToken, requireRole('admin'));

router.get('/dashboard', getDashboard);
router.get('/partners', getPartners);
router.post('/partners', createPartner);
router.put('/partners/:id/status', updatePartnerStatus);

export default router;
