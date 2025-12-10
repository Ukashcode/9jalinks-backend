/*import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import sellerRoutes from './routes/sellers.js';

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

app.use('/api/sellers', sellerRoutes);

app.get('/', (req, res) => res.send('9jaLinks API running'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
*/

const Age = 14;
if (Age >= 18) {
  console.log("Access granted ");
}else{
  console.log("Access denied");
}
console.log("Hey it's my first node app")


