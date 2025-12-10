// server.js

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import authRoutes from './routes/auth.js';
import productRoutes from './models/Product.js';
import userRoutes from './models/User.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect Database
connectDB();

// Middleware
// Increased limit to 50mb for Base64 image strings
app.use(express.json({ limit: '50mb' })); 
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cors());

// Define Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);

app.post('/api/contact', (req, res) => {
    // In a real production app, you would send an email here using Nodemailer or SendGrid.
    // For now, we just log it to the console.
    console.log("New Contact Message:", req.body);
    res.json({ message: "Message received successfully" });
});

// Start Server
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));