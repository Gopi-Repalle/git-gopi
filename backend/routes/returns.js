const express = require('express');
const router = express.Router();
const { Return } = require('../models/Review');
const Order = require('../models/Order');
const { auth, adminAuth } = require('../middleware/auth');

// POST /api/returns
router.post('/', auth, async (req, res) => {
  try {
    const { orderId, reason, description, resolution } = req.body;
    const order = await Order.findOne({ _id: orderId, user: req.user._id });
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (!['delivered'].includes(order.status)) {
      return res.status(400).json({ message: 'Returns can only be requested for delivered orders' });
    }

    const existingReturn = await Return.findOne({ order: orderId });
    if (existingReturn) return res.status(400).json({ message: 'Return already requested for this order' });

    const returnReq = await Return.create({
      order: orderId, user: req.user._id, reason, description, resolution
    });

    await Order.findByIdAndUpdate(orderId, { status: 'return_requested' });
    res.status(201).json(returnReq);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/returns/my
router.get('/my', auth, async (req, res) => {
  try {
    const returns = await Return.find({ user: req.user._id })
      .populate('order', 'orderId items pricing')
      .sort({ createdAt: -1 });
    res.json(returns);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Admin: GET all returns
router.get('/', adminAuth, async (req, res) => {
  try {
    const returns = await Return.find()
      .populate('user', 'name email')
      .populate('order', 'orderId pricing')
      .sort({ createdAt: -1 });
    res.json(returns);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Admin: Update return status
router.put('/:id', adminAuth, async (req, res) => {
  try {
    const { status, adminNote } = req.body;
    const returnReq = await Return.findByIdAndUpdate(
      req.params.id, { status, adminNote }, { new: true }
    );
    if (status === 'approved') {
      await Order.findByIdAndUpdate(returnReq.order, { status: 'returned' });
    }
    res.json(returnReq);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
