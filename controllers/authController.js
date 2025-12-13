import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import generateOTP from '../utils/generateOTP.js';
import { sendOTPEmail } from '../utils/email.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// POST /api/auth/signup
export const signup = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password) return res.status(400).json({ message: 'All fields required' });

  const existing = await User.findOne({ email });
  if (existing) return res.status(400).json({ message: 'User already exists' });

  const passwordHash = await bcrypt.hash(password.toString(), 10);
  const validRole = role ? role.toUpperCase() : 'BUYER';
  
  const otp = generateOTP();
  const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

  const user = await User.create({
    name, email, passwordHash, role: validRole,
    otp: { code: otp, expiresAt: otpExpiry }
  });

  try { await sendOTPEmail(email, otp); } catch (err) { console.error(err); }

  res.status(201).json({ message: 'User created. Please verify OTP.' });
});

// POST /api/auth/verify-otp
export const verifyOtp = asyncHandler(async (req, res) => {
  const { email, code } = req.body;
  const user = await User.findOne({ email });

  if (!user || !user.otp || user.otp.code !== code || user.otp.expiresAt < new Date()) {
    return res.status(400).json({ message: 'Invalid or expired OTP' });
  }

  user.isVerified = true;
  user.otp = undefined;
  await user.save();

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });
  res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
});

// POST /api/auth/login
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (!user || !user.passwordHash || !(await bcrypt.compare(password, user.passwordHash))) {
    return res.status(400).json({ message: 'Invalid credentials' });
  }

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });
  res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
});

export const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (req.body.name) user.name = req.body.name;
  if (req.body.store) user.store = { ...user.store, ...req.body.store };
  if (req.body.social) user.social = { ...user.social, ...req.body.social };
  await user.save();
  res.json(user);
});

export const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('-passwordHash');
  res.json(user);
});