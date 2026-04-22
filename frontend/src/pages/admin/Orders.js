import React, { useEffect, useState } from 'react';
import AdminLayout from './AdminLayout';
import API from '../../utils/api';
import toast from 'react-hot-toast';

const STATUS_COLORS = {
  placed:'bg-blue-100 text-blue-700', confirmed:'bg-indigo-100 text-indigo-700',
  packed:'bg-purple-100 text-purple-700', shipped:'bg-orange-100 text-orange-700',
  out_for_delivery:'bg-yellow-100 text-yellow-700', delivered:'bg-green-100 text-green-700',
  cancelled:'bg-red-100 text-red-700', return_requested:'bg-orange-100 text-orange-700', returned:'bg-gray-100 text-gray-600',
};
const NEXT_STATUS = {
  placed:'confirmed', confirmed:'packed', packed:'shipped', shipped:'out_for_delivery', out_for_delivery:'delivered'
};
const STATUS_FLOW = ['placed','confirmed','packed','shipped','out_for_delivery','delivered'];

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updating, setUpdating] = useState(false);

  const load = () => {
    setLoading(true);
    const q = filter ? `?status=${filter}` : '';
    API.get(`/orders${q}`).then(r => setOrders(r.data.orders || [])).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [filter]);

  const updateStatus = async (orderId, status) => {
    setUpdating(true);
    try {
      await API.put(`/orders/${orderId}/status`, { status, description: `Order ${status.replace(/_/g,' ')}` });
      toast.success(`Status updated to ${status}`);
      load();
      setSelectedOrder(null);
    } catch { toast.error('Update failed'); }
    finally { setUpdating(false); }
  };

  return (
    <AdminLayout title="Orders">
      <div className="space-y-4">
        {/* Filter */}
        <div className="flex gap-2 flex-wrap">
          {['', 'placed', 'confirmed', 'packed', 'shipped', 'out_for_delivery', 'delivered', 'cancelled', 'return_requested'].map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className={`text-xs px-3 py-1.5 rounded-sm font-semibold border transition-colors ${filter === s ? 'bg-red-600 text-white border-red-600' : 'bg-white text-gray-600 border-gray-300 hover:border-red-400'}`}>
              {s || 'All'}
            </button>
          ))}
        </div>

        {/* Order Detail Modal */}
        {selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center px-4">
            <div className="bg-white rounded-sm w-full max-w-lg shadow-xl">
              <div className="flex justify-between items-center p-5 border-b">
                <h2 className="font-bold text-gray-900">Order {selectedOrder.orderId}</h2>
                <button onClick={() => setSelectedOrder(null)} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
              </div>
              <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><p className="text-gray-500 text-xs">Customer</p><p className="font-semibold">{selectedOrder.user?.name}</p><p className="text-gray-400">{selectedOrder.user?.email}</p></div>
                  <div><p className="text-gray-500 text-xs">Order Total</p><p className="font-bold text-lg">₹{selectedOrder.pricing?.total}</p></div>
                  <div className="col-span-2"><p className="text-gray-500 text-xs mb-1">Shipping Address</p>
                    <p className="font-medium">{selectedOrder.shippingAddress?.name}</p>
                    <p className="text-gray-600">{selectedOrder.shippingAddress?.addressLine1}, {selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state} - {selectedOrder.shippingAddress?.pincode}</p>
                  </div>
                </div>
                <div>
                  <p className="text-gray-500 text-xs mb-2">Items</p>
                  {selectedOrder.items?.map((item, i) => (
                    <div key={i} className="flex justify-between text-sm py-1 border-b border-gray-100">
                      <span>{item.name} × {item.quantity}</span>
                      <span className="font-semibold">₹{item.price * item.quantity}</span>
                    </div>
                  ))}
                </div>
                <div>
                  <p className="text-gray-500 text-xs mb-2">Update Status</p>
                  <div className="flex gap-2 flex-wrap">
                    {STATUS_FLOW.map(s => (
                      <button key={s} onClick={() => updateStatus(selectedOrder._id, s)} disabled={updating || selectedOrder.status === s}
                        className={`text-xs px-3 py-1.5 rounded-sm font-semibold border transition-colors ${selectedOrder.status === s ? 'bg-green-600 text-white border-green-600' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'}`}>
                        {s.replace(/_/g,' ')}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="bg-white rounded-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  {['Order ID','Customer','Items','Total','Status','Date','Action'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr><td colSpan={7} className="text-center py-10"><div className="spinner mx-auto" /></td></tr>
                ) : orders.map(order => (
                  <tr key={order._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-bold text-red-700">{order.orderId}</td>
                    <td className="px-4 py-3"><p className="font-medium">{order.user?.name || '—'}</p><p className="text-xs text-gray-400">{order.user?.email}</p></td>
                    <td className="px-4 py-3 text-gray-500">{order.items?.length} item(s)</td>
                    <td className="px-4 py-3 font-bold">₹{order.pricing?.total}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-sm ${STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-600'}`}>
                        {order.status?.replace(/_/g,' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs">{new Date(order.createdAt).toLocaleDateString('en-IN')}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => setSelectedOrder(order)} className="text-xs border border-blue-300 text-blue-600 hover:bg-blue-50 px-2 py-1 rounded-sm">Manage</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!loading && orders.length === 0 && <p className="text-center text-gray-400 py-10 text-sm">No orders found</p>}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
