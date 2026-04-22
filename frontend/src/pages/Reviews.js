import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import API from '../utils/api';
import toast from 'react-hot-toast';

export default function Reviews() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [form, setForm] = useState({ rating: 5, title: '', comment: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    API.get(`/products/${productId}`).then(r => setProduct(r.data)).catch(() => {});
    API.get(`/reviews/product/${productId}`).then(r => setReviews(r.data.reviews || [])).catch(() => {});
  }, [productId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await API.post('/reviews', { ...form, product: productId });
      setReviews(prev => [res.data, ...prev]);
      toast.success('Review submitted! Thank you ⭐');
      setForm({ rating: 5, title: '', comment: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-8">
        <button onClick={() => navigate(-1)} className="text-sm text-red-600 mb-4 flex items-center gap-1">← Back</button>
        {product && <h1 className="text-xl font-bold text-gray-900 mb-1">Reviews for {product.name}</h1>}

        {/* Write review */}
        <div className="card p-5 mb-6">
          <h2 className="font-bold text-gray-700 mb-4">Write a Review</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Your Rating</label>
              <div className="flex gap-2">
                {[1,2,3,4,5].map(n => (
                  <button key={n} type="button" onClick={() => setForm({ ...form, rating: n })}
                    className={`text-2xl transition-transform hover:scale-110 ${n <= form.rating ? 'text-yellow-400' : 'text-gray-300'}`}>★</button>
                ))}
              </div>
            </div>
            <div>
              <label className="label">Title (optional)</label>
              <input className="input" placeholder="Summarize your review" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
            </div>
            <div>
              <label className="label">Your Review *</label>
              <textarea className="input h-24 resize-none" placeholder="Share your experience with this product..." value={form.comment} onChange={e => setForm({ ...form, comment: e.target.value })} required />
            </div>
            <button type="submit" disabled={loading} className="btn-primary">{loading ? 'Submitting...' : 'Submit Review'}</button>
          </form>
        </div>

        {/* Reviews list */}
        <h2 className="font-bold text-gray-800 mb-3">All Reviews ({reviews.length})</h2>
        {reviews.length === 0 ? (
          <div className="card p-8 text-center text-gray-500">No reviews yet. Be the first!</div>
        ) : (
          <div className="space-y-3">
            {reviews.map(r => (
              <div key={r._id} className="card p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-green-600 text-white text-xs px-1.5 py-0.5 rounded-sm font-semibold">{r.rating} ★</span>
                  <span className="font-semibold text-sm">{r.user?.name || 'Customer'}</span>
                  {r.isVerifiedPurchase && <span className="text-xs text-green-600 bg-green-50 px-1.5 py-0.5 rounded-sm">✓ Verified</span>}
                  <span className="text-xs text-gray-400 ml-auto">{new Date(r.createdAt).toLocaleDateString('en-IN')}</span>
                </div>
                {r.title && <p className="font-medium text-sm text-gray-800 mb-1">{r.title}</p>}
                <p className="text-sm text-gray-600 leading-relaxed">{r.comment}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
