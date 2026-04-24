const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Password strength validator
const validatePassword = (password) => {
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSymbol = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
  const hasMinLength = password.length >= 6;
  return hasLetter && hasNumber && hasMinLength;
};

// POST /api/auth/register
router.post('/register', [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ message: errors.array()[0].msg });

  try {
    const { name, email, password, phone } = req.body;

    // Check password strength
    if (!validatePassword(password)) {
      return res.status(400).json({ message: 'Password must contain letters and numbers (min 6 characters)' });
    }

    // Check email exists
    const emailExists = await User.findOne({ email: email.toLowerCase() });
    if (emailExists) return res.status(400).json({ message: 'This email is already registered. Please login.' });

    // Check phone exists
    if (phone && phone.trim()) {
      const phoneExists = await User.findOne({ phone: phone.trim() });
      if (phoneExists) return res.status(400).json({ message: 'This phone number is already registered with another account.' });
    }

    const user = await User.create({ name, email, password, phone: phone?.trim() || undefined });
    res.status(201).json({ token: generateToken(user._id), user });
  } catch (err) {
    if (err.code === 11000) {
      const field = Object.keys(err.keyPattern)[0];
      if (field === 'email') return res.status(400).json({ message: 'This email is already registered.' });
      if (field === 'phone') return res.status(400).json({ message: 'This phone number is already registered.' });
    }
    res.status(500).json({ message: 'Registration failed. Please try again.' });
  }
});

// POST /api/auth/login
router.post('/login', [
  body('email').isEmail(),
  body('password').notEmpty()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ message: 'Please enter valid email and password' });

  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(401).json({ message: 'No account found with this email. Please register.' });
    if (!user.password) return res.status(401).json({ message: 'This account uses Google login. Please sign in with Google.' });
    if (!(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Incorrect password. Please try again.' });
    }
    res.json({ token: generateToken(user._id), user });
  } catch (err) {
    res.status(500).json({ message: 'Login failed. Please try again.' });
  }
});

// POST /api/auth/google - Google Login
router.post('/google', async (req, res) => {
  try {
    const { credential } = req.body;
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture } = payload;

    // Check if user exists
    let user = await User.findOne({ $or: [{ googleId }, { email }] });

    if (user) {
      // Update googleId if logging in with Google for first time
      if (!user.googleId) {
        user.googleId = googleId;
        user.avatar = picture;
        await user.save();
      }
    } else {
      // Create new user
      user = await User.create({
        name, email, googleId,
        avatar: picture,
        password: undefined
      });
    }

    res.json({ token: generateToken(user._id), user });
  } catch (err) {
    res.status(401).json({ message: 'Google login failed. Please try again.' });
  }
});

// GET /api/auth/me
router.get('/me', auth, async (req, res) => {
  res.json(req.user);
});

// PUT /api/auth/profile
router.put('/profile', auth, async (req, res) => {
  try {
    const { name, phone, addresses } = req.body;

    // Check phone uniqueness if changed
    if (phone && phone.trim()) {
      const phoneExists = await User.findOne({ phone: phone.trim(), _id: { $ne: req.user._id } });
      if (phoneExists) return res.status(400).json({ message: 'This phone number is already used by another account.' });
    }

    const user = await User.findByIdAndUpdate(req.user._id, { name, phone, addresses }, { new: true });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Update failed. Please try again.' });
  }
});

// POST /api/auth/change-password
router.post('/change-password', auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!validatePassword(newPassword)) {
      return res.status(400).json({ message: 'New password must contain letters and numbers (min 6 characters)' });
    }

    const user = await User.findById(req.user._id);
    if (!user.password) return res.status(400).json({ message: 'Google account cannot change password here.' });
    if (!(await user.comparePassword(currentPassword))) {
      return res.status(400).json({ message: 'Current password is incorrect.' });
    }
    user.password = newPassword;
    await user.save();
    res.json({ message: 'Password updated successfully!' });
  } catch (err) {
    res.status(500).json({ message: 'Password change failed.' });
  }
});

module.exports = router;
