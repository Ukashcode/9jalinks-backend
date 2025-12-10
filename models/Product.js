import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String, required: true },
  condition: { type: String, default: 'Used' },
  location: { type: String },
  images: [
    {
      url: { type: String },
      public_id: { type: String }
    }
  ],
  views: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Product', productSchema);