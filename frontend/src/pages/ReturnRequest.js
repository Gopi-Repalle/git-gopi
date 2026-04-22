import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import API from '../utils/api';
import toast from 'react-hot-toast';

export default function ReturnRequest() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ reason: '', description: '', resolution: 'refund' });
  const [loading, setLoading] = useState(false);

  const reasons = ['Product quality not as expected', 'Wrong product delivered', 'Product damaged in transit', 'Product not delivered', 'Other'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.reason) { toast.error('Please select a reason'); return; }
    setLoading(true);
    try {
      await API.post('/returns', { orderId, ...form });
      toast.success('Return request submitted! We\'ll contact you in 24 hours.');
      navigate('/my-orders');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit return request');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="max-w-lg mx-auto px-4 py-8">
        <button onClick={() => navigate(-1)} className="text-sm text-red-600 mb-4">← Back to Orders</button>
        <div className="card p-6">
          <h1 className="text-xl font-bold text-gray-900 mb-1">Request Return / Refund</h1>
          <p className="text-sm text-gray-500 mb-5">Returns accepted within 7 days of delivery.</p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Reason for Return *</label>
              <select className="input" value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })} required>
                <option value="">Select a reason</option>
                {reasons.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Additional Details</label>
              <textarea className="input h-20 resize-none" placeholder="Describe the issue in detail..." value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
            </div>
            <div>
              <label className="label">Preferred Resolution</label>
              <select className="input" value={form.resolution} onChange={e => setForm({ ...form, resolution: e.target.value })}>
                <option value="refund">Full Refund</option>
                <option value="replacement">Replacement Product</option>
                <option value="partial_refund">Partial Refund</option>
              </select>
            </div>
            <div className="bg-orange-50 border border-orange-200 rounded-sm p-3 text-xs text-orange-700">
              ⚠️ Our team will review your request within 24 hours and contact you via phone/email.
            </div>
            <button type="submit" disabled={loading} className="w-full btn-primary py-3">{loading ? 'Submitting...' : 'Submit Return Request'}</button>
          </form>
        </div>
      </div>
    </div>
  );
}
