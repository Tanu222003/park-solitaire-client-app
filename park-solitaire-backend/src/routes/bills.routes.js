import { Router } from 'express';
import {
  getBills,
  createBill,
  payBill
} from '../controllers/bills.controller.js';
import { verifyToken } from '../middleware/auth.js';

const router = Router();
router.use(verifyToken);

router.get('/', getBills);
router.post('/', createBill);
router.put('/:id/pay', payBill);

export default router;
