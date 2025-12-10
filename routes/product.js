// routes/products.js
import express from 'express';
import Product from '../models/Product.js';

const router = express.Router();

// Utility function for consistent product response format
const formatProductResponse = (product) => {
    const doc = product.toObject ? product.toObject() : product;
    doc.id = doc._id;
    delete doc._id;
    return doc;
}

// @route   GET /api/products
// @desc    Get all products with filtering/search
router.get('/', async (req, res) => {
    try {
        const { category, search, sellerId } = req.query;
        let query = {};
        
        if (category && category !== 'All') query.category = category;
        if (sellerId) query.sellerId = sellerId;
        
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        const products = await Product.find(query).sort({ createdAt: -1 });
        
        const formatted = products.map(formatProductResponse);
        
        res.json(formatted);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   GET /api/products/:id
// @desc    Get a single product and increment view count
router.get('/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        // Increment views
        product.views = (product.views || 0) + 1;
        await product.save();

        res.json(formatProductResponse(product));
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   POST /api/products
// @desc    Create a new product
router.post('/', async (req, res) => {
    try {
        const newProduct = new Product(req.body);
        const saved = await newProduct.save();
        res.status(201).json(formatProductResponse(saved));
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   PUT /api/products/:id
// @desc    Update a product
router.put('/:id', async (req, res) => {
    try {
        const updated = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updated) return res.status(404).json({ message: "Product not found" });
        res.json(formatProductResponse(updated));
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   DELETE /api/products/:id
// @desc    Delete a product
router.delete('/:id', async (req, res) => {
    try {
        const deleted = await Product.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ message: "Product not found" });
        res.json({ message: 'Product deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;