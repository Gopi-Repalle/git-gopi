const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  shortDescription: { type: String },
  price: { type: Number, required: true, min: 0 },
  originalPrice: { type: Number, min: 0 },
  discount: { type: Number, default: 0, min: 0, max: 100 },
  images: [{ type: String }],
  category: { type: String, default: 'Chilli Powder' },
  tags: [String],
  farmer: {
    name: { type: String },
    location: { type: String },
    verified: { type: Boolean, default: true }
  },
  specs: {
    weight: { type: String },
    heatLevel: { type: String, enum: ['Mild', 'Medium', 'Hot', 'Very Hot', 'Extra Hot'] },
    origin: { type: String },
    process: { type: String },
    shelfLife: { type: String },
    certifications: [String]
  },
  stock: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  isFeatured: { type: Boolean, default: false },
  badge: { type: String, default: '' },
  ratings: {
    average: { type: Number, default: 0 },
    count: { type: Number, default: 0 }
  }
}, { timestamps: true });

productSchema.index({ name: 'text', description: 'text' });

module.exports = mongoose.model('Product', productSchema);
