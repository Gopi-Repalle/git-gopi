import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-gray-800 text-gray-300 mt-12">
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">🌶️</span>
              <span className="text-white font-bold text-lg">FarmSpice</span>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
              Pure chilli powder sourced directly from Indian farmers. No additives, no middlemen, no compromise.
            </p>
            <p className="text-xs text-gray-400 mt-2">FSSAI Certified | Made in India 🇮🇳</p>
          </div>

          <div>
            <h4 className="text-white font-semibold text-sm mb-3">Shop</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/products" className="hover:text-white transition-colors">All Products</Link></li>
              <li><Link to="/products?heatLevel=Mild" className="hover:text-white transition-colors">Mild Chilli</Link></li>
              <li><Link to="/products?heatLevel=Hot" className="hover:text-white transition-colors">Hot Chilli</Link></li>
              <li><Link to="/products?heatLevel=Very Hot" className="hover:text-white transition-colors">Extra Hot</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold text-sm mb-3">Help</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/track" className="hover:text-white transition-colors">Track Order</Link></li>
              <li><Link to="/my-orders" className="hover:text-white transition-colors">My Orders</Link></li>
              <li><Link to="/profile" className="hover:text-white transition-colors">My Account</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold text-sm mb-3">Contact</h4>
            <ul className="space-y-2 text-xs text-gray-400">
              <li>📧 support@farmspice.in</li>
              <li>📞 +91 98765 43210</li>
              <li>📍 Guntur, Telangana, India</li>
              <li className="text-gray-500">Mon–Sat, 9AM–6PM</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 pt-6 flex flex-col md:flex-row justify-between items-center gap-3">
          <p className="text-xs text-gray-500">© 2024 FarmSpice. All rights reserved.</p>
          <div className="flex items-center gap-4 text-xs text-gray-400">
            <span>🔒 Secure Payments</span>
            <span>✅ Quality Guaranteed</span>
            <span>🚚 Pan-India Delivery</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
