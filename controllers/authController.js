import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import generateOTP from '../utils/generateOTP.js';
import { sendOTPEmail } from '../utils/email.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// POST /api/auth/signup
export const signup = asyncHandler(async (req, res) => {
  console.log("📝 Signup started for:", req.body.email); // Debug log

  const { name, email, password, role } = req.body;

  if (!name || !email) {
    return res.status(400).json({ message: 'Name and email required' });
  }

  // Check if user exists
  const existing = await User.findOne({ email });
  if (existing) {
    return res.status(400).json({ message: 'User already exists' });
  }

  // 1. Fix the Salt Error: Use 10 directly
  // 2. Ensure password is a string before hashing
  let passwordHash = null;
  if (password) {
    passwordHash = await bcrypt.hash(password.toString(), 10);
  }

  // 3. Fix the Role Error: Force uppercase to match your Schema ('BUYER'/'SELLER')
  const validRole = role ? role.toUpperCase() : 'BUYER';

  const otp = generateOTP();
  const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

  // Create User
  const user = await User.create({
    name,
    email,
    passwordHash,
    role: validRole, 
    otp: { code: otp, expiresAt: otpExpiry }
  });

  try {
    await sendOTPEmail(email, otp);
  } catch (err) {
    console.error('⚠️ OTP email failed:', err.message);
    // We don't stop the process; user is created, they can resend OTP later
  }

  res.status(201).json({ message: 'User created. OTP sent if email configured' });
});

// POST /api/auth/verify-otp
export const verifyOtp = asyncHandler(async (req, res) => {
  const { email, code } = req.body;
  if (!email || !code) return res.status(400).json({ message: 'Email and code required' });

  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ message: 'Invalid email' });

  if (!user.otp || user.otp.code !== code || user.otp.expiresAt < new Date()) {
    return res.status(400).json({ message: 'Invalid or expired OTP' });
  }

  user.isVerified = true;
  user.otp = undefined;
  await user.save();

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });
  
  res.json({ 
    token, 
    user: { id: user._id, name: user.name, email: user.email, role: user.role } 
  });
});

// POST /api/auth/login
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: 'Email and password required' });

  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ message: 'Invalid credentials' });

  if (!user.passwordHash) return res.status(400).json({ message: 'Use social login' });

  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match) return res.status(400).json({ message: 'Invalid credentials' });

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });
  
  res.json({ 
    token, 
    user: { id: user._id, name: user.name, email: user.email, role: user.role } 
  });
});

// PUT /api/auth/profile
export const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) return res.status(404).json({ message: 'User not found' });

  const { store, social, name } = req.body;
  if (name) user.name = name;
  if (store) user.store = { ...user.store, ...store };
  if (social) user.social = { ...user.social, ...social };

  await user.save();
  res.json(user);
});

// GET /api/auth/me
export const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('-passwordHash -otp');
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json(user);
});