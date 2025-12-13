import express from 'express';
import { signup, login, verifyOtp, updateProfile, getMe } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/verify-otp', verifyOtp);
router.put('/profile', protect, updateProfile);
router.get('/me', protect, getMe);

export default router;