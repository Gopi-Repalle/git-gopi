const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { adminAuth } = require('../middleware/auth');
const cloudinary = require('cloudinary').v2;
const multer = require('multer');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = multer.memoryStorage();
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

// GET /api/products - Get all products
router.get('/', async (req, res) => {
  try {
    const { search, category, heatLevel, minPrice, maxPrice, sort, page = 1, limit = 12 } = req.query;
    const query = { isActive: true };

    if (search) query.$text = { $search: search };
    if (category) query.category = category;
    if (heatLevel) query['specs.heatLevel'] = heatLevel;
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    let sortObj = { createdAt: -1 };
    if (sort === 'price_asc') sortObj = { price: 1 };
    if (sort === 'price_desc') sortObj = { price: -1 };
    if (sort === 'rating') sortObj = { 'ratings.average': -1 };
    if (sort === 'popular') sortObj = { 'ratings.count': -1 };

    const skip = (Number(page) - 1) * Number(limit);
    const [products, total] = await Promise.all([
      Product.find(query).sort(sortObj).skip(skip).limit(Number(limit)),
      Product.countDocuments(query)
    ]);

    res.json({ products, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/products/featured
router.get('/featured', async (req, res) => {
  try {
    const products = await Product.find({ isActive: true, isFeatured: true }).limit(8);
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/products/:id
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/products - Admin: create product
router.post('/', adminAuth, upload.array('images', 5), async (req, res) => {
  try {
    const data = JSON.parse(req.body.data || '{}');
    const imageUrls = [];

    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const b64 = file.buffer.toString('base64');
        const dataUri = `data:${file.mimetype};base64,${b64}`;
        const result = await cloudinary.uploader.upload(dataUri, { folder: 'farmspice' });
        imageUrls.push(result.secure_url);
      }
    }

    const product = await Product.create({ ...data, images: imageUrls });
    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/products/:id - Admin: update product
router.put('/:id', adminAuth, upload.array('images', 5), async (req, res) => {
  try {
    const data = JSON.parse(req.body.data || req.body.toString() || '{}');
    const imageUrls = [...(data.existingImages || [])];

    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const b64 = file.buffer.toString('base64');
        const dataUri = `data:${file.mimetype};base64,${b64}`;
        const result = await cloudinary.uploader.upload(dataUri, { folder: 'farmspice' });
        imageUrls.push(result.secure_url);
      }
    }

    if (imageUrls.length > 0) data.images = imageUrls;
    const product = await Product.findByIdAndUpdate(req.params.id, data, { new: true });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/products/:id - Admin
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    await Product.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
