// Cart.js
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useCart } from '../context/CartContext';

export default function Cart() {
  const { cart, removeFromCart, updateQty, cartSubtotal, cartShipping, cartTotal } = useCart();
  const navigate = useNavigate();

  if (cart.length === 0) return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <div className="text-6xl mb-4">🛒</div>
        <h2 className="text-xl font-bold text-gray-700 mb-2">Your cart is empty</h2>
        <p className="text-gray-500 mb-6 text-sm">Add some pure chilli powder to get started!</p>
        <Link to="/products" className="btn-primary">SHOP NOW</Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-6">
        <h1 className="text-xl font-bold text-gray-900 mb-4">My Cart ({cart.length} items)</h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Items */}
          <div className="lg:col-span-2 space-y-3">
            {cart.map(item => (
              <div key={item._id} className="card p-4 flex gap-4">
                <img
                  src={item.images?.[0] || 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=100'}
                  alt={item.name}
                  className="w-20 h-20 object-cover rounded-sm"
                  onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=100'; }}
                />
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 text-sm">{item.name}</h3>
                  <p className="text-xs text-gray-400 mt-0.5">{item.specs?.weight} | {item.specs?.heatLevel}</p>
                  <p className="text-base font-bold text-gray-900 mt-1">₹{item.price}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <div className="flex items-center border border-gray-300 rounded-sm">
                      <button onClick={() => updateQty(item._id, item.qty - 1)} className="px-2 py-1 text-gray-600 hover:bg-gray-100 font-bold text-sm">−</button>
                      <span className="px-3 py-1 text-sm font-semibold border-x border-gray-300">{item.qty}</span>
                      <button onClick={() => updateQty(item._id, item.qty + 1)} className="px-2 py-1 text-gray-600 hover:bg-gray-100 font-bold text-sm">+</button>
                    </div>
                    <button onClick={() => removeFromCart(item._id)} className="text-xs text-red-600 hover:underline">Remove</button>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900">₹{item.price * item.qty}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="card p-5 h-fit">
            <h2 className="font-bold text-gray-700 text-sm uppercase tracking-wide mb-4">Price Details</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Price ({cart.reduce((s, i) => s + i.qty, 0)} items)</span>
                <span>₹{cartSubtotal}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Delivery Charges</span>
                <span className={cartShipping === 0 ? 'text-green-600 font-medium' : ''}>{cartShipping === 0 ? 'FREE' : `₹${cartShipping}`}</span>
              </div>
              {cartShipping > 0 && (
                <p className="text-xs text-orange-600">Add ₹{500 - cartSubtotal} more for free delivery!</p>
              )}
              <div className="border-t pt-2 flex justify-between font-bold text-gray-900 text-base">
                <span>Total Amount</span>
                <span>₹{cartTotal}</span>
              </div>
            </div>
            <button
              onClick={() => navigate('/checkout')}
              className="w-full btn-primary mt-4 text-center py-3"
            >
              PLACE ORDER
            </button>
            <p className="text-center text-xs text-gray-400 mt-2">🔒 Safe and Secure Payments</p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
