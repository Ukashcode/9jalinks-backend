import asyncHandler from 'express-async-handler';
import Product from '../models/Product.js';
import { v2 as cloudinary } from 'cloudinary';
import streamifier from 'streamifier';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET
});

// Helper for Multer Files (Backup)
function uploadBuffer(buffer) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream({ folder: '9jalinks' }, (err, res) => {
      if (err) reject(err); else resolve(res);
    });
    streamifier.createReadStream(buffer).pipe(stream);
  });
}

export const addProduct = asyncHandler(async (req, res) => {
  const { title, description, price, category, condition, location } = req.body;
  
  // Validation
  if (!title || !category || !price) {
    return res.status(400).json({ message: 'Title, Category, and Price are required' });
  }

  let imageLinks = [];

  // 1. Handle Base64 Images (Sent from Frontend Dashboard)
  if (req.body.images && Array.isArray(req.body.images) && req.body.images.length > 0) {
    try {
      for (const imageStr of req.body.images) {
        // Upload base64 directly to Cloudinary
        const result = await cloudinary.uploader.upload(imageStr, {
          folder: '9jalinks'
        });
        imageLinks.push({ url: result.secure_url, public_id: result.public_id });
      }
    } catch (error) {
      console.error("Image upload error:", error);
      // Don't crash, just log it. Maybe return error if critical.
    }
  }
  
  // 2. Handle Multer Files (Fallback/Postman)
  else if (req.files && req.files.length > 0) {
    for (const f of req.files) {
      const result = await uploadBuffer(f.buffer);
      imageLinks.push({ url: result.secure_url, public_id: result.public_id });
    }
  }

  const product = await Product.create({
    seller: req.user._id,
    title,
    description,
    price,
    category,
    condition,
    location,
    images: imageLinks // Save the uploaded links
  });

  res.status(201).json(product);
});

export const listProducts = asyncHandler(async (req, res) => {
  const { q, category, sellerId } = req.query;
  const filter = {};
  if (q) filter.title = { $regex: q, $options: 'i' };
  if (category && category !== 'All') filter.category = category;
  if (sellerId) filter.seller = sellerId; // Support server-side filtering

  const products = await Product.find(filter).populate('seller', 'name store social');
  res.json(products);
});

export const getProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id).populate('seller', 'name store social');
  if (!product) return res.status(404).json({ message: 'Not found' });
  product.views = (product.views || 0) + 1;
  await product.save();
  res.json(product);
});

export const myProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({ seller: req.user._id });
  res.json(products);
});

export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ message: 'Not found' });
  if (product.seller.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Not allowed' });
  await Product.deleteOne({ _id: req.params.id });
  res.json({ message: 'Deleted' });
});

// Update Product (Optional)
export const updateProduct = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Not found' });
    if (product.seller.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Not allowed' });

    // Update fields
    product.title = req.body.title || product.title;
    product.price = req.body.price || product.price;
    product.description = req.body.description || product.description;
    product.category = req.body.category || product.category;
    product.condition = req.body.condition || product.condition;

    await product.save();
    res.json(product);
});