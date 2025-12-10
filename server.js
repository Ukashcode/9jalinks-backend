import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import authRoutes from './routes/auth.js';

// ✅ FIXED: Importing from routes folder, not models
import productRoutes from './routes/productRoutes.js'; 
// import userRoutes from './routes/users.js'; // (Uncomment only if you have this file)

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect Database
connectDB();

// Middleware
app.use(express.json({ limit: '50mb' })); 
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Allow CORS from Anywhere
app.use(cors({
  origin: '*',
  credentials: true
}));

// Define Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
// app.use('/api/users', userRoutes); 

app.post('/api/contact', (req, res) => {
    console.log("New Contact Message:", req.body);
    res.json({ message: "Message received successfully" });
});

// Start Server
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));