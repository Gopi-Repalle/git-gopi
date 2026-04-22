const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
  rating: { type: Number, required: true, min: 1, max: 5 },
  title: { type: String },
  comment: { type: String, required: true },
  images: [String],
  isVerifiedPurchase: { type: Boolean, default: false },
  helpful: { type: Number, default: 0 }
}, { timestamps: true });

reviewSchema.index({ product: 1, user: 1 }, { unique: true });

const returnSchema = new mongoose.Schema({
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reason: { type: String, required: true },
  description: { type: String },
  resolution: { type: String, enum: ['refund', 'replacement', 'partial_refund'], default: 'refund' },
  status: { type: String, enum: ['pending', 'approved', 'rejected', 'completed'], default: 'pending' },
  adminNote: String,
  images: [String]
}, { timestamps: true });

module.exports = {
  Review: mongoose.model('Review', reviewSchema),
  Return: mongoose.model('Return', returnSchema)
};
