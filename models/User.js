import mongoose from 'mongoose';

const socialSchema = new mongoose.Schema({
  whatsapp: { type: String, default: '' },
  instagram: { type: String, default: '' },
  facebook: { type: String, default: '' },
  twitter: { type: String, default: '' }
});

const storeSchema = new mongoose.Schema({
  name: String,
  description: String,
  location: String
});

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String },
  role: { 
    type: String, 
    enum: ['SELLER', 'BUYER', 'ADMIN'], 
    default: 'BUYER' 
  },
  isVerified: { type: Boolean, default: false },
  otp: {
    code: String,
    expiresAt: Date
  },
  store: storeSchema,
  social: socialSchema,
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('User', userSchema);