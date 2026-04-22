import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import API from '../utils/api';

export function OrderSuccess() {
  const { orderId } = useParams();
  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <div className="card p-10">
          <div className="text-6xl mb-4">🎉</div>
          <h1 className="text-2xl font-bold text-green-600 mb-2">Order Placed Successfully!</h1>
          <p className="text-gray-500 text-sm mb-4 leading-relaxed">
            Thank you! Your order has been confirmed. We'll pack it fresh from our farm and dispatch within 24 hours.
          </p>
          <div className="bg-gray-50 rounded-sm p-4 mb-6">
            <p className="text-xs text-gray-500 mb-1">Your Order ID</p>
            <p className="text-xl font-bold text-red-700 tracking-widest">{orderId}</p>
          </div>
          <div className="flex flex-col gap-3">
            <Link to={`/track?id=${orderId}`} className="btn-primary py-3">TRACK MY ORDER 📦</Link>
            <Link to="/products" className="btn-outline py-3">CONTINUE SHOPPING</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export function OrderTracking() {
  const [orderId, setOrderId] = useState(new URLSearchParams(window.location.search).get('id') || '');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const track = async () => {
    if (!orderId.trim()) return;
    setLoading(true); setError(''); setOrder(null);
    try {
      const res = await API.get(`/orders/track/${orderId.trim().toUpperCase()}`);
      setOrder(res.data);
    } catch {
      setError('Order not found. Please check the Order ID.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (orderId) track(); }, []);

  const statusSteps = ['placed', 'confirmed', 'packed', 'shipped', 'out_for_delivery', 'delivered'];
  const statusLabels = { placed: 'Order Placed', confirmed: 'Confirmed', packed: 'Packed', shipped: 'Shipped', out_for_delivery: 'Out for Delivery', delivered: 'Delivered' };
  const statusIcons = { placed: '✅', confirmed: '🏭', packed: '📦', shipped: '🚚', out_for_delivery: '🏍️', delivered: '🏠' };

  const currentIdx = order ? statusSteps.indexOf(order.status) : -1;

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-xl font-bold text-gray-900 mb-6">Track Your Order</h1>
        <div className="card p-5 mb-6">
          <div className="flex gap-3">
            <input
              className="input flex-1" placeholder="Enter Order ID (e.g. FS-2024-00001)"
              value={orderId} onChange={e => setOrderId(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && track()}
            />
            <button onClick={track} disabled={loading} className="btn-primary px-6">
              {loading ? '...' : 'TRACK'}
            </button>
          </div>
          {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
        </div>

        {order && (
          <div className="space-y-4">
            {/* Status Timeline */}
            <div className="card p-5">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <p className="text-xs text-gray-500">Order ID</p>
                  <p className="font-bold text-red-700 text-lg">{order.orderId}</p>
                </div>
                <span className={`text-xs font-bold px-3 py-1 rounded-full ${order.status === 'delivered' ? 'bg-green-100 text-green-700' : order.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}>
                  {statusLabels[order.status] || order.status}
                </span>
              </div>

              {!['cancelled', 'return_requested', 'returned'].includes(order.status) && (
                <div className="flex items-center justify-between mb-6 overflow-x-auto pb-2">
                  {statusSteps.map((s, i) => (
                    <div key={s} className="flex items-center">
                      <div className="flex flex-col items-center">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg border-2 ${i <= currentIdx ? 'bg-green-500 border-green-500 text-white' : 'bg-white border-gray-300 text-gray-400'}`}>
                          {i <= currentIdx ? '✓' : statusIcons[s]}
                        </div>
                        <p className={`text-xs mt-1 text-center w-16 ${i <= currentIdx ? 'text-green-700 font-medium' : 'text-gray-400'}`}>{statusLabels[s]}</p>
                      </div>
                      {i < statusSteps.length - 1 && (
                        <div className={`h-0.5 w-8 mx-1 mb-5 ${i < currentIdx ? 'bg-green-500' : 'bg-gray-200'}`} />
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Tracking history */}
              {order.tracking?.length > 0 && (
                <div>
                  <h3 className="font-semibold text-sm text-gray-700 mb-3">Tracking History</h3>
                  <div className="space-y-3">
                    {[...order.tracking].reverse().map((t, i) => (
                      <div key={i} className="flex gap-3">
                        <div className="flex flex-col items-center">
                          <div className={`w-2.5 h-2.5 rounded-full mt-1 ${i === 0 ? 'bg-green-500' : 'bg-gray-300'}`} />
                          {i < order.tracking.length - 1 && <div className="w-px flex-1 bg-gray-200 my-1" />}
                        </div>
                        <div className="pb-3">
                          <p className="text-sm font-medium text-gray-800">{t.description}</p>
                          {t.location && <p className="text-xs text-gray-400">{t.location}</p>}
                          <p className="text-xs text-gray-400">{new Date(t.timestamp).toLocaleString('en-IN')}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Delivery Info */}
            <div className="card p-5 grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs text-gray-500 mb-1">Delivering to</p>
                <p className="font-medium">{order.shippingAddress?.name}</p>
                <p className="text-gray-600">{order.shippingAddress?.addressLine1}, {order.shippingAddress?.city}</p>
                <p className="text-gray-600">{order.shippingAddress?.state} - {order.shippingAddress?.pincode}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Order Total</p>
                <p className="font-bold text-gray-900 text-lg">₹{order.pricing?.total}</p>
                <p className="text-xs text-gray-400 mt-1">Payment: {order.payment?.method?.toUpperCase()}</p>
                {order.estimatedDelivery && (
                  <p className="text-xs text-green-600 mt-1">📅 Est. {new Date(order.estimatedDelivery).toLocaleDateString('en-IN')}</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}

export function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/orders/my').then(res => setOrders(res.data.orders || [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const statusColor = { placed: 'text-blue-600 bg-blue-50', confirmed: 'text-indigo-600 bg-indigo-50', packed: 'text-purple-600 bg-purple-50', shipped: 'text-orange-600 bg-orange-50', out_for_delivery: 'text-yellow-700 bg-yellow-50', delivered: 'text-green-700 bg-green-50', cancelled: 'text-red-600 bg-red-50', return_requested: 'text-orange-700 bg-orange-50', returned: 'text-gray-600 bg-gray-50' };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-6">
        <h1 className="text-xl font-bold text-gray-900 mb-5">My Orders</h1>
        {loading ? (
          <div className="flex justify-center py-12"><div className="spinner" /></div>
        ) : orders.length === 0 ? (
          <div className="card text-center py-16">
            <div className="text-5xl mb-3">📦</div>
            <p className="text-gray-600 font-medium">No orders yet</p>
            <Link to="/products" className="btn-primary mt-4 inline-block">Start Shopping</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map(order => (
              <div key={order._id} className="card p-5">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="font-bold text-red-700">{order.orderId}</p>
                    <p className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                  </div>
                  <span className={`text-xs font-bold px-2 py-1 rounded-sm ${statusColor[order.status] || 'bg-gray-100 text-gray-600'}`}>
                    {order.status.replace(/_/g, ' ').toUpperCase()}
                  </span>
                </div>
                <div className="space-y-2 mb-3">
                  {order.items?.map((item, i) => (
                    <div key={i} className="flex items-center gap-3 text-sm">
                      {item.image && <img src={item.image} alt={item.name} className="w-10 h-10 object-cover rounded-sm bg-gray-100" onError={e => e.target.style.display='none'} />}
                      <span className="text-gray-700">{item.name}</span>
                      <span className="text-gray-400">×{item.quantity}</span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between border-t pt-3">
                  <p className="font-bold text-gray-900">₹{order.pricing?.total}</p>
                  <div className="flex gap-2">
                    <Link to={`/track?id=${order.orderId}`} className="btn-outline text-xs py-1.5 px-3">Track Order</Link>
                    {order.status === 'delivered' && (
                      <Link to={`/return/${order._id}`} className="text-xs border border-gray-300 text-gray-600 hover:border-red-400 hover:text-red-600 py-1.5 px-3 rounded-sm transition-colors">Return</Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}

export default OrderSuccess;
