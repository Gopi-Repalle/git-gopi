const express = require('express');
const router = express.Router();
const { Review } = require('../models/Review');
const Product = require('../models/Product');
const Order = require('../models/Order');
const { auth } = require('../middleware/auth');

// GET /api/reviews/product/:productId
router.get('/product/:productId', async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const reviews = await Review.find({ product: req.params.productId })
      .populate('user', 'name avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));
    const total = await Review.countDocuments({ product: req.params.productId });
    res.json({ reviews, total });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/reviews - Add review
router.post('/', auth, async (req, res) => {
  try {
    const { product, rating, title, comment, orderId } = req.body;

    // Check if already reviewed
    const existing = await Review.findOne({ product, user: req.user._id });
    if (existing) return res.status(400).json({ message: 'You have already reviewed this product' });

    // Check verified purchase
    let isVerified = false;
    if (orderId) {
      const order = await Order.findOne({ _id: orderId, user: req.user._id, status: 'delivered' });
      if (order) isVerified = true;
    }

    const review = await Review.create({
      product, user: req.user._id, rating, title, comment, isVerifiedPurchase: isVerified
    });

    // Update product average rating
    const allReviews = await Review.find({ product });
    const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
    await Product.findByIdAndUpdate(product, {
      'ratings.average': Math.round(avgRating * 10) / 10,
      'ratings.count': allReviews.length
    });

    await review.populate('user', 'name avatar');
    res.status(201).json(review);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/reviews/:id
router.delete('/:id', auth, async (req, res) => {
  try {
    const review = await Review.findOne({ _id: req.params.id, user: req.user._id });
    if (!review) return res.status(404).json({ message: 'Review not found' });
    await review.deleteOne();
    res.json({ message: 'Review deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
