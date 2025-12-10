// routes/users.js
import express from 'express';
import User from '../models/User.js';

const router = express.Router();

// Utility function for consistent user response format
const formatUserResponse = (user) => {
    const doc = user.toObject ? user.toObject() : user;
    doc.id = doc._id;
    delete doc._id;
    delete doc.password;
    return doc;
}

// @route   GET /api/users
// @desc    Get all users (excluding sensitive data)
router.get('/', async (req, res) => {
    try {
        const users = await User.find({});
        const formatted = users.map(formatUserResponse);
        res.json(formatted);
    } catch (e) { 
        res.status(500).json({ message: e.message });
    }
});

// @route   GET /api/users/:id
// @desc    Get a specific user by ID
router.get('/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: "User not found" });
        res.json(formatUserResponse(user));
    } catch (e) { 
        res.status(500).json({ message: e.message });
    }
});

// @route   PUT /api/users/:id
// @desc    Update user details
router.put('/:id', async (req, res) => {
    try {
        const updated = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updated) return res.status(404).json({ message: "User not found" });
        res.json(formatUserResponse(updated));
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   POST /api/users/:id/rate
// @desc    Add a rating/review to a user
router.post('/:id/rate', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: "User not found" });
        
        const { raterId, raterName, rating, comment } = req.body;
        
        // Ensure rating is within 1-5 range and is a number
        const newRating = Math.max(1, Math.min(5, Number(rating)));

        user.reviews.push({ raterId, raterName, rating: newRating, comment });
        
        // Recalculate average rating
        const total = user.reviews.reduce((acc, curr) => acc + curr.rating, 0);
        user.reviewCount = user.reviews.length;
        user.rating = (total / user.reviewCount).toFixed(2); // Keep rating to 2 decimal places
        
        await user.save();
        
        res.json(formatUserResponse(user));
    } catch (e) { 
        res.status(500).json({ message: e.message });
    }
});

export default router;