// routes/auth.js
import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'secret_key_9jalinks';

// Utility function for consistent user response format
const formatUserResponse = (user) => {
    const userObj = user.toObject();
    userObj.id = userObj._id;
    delete userObj._id;
    delete userObj.password;
    return userObj;
}

// @route   POST /api/auth/signup
// @desc    Register new user
router.post('/signup', async (req, res) => {
    try {
        const { name, email, password, isSeller } = req.body;
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        
        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            role: isSeller ? 'SELLER' : 'BUYER'
        });
        
        await newUser.save();
        res.status(201).json({ message: 'User created successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' });
        
        res.json({ token, user: formatUserResponse(user) });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;