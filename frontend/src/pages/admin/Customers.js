import React, { useEffect, useState } from 'react';
import AdminLayout from './AdminLayout';
import API from '../../utils/api';

export function Customers() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const load = () => {
    setLoading(true);
    const q = search ? `?search=${encodeURIComponent(search)}` : '';
    API.get(`/admin/customers${q}`).then(r => setData(r.data.customers || [])).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  return (
    <AdminLayout title="Customers">
      <div className="space-y-4">
        <div className="flex gap-3">
          <input className="input max-w-xs" placeholder="Search by name or email..." value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && load()} />
          <button onClick={load} className="btn-primary px-4">Search</button>
        </div>
        <div className="bg-white rounded-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  {['Name','Email','Phone','Orders','Total Spent','Joined'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr><td colSpan={6} className="text-center py-10"><div className="spinner mx-auto" /></td></tr>
                ) : data.map(c => (
                  <tr key={c._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{c.name}</td>
                    <td className="px-4 py-3 text-gray-500">{c.email}</td>
                    <td className="px-4 py-3 text-gray-500">{c.phone || '—'}</td>
                    <td className="px-4 py-3 font-bold text-blue-700">{c.orderCount || 0}</td>
                    <td className="px-4 py-3 font-bold text-green-700">₹{(c.totalSpent || 0).toLocaleString('en-IN')}</td>
                    <td className="px-4 py-3 text-gray-400 text-xs">{new Date(c.createdAt).toLocaleDateString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!loading && data.length === 0 && <p className="text-center text-gray-400 py-10 text-sm">No customers found</p>}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

export function Returns() {
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState('');
  const toast = { success: (m) => alert(m), error: (m) => alert(m) };

  const load = () => {
    setLoading(true);
    API.get('/returns').then(r => setReturns(r.data || [])).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const updateReturn = async (id, status) => {
    setUpdating(id);
    try {
      await API.put(`/returns/${id}`, { status });
      load();
    } catch {} finally { setUpdating(''); }
  };

  const STATUS_COLORS = { pending:'bg-yellow-100 text-yellow-700', approved:'bg-green-100 text-green-700', rejected:'bg-red-100 text-red-700', completed:'bg-gray-100 text-gray-600' };

  return (
    <AdminLayout title="Returns & Refunds">
      <div className="bg-white rounded-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                {['Order ID','Customer','Reason','Resolution','Status','Date','Action'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={7} className="text-center py-10"><div className="spinner mx-auto" /></td></tr>
              ) : returns.map(r => (
                <tr key={r._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-bold text-red-700">{r.order?.orderId || '—'}</td>
                  <td className="px-4 py-3"><p className="font-medium">{r.user?.name}</p><p className="text-xs text-gray-400">{r.user?.email}</p></td>
                  <td className="px-4 py-3 max-w-[180px]"><p className="text-gray-700 truncate" title={r.reason}>{r.reason}</p></td>
                  <td className="px-4 py-3 capitalize text-gray-600">{r.resolution?.replace(/_/g,' ')}</td>
                  <td className="px-4 py-3"><span className={`text-xs font-bold px-2 py-0.5 rounded-sm ${STATUS_COLORS[r.status]}`}>{r.status}</span></td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{new Date(r.createdAt).toLocaleDateString('en-IN')}</td>
                  <td className="px-4 py-3">
                    {r.status === 'pending' && (
                      <div className="flex gap-1.5">
                        <button onClick={() => updateReturn(r._id, 'approved')} disabled={updating === r._id}
                          className="text-xs bg-green-600 text-white px-2 py-1 rounded-sm hover:bg-green-700">Approve</button>
                        <button onClick={() => updateReturn(r._id, 'rejected')} disabled={updating === r._id}
                          className="text-xs bg-red-600 text-white px-2 py-1 rounded-sm hover:bg-red-700">Reject</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!loading && returns.length === 0 && <p className="text-center text-gray-400 py-10 text-sm">No return requests</p>}
        </div>
      </div>
    </AdminLayout>
  );
}

export default Customers;
