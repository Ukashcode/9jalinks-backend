import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Seller from './models/Seller.js';

dotenv.config();

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error(err));

const sellers = [
  { name: "John Doe", category: "Plumber", location: "Lagos", contact: "08012345678", description: "Expert plumbing services" },
  { name: "Jane Smith", category: "Electrician", location: "Abuja", contact: "08123456789", description: "Certified electrician" },
  { name: "Mary Johnson", category: "Carpenter", location: "Kano", contact: "09012345678", description: "Professional carpenter" }
];

const seedDB = async () => {
  await Seller.deleteMany({});
  await Seller.insertMany(sellers);
  console.log("Database seeded!");
  mongoose.connection.close();
};

seedDB();
