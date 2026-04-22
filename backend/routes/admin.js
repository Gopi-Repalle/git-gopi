const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Order = require('../models/Order');
const Product = require('../models/Product');
const { Review } = require('../models/Review');
const { adminAuth } = require('../middleware/auth');

// GET /api/admin/dashboard
router.get('/dashboard', adminAuth, async (req, res) => {
  try {
    const [
      totalOrders, totalRevenue, totalCustomers, totalProducts,
      recentOrders, ordersByStatus
    ] = await Promise.all([
      Order.countDocuments(),
      Order.aggregate([{ $group: { _id: null, total: { $sum: '$pricing.total' } } }]),
      User.countDocuments({ role: 'customer' }),
      Product.countDocuments({ isActive: true }),
      Order.find().sort({ createdAt: -1 }).limit(5).populate('user', 'name email'),
      Order.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }])
    ]);

    // Monthly revenue (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const monthlyRevenue = await Order.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo }, 'payment.status': 'paid' } },
      { $group: { _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } }, revenue: { $sum: '$pricing.total' }, orders: { $sum: 1 } } },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    res.json({
      stats: {
        totalOrders,
        totalRevenue: totalRevenue[0]?.total || 0,
        totalCustomers,
        totalProducts
      },
      recentOrders,
      ordersByStatus,
      monthlyRevenue
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/admin/customers
router.get('/customers', adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const query = { role: 'customer' };
    if (search) query.$or = [{ name: new RegExp(search, 'i') }, { email: new RegExp(search, 'i') }];

    const skip = (Number(page) - 1) * Number(limit);
    const [customers, total] = await Promise.all([
      User.find(query).select('-password').sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      User.countDocuments(query)
    ]);

    // Enrich with order stats
    const enriched = await Promise.all(customers.map(async (c) => {
      const orderStats = await Order.aggregate([
        { $match: { user: c._id } },
        { $group: { _id: null, count: { $sum: 1 }, total: { $sum: '$pricing.total' } } }
      ]);
      return {
        ...c.toObject(),
        orderCount: orderStats[0]?.count || 0,
        totalSpent: orderStats[0]?.total || 0
      };
    }));

    res.json({ customers: enriched, total, page: Number(page) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/admin/seed - Seed sample products (run once)
router.post('/seed', adminAuth, async (req, res) => {
  try {
    const existing = await Product.countDocuments();
    if (existing > 0) return res.json({ message: 'Products already seeded' });

    const products = [
      {
        name: 'Kashmiri Chilli Powder',
        description: 'Vibrant deep red Kashmiri chilli powder grown in our own farms. Adds brilliant colour without extreme heat. Sun-dried naturally and stone-ground fresh. Absolutely zero artificial colour.',
        shortDescription: 'Deep red, mild heat, rich colour for curries',
        price: 149, originalPrice: 199, discount: 25,
        farmer: { name: 'FarmSpice Own Farm', location: 'Guntur, Telangana', verified: true },
        specs: { weight: '200g', heatLevel: 'Mild', origin: 'Guntur, Telangana', process: 'Sun-dried, Stone-ground', shelfLife: '12 months', certifications: ['FSSAI', 'Organic India'] },
        stock: 500, isActive: true, isFeatured: true, badge: 'Best Seller',
        images: ['https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400']
      },
      {
        name: 'Guntur Hot Chilli Powder',
        description: 'The legendary Guntur heat in pure powder form. Made from S4 grade Guntur chillies grown in our own fields. This is the real deal — no mixing, no fillers, no artificial colour.',
        shortDescription: 'Authentic Guntur heat, no additives',
        price: 179, originalPrice: 229, discount: 22,
        farmer: { name: 'FarmSpice Own Farm', location: 'Guntur, Telangana', verified: true },
        specs: { weight: '200g', heatLevel: 'Very Hot', origin: 'Guntur, Telangana', process: 'Sun-dried, Stone-ground', shelfLife: '12 months', certifications: ['FSSAI'] },
        stock: 400, isActive: true, isFeatured: true, badge: 'Farm Fresh',
        images: ['https://images.unsplash.com/photo-1601648764658-cf37e8c89b70?w=400']
      },
      {
        name: 'Byadgi Chilli Powder',
        description: 'Prized Byadgi chilli from Karnataka — known globally for deep red colour and medium heat. Sourced directly from a partner farmer family we have worked with for 3 years.',
        shortDescription: 'Karnataka special, deep colour, medium heat',
        price: 189, originalPrice: 249, discount: 24,
        farmer: { name: 'Ramesh Hegde Farm', location: 'Dharwad, Karnataka', verified: true },
        specs: { weight: '200g', heatLevel: 'Medium', origin: 'Dharwad, Karnataka', process: 'Sun-dried, Stone-ground', shelfLife: '12 months', certifications: ['FSSAI'] },
        stock: 300, isActive: true, isFeatured: true, badge: 'Premium',
        images: ['https://images.unsplash.com/photo-1588168333986-5078d3ae3976?w=400']
      },
      {
        name: 'Signature Blend Chilli Powder',
        description: 'Our signature blend of Kashmiri and Guntur chillies — the perfect balance of colour and heat for everyday Indian cooking. Best of both worlds in one pack.',
        shortDescription: 'Perfect colour + heat balance for everyday use',
        price: 129, originalPrice: 169, discount: 24,
        farmer: { name: 'FarmSpice Own Farm', location: 'Guntur, Telangana', verified: true },
        specs: { weight: '200g', heatLevel: 'Medium', origin: 'Telangana Blend', process: 'Cold-blended', shelfLife: '12 months', certifications: ['FSSAI'] },
        stock: 600, isActive: true, isFeatured: true, badge: 'New',
        images: ['https://images.unsplash.com/photo-1599909533731-a50946a37a26?w=400']
      }
    ];

    await Product.insertMany(products);
    res.json({ message: '4 products seeded successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
