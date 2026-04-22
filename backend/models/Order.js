const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  name: String,
  image: String,
  price: Number,
  quantity: Number
});

const trackingSchema = new mongoose.Schema({
  status: String,
  description: String,
  timestamp: { type: Date, default: Date.now },
  location: String
});

const orderSchema = new mongoose.Schema({
  orderId: { type: String, unique: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [orderItemSchema],
  shippingAddress: {
    name: String,
    phone: String,
    addressLine1: String,
    addressLine2: String,
    city: String,
    state: String,
    pincode: String
  },
  pricing: {
    subtotal: Number,
    discount: Number,
    shipping: Number,
    total: Number
  },
  payment: {
    method: { type: String, enum: ['razorpay', 'stripe', 'cod'] },
    status: { type: String, enum: ['pending', 'paid', 'failed', 'refunded'], default: 'pending' },
    transactionId: String,
    paidAt: Date
  },
  status: {
    type: String,
    enum: ['placed', 'confirmed', 'packed', 'shipped', 'out_for_delivery', 'delivered', 'cancelled', 'return_requested', 'returned'],
    default: 'placed'
  },
  tracking: [trackingSchema],
  couponCode: String,
  notes: String,
  estimatedDelivery: Date,
  deliveredAt: Date
}, { timestamps: true });

orderSchema.pre('save', async function(next) {
  if (!this.orderId) {
    const count = await mongoose.model('Order').countDocuments();
    this.orderId = `FS-${new Date().getFullYear()}-${String(count + 1).padStart(5, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Order', orderSchema);
