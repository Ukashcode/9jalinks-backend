

import express from 'express';
// 👇 Import the logic from the controller
import { 
  signup, 
  login, 
  verifyOtp, 
  updateProfile, 
  getMe 
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Routes
router.post('/signup', signup);
router.post('/login', login);

// 👇 This route is crucial! It was missing before, causing the "Unexpected token <" error
router.post('/verify-otp', verifyOtp);

// Protected Routes (Require Login)
router.put('/profile', protect, updateProfile);
router.get('/me', protect, getMe);

export default router;