import { Router } from 'express';
import {
  getPayments,
  createPayment,
  updatePayment,
  deletePayment
} from '../controllers/payments.controller.js';
import { verifyToken } from '../middleware/auth.js';

const router = Router();
router.use(verifyToken);

router.get('/', getPayments);
router.post('/', createPayment);
router.put('/:id', updatePayment);
router.delete('/:id', deletePayment);

export default router;
