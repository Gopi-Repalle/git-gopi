const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');

// POST /api/payment/razorpay/create-order
router.post('/razorpay/create-order', auth, async (req, res) => {
  try {
    const Razorpay = require('razorpay');
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET
    });

    const { amount } = req.body; // amount in paise
    const options = {
      amount: Math.round(amount * 100),
      currency: 'INR',
      receipt: `receipt_${Date.now()}`
    };

    const order = await razorpay.orders.create(options);
    res.json({ orderId: order.id, amount: order.amount, currency: order.currency, key: process.env.RAZORPAY_KEY_ID });
  } catch (err) {
    res.status(500).json({ message: 'Payment initialization failed', error: err.message });
  }
});

// POST /api/payment/razorpay/verify
router.post('/razorpay/verify', auth, async (req, res) => {
  try {
    const crypto = require('crypto');
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const sign = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSign = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(sign).digest('hex');

    if (expectedSign !== razorpay_signature) {
      return res.status(400).json({ message: 'Payment verification failed' });
    }

    res.json({ verified: true, paymentId: razorpay_payment_id });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/payment/stripe/create-intent
router.post('/stripe/create-intent', auth, async (req, res) => {
  try {
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    const { amount } = req.body;

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: 'inr',
      metadata: { userId: req.user._id.toString() }
    });

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
