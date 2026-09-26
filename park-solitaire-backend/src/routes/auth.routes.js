import { Router } from 'express';
import {
  register,
  login,
  getMe,
  getUserProfile,
  getAdminInfo,
  sendForgotPasswordOtp,
  verifyForgotPasswordOtp,
  resetForgotPassword
} from '../controllers/auth.controller.js';
import { verifyToken } from '../middleware/auth.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/admin/login', (req, res, next) => {
  req.body = req.body || {};
  req.body.role = 'admin';
  return login(req, res, next);
});
router.post('/partner/login', (req, res, next) => {
  req.body = req.body || {};
  req.body.role = 'partner';
  return login(req, res, next);
});

// Forgot Password routes with OTP
router.post('/forgot-password/send-otp', sendForgotPasswordOtp);
router.post('/forgot-password/verify-otp', verifyForgotPasswordOtp);
router.post('/forgot-password/reset', resetForgotPassword);

router.get('/me', verifyToken, getMe);
router.get('/admin-info', verifyToken, getAdminInfo);
router.get('/user/:id', verifyToken, getUserProfile);

export default router;
