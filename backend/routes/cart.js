// cart.js
const express = require('express');
const router = express.Router();

// Cart is stored on frontend (localStorage). This route is a placeholder for server-side cart if needed.
router.get('/', (req, res) => res.json({ message: 'Cart is managed on client side' }));

module.exports = router;
