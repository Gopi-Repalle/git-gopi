const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const { auth, adminAuth } = require('../middleware/auth');

// POST /api/orders - Place order
router.post('/', auth, async (req, res) => {
  try {
    const { items, shippingAddress, payment, couponCode, notes } = req.body;

    // Validate stock and calculate pricing
    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product || !product.isActive) {
        return res.status(400).json({ message: `Product ${item.product} not available` });
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({ message: `Insufficient stock for ${product.name}` });
      }
      subtotal += product.price * item.quantity;
      orderItems.push({
        product: product._id,
        name: product.name,
        image: product.images[0] || '',
        price: product.price,
        quantity: item.quantity
      });
      // Reduce stock
      await Product.findByIdAndUpdate(product._id, { $inc: { stock: -item.quantity } });
    }

    const shipping = subtotal >= 500 ? 0 : 49;
    const total = subtotal + shipping;

    const estimatedDelivery = new Date();
    estimatedDelivery.setDate(estimatedDelivery.getDate() + 5);

    const order = await Order.create({
      user: req.user._id,
      items: orderItems,
      shippingAddress,
      pricing: { subtotal, discount: 0, shipping, total },
      payment: { method: payment.method, status: payment.method === 'cod' ? 'pending' : 'pending', transactionId: payment.transactionId },
      couponCode,
      notes,
      estimatedDelivery,
      tracking: [{ status: 'placed', description: 'Order placed successfully', location: 'Online' }]
    });

    await order.populate('items.product');
    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/orders/my - Get user's orders
router.get('/my', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const orders = await Order.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .populate('items.product', 'name images');
    const total = await Order.countDocuments({ user: req.user._id });
    res.json({ orders, total, page: Number(page) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/orders/track/:orderId - Track by orderId string
router.get('/track/:orderId', async (req, res) => {
  try {
    const order = await Order.findOne({ orderId: req.params.orderId.toUpperCase() })
      .populate('user', 'name email')
      .populate('items.product', 'name images');
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/orders/:id
router.get('/:id', auth, async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, user: req.user._id })
      .populate('items.product');
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/orders/:id/cancel - Cancel order
router.put('/:id/cancel', auth, async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, user: req.user._id });
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (!['placed', 'confirmed'].includes(order.status)) {
      return res.status(400).json({ message: 'Order cannot be cancelled at this stage' });
    }
    order.status = 'cancelled';
    order.tracking.push({ status: 'cancelled', description: 'Order cancelled by customer' });
    await order.save();
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Admin: GET all orders
router.get('/', adminAuth, async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = status ? { status } : {};
    const skip = (Number(page) - 1) * Number(limit);
    const [orders, total] = await Promise.all([
      Order.find(query).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)).populate('user', 'name email phone'),
      Order.countDocuments(query)
    ]);
    res.json({ orders, total, page: Number(page) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Admin: Update order status
router.put('/:id/status', adminAuth, async (req, res) => {
  try {
    const { status, description, location } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      {
        status,
        $push: { tracking: { status, description: description || `Order ${status}`, location: location || '' } },
        ...(status === 'delivered' ? { deliveredAt: new Date(), 'payment.status': 'paid' } : {})
      },
      { new: true }
    ).populate('user', 'name email');
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
