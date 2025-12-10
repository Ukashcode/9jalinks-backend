// models/User.js (Example structure)
import mongoose from 'mongoose';

const ReviewSchema = mongoose.Schema({
    raterId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    raterName: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String }
}, { timestamps: true });

const UserSchema = mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['BUYER', 'SELLER', 'ADMIN'], default: 'BUYER' },
    rating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
    reviews: [ReviewSchema],
    // ... other fields
}, { timestamps: true });

const User = mongoose.model('User', UserSchema);
export default User;