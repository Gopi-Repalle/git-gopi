import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';

const PLACEHOLDER = 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();

  const handleAdd = (e) => {
    e.preventDefault();
    addToCart(product);
    toast.success('Added to cart!', { icon: '🛒' });
  };

  const discountPct = product.discount || (product.originalPrice > product.price
    ? Math.round((product.originalPrice - product.price) / product.originalPrice * 100)
    : 0);

  const stars = Math.round(product.ratings?.average || 0);

  return (
    <Link to={`/products/${product._id}`} className="card hover:shadow-md transition-shadow duration-200 flex flex-col group">
      {/* Image */}
      <div className="relative overflow-hidden bg-gray-50 h-44">
        <img
          src={product.images?.[0] || PLACEHOLDER}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => { e.target.src = PLACEHOLDER; }}
        />
        {product.badge && (
          <span className="absolute top-2 left-2 bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded-sm">
            {product.badge}
          </span>
        )}
        {discountPct > 0 && (
          <span className="absolute top-2 right-2 bg-green-500 text-white text-xs font-bold px-2 py-0.5 rounded-sm">
            {discountPct}% OFF
          </span>
        )}
      </div>

      {/* Info */}
      <div className="p-3 flex flex-col flex-1">
        <h3 className="text-sm font-medium text-gray-900 line-clamp-2 mb-1 group-hover:text-red-600 transition-colors">
          {product.name}
        </h3>

        {product.farmer?.name && (
          <p className="text-xs text-green-700 mb-1.5">🌱 {product.farmer.name}
            {product.farmer.verified && <span className="ml-1 text-green-600">✓</span>}
          </p>
        )}

        {/* Rating */}
        {product.ratings?.count > 0 && (
          <div className="flex items-center gap-1 mb-2">
            <span className="bg-green-600 text-white text-xs px-1.5 py-0.5 rounded-sm font-semibold flex items-center gap-0.5">
              {product.ratings.average} ★
            </span>
            <span className="text-xs text-gray-400">({product.ratings.count})</span>
          </div>
        )}

        <div className="mt-auto">
          {/* Price */}
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-base font-bold text-gray-900">₹{product.price}</span>
            {product.originalPrice > product.price && (
              <span className="text-xs text-gray-400 line-through">₹{product.originalPrice}</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleAdd}
              className="flex-1 bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold py-2 rounded-sm transition-colors"
            >
              ADD TO CART
            </button>
          </div>

          {product.specs?.weight && (
            <p className="text-xs text-gray-400 mt-1.5">{product.specs.weight} | {product.specs.heatLevel}</p>
          )}
        </div>
      </div>
    </Link>
  );
}
