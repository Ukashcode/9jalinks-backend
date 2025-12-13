import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import generateOTP from '../utils/generateOTP.js';
import { sendOTPEmail } from '../utils/email.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// POST /api/auth/signup
export const signup = asyncHandler(async (req, res) => {
  console.log("📝 Signup request received for:", req.body.email);

  const { name, email, password, role } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email, and password are required' });
  }

  // Check if user exists
  const existing = await User.findOne({ email });
  if (existing) {
    return res.status(400).json({ message: 'User already exists' });
  }

  // 1. Hash Password (Securely using 10 rounds)
  const passwordHash = await bcrypt.hash(password.toString(), 10);

  // 2. Handle Role (Ensure Uppercase to match Schema)
  const validRole = role ? role.toUpperCase() : 'BUYER';

  // 3. Generate OTP
  const otp = generateOTP();
  const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 mins expiry

  // 4. Create User
  const user = await User.create({
    name,
    email,
    passwordHash, // Saving to passwordHash field
    role: validRole, 
    otp: { code: otp, expiresAt: otpExpiry },
    isVerified: false
  });

  // 5. Send Email
  try {
    await sendOTPEmail(email, otp);
    console.log(`✅ OTP sent to ${email}`);
  } catch (err) {
    console.error('⚠️ OTP email failed:', err.message);
    // User is created, so we don't fail the request, but we log the error
  }

  res.status(201).json({ message: 'User created. Please verify your OTP.' });
});

// POST /api/auth/verify-otp
export const verifyOtp = asyncHandler(async (req, res) => {
  const { email, code } = req.body;
  
  if (!email || !code) {
    return res.status(400).json({ message: 'Email and code required' });
  }

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(400).json({ message: 'Invalid email' });
  }

  // Check OTP validity
  if (!user.otp || user.otp.code !== code) {
    return res.status(400).json({ message: 'Invalid OTP code' });
  }
  
  if (user.otp.expiresAt < new Date()) {
    return res.status(400).json({ message: 'OTP has expired' });
  }

  // Verify User
  user.isVerified = true;
  user.otp = undefined; // Clear OTP after usage
  await user.save();

  // Generate Token
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

  // Safety check if user was created without password (social login)
  if (!user.passwordHash) return res.status(400).json({ message: 'Use social login or reset password' });

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