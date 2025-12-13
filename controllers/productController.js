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
    const stream = cloudinary.uploader.upload_stream({ folder: '9jalinks' }, (err, res) => {
      if (err) reject(err); else resolve(res);
    });
    streamifier.createReadStream(buffer).pipe(stream);
  });
}

export const addProduct = asyncHandler(async (req, res) => {
  const { title, description, price, category, location } = req.body;
  const images = [];
  if (req.files) {
    for (const f of req.files) {
      const result = await uploadBuffer(f.buffer);
      images.push({ url: result.secure_url, public_id: result.public_id });
    }
  }
  const product = await Product.create({
    seller: req.user._id, title, description, price, category, location, images
  });
  res.status(201).json(product);
});

export const listProducts = asyncHandler(async (req, res) => {
  const { q, category } = req.query;
  const filter = {};
  if (q) filter.title = { $regex: q, $options: 'i' };
  if (category && category !== 'All') filter.category = category;
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