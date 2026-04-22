/**
 * Run this script ONCE to create your admin user.
 * Usage: node backend/scripts/createAdmin.js
 */

require('dotenv').config({ path: './backend/.env' });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

async function createAdmin() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  // Import User model
  const User = require('./backend/models/User');

  const email = 'admin@farmspice.in';  // Change this
  const password = 'Admin@123';         // Change this!
  const name = 'FarmSpice Admin';

  const existing = await User.findOne({ email });
  if (existing) {
    existing.role = 'admin';
    await existing.save();
    console.log('✅ Existing user promoted to admin:', email);
  } else {
    await User.create({ name, email, password, role: 'admin' });
    console.log('✅ Admin user created:', email);
  }

  await mongoose.disconnect();
  process.exit(0);
}

createAdmin().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
