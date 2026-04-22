import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from './AdminLayout';
import API from '../../utils/api';

const StatCard = ({ label, value, icon, change, color }) => (
  <div className="bg-white rounded-sm border border-gray-200 p-5">
    <div className="flex items-center justify-between mb-3">
      <p className="text-sm text-gray-500 font-medium">{label}</p>
      <span className="text-2xl">{icon}</span>
    </div>
    <p className={`text-2xl font-bold ${color || 'text-gray-900'}`}>{value}</p>
    {change && <p className="text-xs text-green-600 mt-1">{change}</p>}
  </div>
);

const STATUS_COLORS = {
  placed: 'bg-blue-100 text-blue-700', confirmed: 'bg-indigo-100 text-indigo-700',
  packed: 'bg-purple-100 text-purple-700', shipped: 'bg-orange-100 text-orange-700',
  out_for_delivery: 'bg-yellow-100 text-yellow-700', delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700', return_requested: 'bg-orange-100 text-orange-700',
};

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/admin/dashboard').then(r => setData(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <AdminLayout title="Dashboard">
      {loading ? (
        <div className="flex justify-center py-20"><div className="spinner" /></div>
      ) : (
        <div className="space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Total Orders" value={data?.stats?.totalOrders || 0} icon="📦" color="text-blue-700" />
            <StatCard label="Total Revenue" value={`₹${(data?.stats?.totalRevenue || 0).toLocaleString('en-IN')}`} icon="💰" color="text-green-700" />
            <StatCard label="Customers" value={data?.stats?.totalCustomers || 0} icon="👥" color="text-purple-700" />
            <StatCard label="Active Products" value={data?.stats?.totalProducts || 0} icon="🌶️" color="text-red-700" />
          </div>

          {/* Recent Orders */}
          <div className="bg-white rounded-sm border border-gray-200">
            <div className="flex items-center justify-between px-5 py-4 border-b">
              <h2 className="font-bold text-gray-900">Recent Orders</h2>
              <Link to="/admin/orders" className="text-sm text-red-600 hover:underline">View All →</Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    {['Order ID', 'Customer', 'Amount', 'Status', 'Date'].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {(data?.recentOrders || []).map(order => (
                    <tr key={order._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-bold text-red-700">{order.orderId}</td>
                      <td className="px-4 py-3 text-gray-700">{order.user?.name || '—'}</td>
                      <td className="px-4 py-3 font-semibold">₹{order.pricing?.total}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-sm ${STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-600'}`}>
                          {order.status?.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-400">{new Date(order.createdAt).toLocaleDateString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {(!data?.recentOrders?.length) && (
                <p className="text-center text-gray-400 py-8 text-sm">No orders yet</p>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-sm border border-gray-200 p-5">
            <h2 className="font-bold text-gray-900 mb-4">Quick Actions</h2>
            <div className="flex gap-3 flex-wrap">
              <Link to="/admin/products" className="btn-primary text-sm">+ Add Product</Link>
              <Link to="/admin/orders" className="btn-outline text-sm">Manage Orders</Link>
              <Link to="/admin/customers" className="btn-outline text-sm">View Customers</Link>
              <Link to="/admin/returns" className="btn-outline text-sm">Review Returns</Link>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
