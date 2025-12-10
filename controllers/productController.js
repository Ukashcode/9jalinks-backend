import asyncHandler from 'express-async-handler';
import Product from '../models/Product.js';
import { v2 as cloudinary } from 'cloudinary';
import streamifier from 'streamifier';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET
});

function uploadBuffer(buffer) {
  return new Promise((resolve, reject) => {
    const upload_stream = cloudinary.uploader.upload_stream({ folder: '9jalinks' }, (error, result) => {
      if (error) return reject(error);
      resolve(result);
    });
    streamifier.createReadStream(buffer).pipe(upload_stream);
  });
}

// POST /api/products (protected)
export const addProduct = asyncHandler(async (req, res) => {
  const { title, description, price, category, condition, location } = req.body;
  if (!title || !category) return res.status(400).json({ message: 'Title and category required' });

  const images = [];
  if (req.files && req.files.length) {
    for (const f of req.files) {
      const result = await uploadBuffer(f.buffer);
      images.push({ url: result.secure_url, public_id: result.public_id });
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
    images
  });

  res.status(201).json(product);
});

// GET /api/products
export const listProducts = asyncHandler(async (req, res) => {
  const { q, category } = req.query;
  const filter = {};
  if (q) filter.title = { $regex: q, $options: 'i' };
  if (category) filter.category = category;
  const products = await Product.find(filter).populate('seller', 'name store social');
  res.json(products);
});

// GET /api/products/:id
export const getProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id).populate('seller', 'name store social');
  if (!product) return res.status(404).json({ message: 'Product not found' });
  product.views = (product.views || 0) + 1;
  await product.save();
  res.json(product);
});

// GET /api/products/my-products
export const myProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({ seller: req.user._id });
  res.json(products);
});

// DELETE /api/products/:id
export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ message: 'Not found' });
  if (product.seller.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Not allowed' });
  // optionally delete images from Cloudinary here
  await product.remove();
  res.json({ message: 'Deleted' });
});