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
  
  // This stores the hashed password coming from the controller
  passwordHash: { type: String },
  
  // Ensuring role matches the Uppercase 'BUYER'/'SELLER' logic
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

// ⚠️ IMPORTANT: NO .pre('save') hook here!
// We rely on the controller to handle hashing.

export default mongoose.model('User', userSchema);