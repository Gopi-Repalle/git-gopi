import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ProductCard from '../components/ProductCard';
import API from '../utils/api';

const HERO_EMOJIS = ['🌶️', '🔥', '🫚', '✨'];

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/products/featured')
      .then(res => setFeatured(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      {/* Hero Banner */}
      <div className="relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #7B241C 0%, #C0392B 45%, #E67E22 100%)' }}>
        <div className="max-w-7xl mx-auto px-4 py-14 md:py-20 flex flex-col md:flex-row items-center gap-8">
          <div className="flex-1 text-white">
            <div className="inline-block bg-orange-400 text-white text-xs font-bold px-3 py-1 rounded-full mb-4">
              🌱 Direct from Our Farm
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold leading-tight mb-4">
              Pure Chilli Powder.<br />
              <span className="text-orange-300">No Additives. Ever.</span>
            </h1>
            <p className="text-gray-200 text-base md:text-lg mb-6 max-w-md leading-relaxed">
              Grown in our own fields and sourced from trusted farmers across India.
              Zero artificial colour, zero preservatives — just pure fiery flavour.
            </p>
            <div className="flex gap-3 flex-wrap">
              <Link to="/products" className="bg-white text-red-700 hover:bg-orange-50 font-bold px-6 py-3 rounded-sm text-sm transition-colors">
                SHOP NOW
              </Link>
              <Link to="/track" className="border border-white text-white hover:bg-white hover:text-red-700 font-semibold px-6 py-3 rounded-sm text-sm transition-colors">
                TRACK ORDER
              </Link>
            </div>
          </div>
          <div className="hidden md:flex items-center justify-center text-9xl opacity-80">
            🌶️
          </div>
        </div>
      </div>

      {/* Trust Bar */}
      <div className="bg-white border-b border-gray-200 py-3">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-around flex-wrap gap-3">
            {[
              { icon: '✅', text: '100% Pure & Natural' },
              { icon: '🚜', text: 'Direct from Farmers' },
              { icon: '🚚', text: 'Pan-India Delivery' },
              { icon: '↩️', text: '7-Day Easy Returns' },
              { icon: '⭐', text: '4.8 / 5 Rating' },
              { icon: '🔒', text: 'Secure Payments' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-1.5 text-sm font-medium text-gray-600">
                <span>{item.icon}</span>
                <span>{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Heat Level Filter Cards */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Shop by Heat Level</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Mild', emoji: '🟡', color: 'bg-yellow-50 border-yellow-200', textColor: 'text-yellow-700', desc: 'Perfect colour, gentle heat' },
            { label: 'Medium', emoji: '🟠', color: 'bg-orange-50 border-orange-200', textColor: 'text-orange-700', desc: 'Balanced everyday spice' },
            { label: 'Hot', emoji: '🔴', color: 'bg-red-50 border-red-200', textColor: 'text-red-700', desc: 'Bold and fiery kick' },
            { label: 'Very Hot', emoji: '🌋', color: 'bg-red-100 border-red-300', textColor: 'text-red-800', desc: 'Legendary Guntur heat' },
          ].map((h) => (
            <Link
              key={h.label}
              to={`/products?heatLevel=${encodeURIComponent(h.label)}`}
              className={`border ${h.color} rounded-sm p-4 hover:shadow-sm transition-shadow cursor-pointer`}
            >
              <div className="text-2xl mb-1">{h.emoji}</div>
              <div className={`font-bold text-sm ${h.textColor}`}>{h.label}</div>
              <div className="text-xs text-gray-500 mt-0.5">{h.desc}</div>
            </Link>
          ))}
        </div>
      </div>

      {/* Featured Products */}
      <div className="max-w-7xl mx-auto px-4 pb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Featured Products</h2>
          <Link to="/products" className="text-red-600 hover:text-red-700 text-sm font-semibold">
            View All →
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="spinner"></div>
          </div>
        ) : featured.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {featured.map(p => <ProductCard key={p._id} product={p} />)}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <p className="text-4xl mb-3">🌶️</p>
            <p>Products loading... Make sure the backend is running.</p>
            <p className="text-xs mt-2 text-gray-400">Call POST /api/admin/seed with admin token to seed sample products.</p>
          </div>
        )}
      </div>

      {/* How It Works */}
      <div className="bg-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-xl font-bold text-gray-900 text-center mb-8">How FarmSpice Works</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { step: '1', icon: '🌾', title: 'We Grow & Source', desc: 'Chillies grown in our own fields and from verified partner farmers.' },
              { step: '2', icon: '🔬', title: 'Quality Tested', desc: 'Every batch tested for purity. Zero artificial colour — guaranteed.' },
              { step: '3', icon: '📦', title: 'You Order', desc: 'Browse, add to cart, and place your order in under 2 minutes.' },
              { step: '4', icon: '🚚', title: 'Fast Delivery', desc: 'Shipped pan-India with live tracking on every order.' },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-12 h-12 bg-red-600 text-white rounded-full flex items-center justify-center text-lg font-bold mx-auto mb-3">
                  {item.step}
                </div>
                <div className="text-2xl mb-2">{item.icon}</div>
                <h3 className="font-semibold text-sm text-gray-900 mb-1">{item.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
