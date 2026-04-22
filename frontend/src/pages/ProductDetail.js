import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import API from '../utils/api';
import toast from 'react-hot-toast';

const PLACEHOLDER = 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=600';

export default function ProductDetail() {
  const { id } = useParams();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [selectedImg, setSelectedImg] = useState(0);
  const [activeTab, setActiveTab] = useState('description');

  useEffect(() => {
    Promise.all([
      API.get(`/products/${id}`),
      API.get(`/reviews/product/${id}?limit=5`)
    ])
      .then(([pRes, rRes]) => {
        setProduct(pRes.data);
        setReviews(rRes.data.reviews || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="flex justify-center items-center h-64"><div className="spinner"></div></div>
    </div>
  );

  if (!product) return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="text-center py-20"><p className="text-gray-500">Product not found</p></div>
    </div>
  );

  const discountPct = product.discount || (product.originalPrice > product.price
    ? Math.round((product.originalPrice - product.price) / product.originalPrice * 100) : 0);

  const handleAddToCart = () => {
    for (let i = 0; i < qty; i++) addToCart(product);
    toast.success(`Added ${qty} item(s) to cart!`, { icon: '🛒' });
  };

  const handleBuyNow = () => {
    if (!user) return navigate('/login');
    for (let i = 0; i < qty; i++) addToCart(product);
    navigate('/cart');
  };

  const images = product.images?.length > 0 ? product.images : [PLACEHOLDER];

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-2 text-xs text-gray-500">
          <Link to="/" className="hover:text-red-600">Home</Link> &gt;
          <Link to="/products" className="hover:text-red-600 mx-1">Products</Link> &gt;
          <span className="text-gray-900">{product.name}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Images */}
          <div className="card p-4">
            <div className="flex gap-3">
              <div className="flex flex-col gap-2">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImg(i)}
                    className={`w-14 h-14 border-2 rounded-sm overflow-hidden ${selectedImg === i ? 'border-red-600' : 'border-gray-200'}`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" onError={(e) => { e.target.src = PLACEHOLDER; }} />
                  </button>
                ))}
              </div>
              <div className="flex-1 relative">
                <img
                  src={images[selectedImg]}
                  alt={product.name}
                  className="w-full h-80 object-contain"
                  onError={(e) => { e.target.src = PLACEHOLDER; }}
                />
                {discountPct > 0 && (
                  <span className="absolute top-2 right-2 bg-green-500 text-white text-sm font-bold px-2 py-1 rounded-sm">
                    {discountPct}% OFF
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Product Info */}
          <div className="card p-5">
            <h1 className="text-xl font-bold text-gray-900 mb-1">{product.name}</h1>

            {product.farmer?.name && (
              <p className="text-sm text-green-700 mb-2">
                🌱 {product.farmer.name} — {product.farmer.location}
                {product.farmer.verified && <span className="ml-1 bg-green-100 text-green-700 text-xs px-1.5 py-0.5 rounded-sm">✓ Verified</span>}
              </p>
            )}

            {product.ratings?.count > 0 && (
              <div className="flex items-center gap-2 mb-3 pb-3 border-b">
                <span className="bg-green-600 text-white text-xs px-1.5 py-0.5 rounded-sm font-semibold">{product.ratings.average} ★</span>
                <span className="text-sm text-gray-500">{product.ratings.count} ratings</span>
              </div>
            )}

            <div className="mb-4">
              <span className="text-3xl font-bold text-gray-900">₹{product.price}</span>
              {product.originalPrice > product.price && (
                <>
                  <span className="text-base text-gray-400 line-through ml-2">₹{product.originalPrice}</span>
                  <span className="text-base text-green-600 font-semibold ml-2">{discountPct}% off</span>
                </>
              )}
            </div>

            {product.badge && (
              <span className="inline-block bg-red-100 text-red-700 text-xs font-semibold px-2 py-1 rounded-sm mb-3">{product.badge}</span>
            )}

            {/* Specs */}
            <div className="bg-gray-50 rounded-sm p-3 mb-4 text-sm">
              <table className="w-full">
                <tbody>
                  {product.specs?.heatLevel && <tr><td className="text-gray-500 py-1 pr-4 w-28">Heat Level</td><td className="font-medium">{product.specs.heatLevel}</td></tr>}
                  {product.specs?.weight && <tr><td className="text-gray-500 py-1">Weight</td><td className="font-medium">{product.specs.weight}</td></tr>}
                  {product.specs?.origin && <tr><td className="text-gray-500 py-1">Origin</td><td className="font-medium">{product.specs.origin}</td></tr>}
                  {product.specs?.shelfLife && <tr><td className="text-gray-500 py-1">Shelf Life</td><td className="font-medium">{product.specs.shelfLife}</td></tr>}
                </tbody>
              </table>
            </div>

            {/* Quantity */}
            <div className="flex items-center gap-4 mb-4">
              <span className="text-sm font-medium text-gray-700">Quantity:</span>
              <div className="flex items-center border border-gray-300 rounded-sm">
                <button onClick={() => setQty(q => Math.max(1, q - 1))} className="px-3 py-1.5 text-gray-600 hover:bg-gray-100 font-bold">−</button>
                <span className="px-4 py-1.5 text-sm font-semibold border-x border-gray-300">{qty}</span>
                <button onClick={() => setQty(q => Math.min(10, q + 1))} className="px-3 py-1.5 text-gray-600 hover:bg-gray-100 font-bold">+</button>
              </div>
              {product.stock > 0 ? (
                <span className="text-xs text-green-600 font-medium">✓ In Stock ({product.stock} left)</span>
              ) : (
                <span className="text-xs text-red-600 font-medium">✗ Out of Stock</span>
              )}
            </div>

            <div className="flex gap-3">
              <button onClick={handleAddToCart} disabled={product.stock === 0} className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 text-white font-bold py-3 rounded-sm text-sm transition-colors">
                ADD TO CART
              </button>
              <button onClick={handleBuyNow} disabled={product.stock === 0} className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-300 text-white font-bold py-3 rounded-sm text-sm transition-colors">
                BUY NOW
              </button>
            </div>

            <div className="mt-4 pt-4 border-t grid grid-cols-3 gap-3 text-center">
              {[['🚚', 'Free Delivery', '₹500+'], ['↩️', 'Easy Returns', '7 Days'], ['✅', 'Genuine', '100% Pure']].map(([icon, title, sub]) => (
                <div key={title}>
                  <div className="text-xl mb-0.5">{icon}</div>
                  <div className="text-xs font-semibold text-gray-700">{title}</div>
                  <div className="text-xs text-gray-400">{sub}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tabs: Description / Reviews */}
        <div className="card mt-6">
          <div className="flex border-b">
            {['description', 'specs', 'reviews'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 text-sm font-semibold capitalize transition-colors ${activeTab === tab ? 'text-red-600 border-b-2 border-red-600' : 'text-gray-500 hover:text-gray-700'}`}
              >
                {tab === 'reviews' ? `Reviews (${product.ratings?.count || 0})` : tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          <div className="p-5">
            {activeTab === 'description' && (
              <p className="text-gray-700 text-sm leading-relaxed">{product.description}</p>
            )}
            {activeTab === 'specs' && (
              <table className="text-sm w-full max-w-md">
                <tbody>
                  {product.specs && Object.entries(product.specs).map(([k, v]) => (
                    Array.isArray(v) ? (
                      <tr key={k} className="border-b border-gray-100">
                        <td className="py-2 pr-6 text-gray-500 capitalize w-40">{k.replace(/([A-Z])/g, ' $1')}</td>
                        <td className="py-2 font-medium text-gray-800">{v.join(', ')}</td>
                      </tr>
                    ) : (
                      <tr key={k} className="border-b border-gray-100">
                        <td className="py-2 pr-6 text-gray-500 capitalize w-40">{k.replace(/([A-Z])/g, ' $1')}</td>
                        <td className="py-2 font-medium text-gray-800">{v}</td>
                      </tr>
                    )
                  ))}
                </tbody>
              </table>
            )}
            {activeTab === 'reviews' && (
              <div>
                {reviews.length === 0 ? (
                  <p className="text-gray-500 text-sm">No reviews yet. Be the first!</p>
                ) : (
                  <div className="space-y-4">
                    {reviews.map(r => (
                      <div key={r._id} className="border-b pb-4">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="bg-green-600 text-white text-xs px-1.5 py-0.5 rounded-sm">{r.rating} ★</span>
                          <span className="font-semibold text-sm">{r.user?.name || 'Customer'}</span>
                          {r.isVerifiedPurchase && <span className="text-xs text-green-600">✓ Verified Purchase</span>}
                        </div>
                        <p className="text-sm text-gray-700">{r.comment}</p>
                        <p className="text-xs text-gray-400 mt-1">{new Date(r.createdAt).toLocaleDateString('en-IN')}</p>
                      </div>
                    ))}
                  </div>
                )}
                {user && (
                  <Link to={`/reviews/${id}`} className="mt-4 inline-block btn-outline text-xs">
                    Write a Review
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
