import Seller from "../models/Seller.js";

// Create seller profile
export const createSeller = async (req, res) => {
  try {
    const { businessName, description, phone, email, location } = req.body;
    const userId = req.user.id; // from authMiddleware

    const existingSeller = await Seller.findOne({ userId });
    if (existingSeller) return res.status(400).json({ message: "Profile already exists" });

    const seller = await Seller.create({ userId, businessName, description, phone, email, location });
    res.status(201).json(seller);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get seller profile by user
export const getSellerByUser = async (req, res) => {
  try {
    const seller = await Seller.findOne({ userId: req.user.id });
    if (!seller) return res.status(404).json({ message: "Seller profile not found" });
    res.json(seller);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update seller profile
export const updateSeller = async (req, res) => {
  try {
    const updates = req.body;
    const seller = await Seller.findOneAndUpdate({ userId: req.user.id }, updates, { new: true });
    if (!seller) return res.status(404).json({ message: "Seller profile not found" });
    res.json(seller);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete seller profile
export const deleteSeller = async (req, res) => {
  try {
    const seller = await Seller.findOneAndDelete({ userId: req.user.id });
    if (!seller) return res.status(404).json({ message: "Seller profile not found" });
    res.json({ message: "Seller profile deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all sellers (for buyers to view)
export const getAllSellers = async (req, res) => {
  try {
    const sellers = await Seller.find();
    res.json(sellers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// Add a product
export const addProduct = async (req, res) => {
  try {
    const { name, description, price } = req.body;
    const seller = await Seller.findOne({ userId: req.user.id });
    if (!seller) return res.status(404).json({ message: "Seller profile not found" });

    seller.products.push({ name, description, price });
    await seller.save();
    res.json(seller);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update a product
export const updateProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const updates = req.body;
    const seller = await Seller.findOne({ userId: req.user.id });
    if (!seller) return res.status(404).json({ message: "Seller profile not found" });

    const product = seller.products.id(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    Object.assign(product, updates);
    await seller.save();
    res.json(seller);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete a product
export const deleteProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const seller = await Seller.findOne({ userId: req.user.id });
    if (!seller) return res.status(404).json({ message: "Seller profile not found" });

    seller.products.id(productId).remove();
    await seller.save();
    res.json(seller);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
