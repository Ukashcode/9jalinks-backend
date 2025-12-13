import express from 'express';
import { addProduct, listProducts, getProduct, myProducts, deleteProduct } from '../controllers/productController.js';
import { protect } from '../middleware/authMiddleware.js';
import multer from 'multer';

const upload = multer({ storage: multer.memoryStorage() });
const router = express.Router();

router.get('/', listProducts);
router.get('/my-products', protect, myProducts);
router.get('/:id', getProduct);
router.post('/', protect, upload.array('images', 6), addProduct);
router.delete('/:id', protect, deleteProduct);

export default router;