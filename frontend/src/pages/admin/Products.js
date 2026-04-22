import React, { useEffect, useState } from 'react';
import AdminLayout from './AdminLayout';
import API from '../../utils/api';
import toast from 'react-hot-toast';

const EMPTY = {
  name: '', description: '', shortDescription: '', price: '', originalPrice: '', discount: '',
  badge: '', stock: '', isActive: true, isFeatured: false,
  farmer: { name: '', location: '', verified: true },
  specs: { weight: '200g', heatLevel: 'Medium', origin: '', process: 'Sun-dried, Stone-ground', shelfLife: '12 months', certifications: 'FSSAI' },
};

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [files, setFiles] = useState([]);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    API.get('/products?limit=50').then(r => setProducts(r.data.products || [])).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => { setEditing(null); setForm(EMPTY); setFiles([]); setShowForm(true); };
  const openEdit = (p) => {
    setEditing(p._id);
    setForm({
      ...EMPTY, ...p,
      farmer: p.farmer || EMPTY.farmer,
      specs: { ...EMPTY.specs, ...p.specs, certifications: Array.isArray(p.specs?.certifications) ? p.specs.certifications.join(', ') : p.specs?.certifications || '' },
    });
    setFiles([]);
    setShowForm(true);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };
  const handleNested = (group, key, value) => setForm(f => ({ ...f, [group]: { ...f[group], [key]: value } }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        price: Number(form.price), originalPrice: Number(form.originalPrice), stock: Number(form.stock), discount: Number(form.discount),
        specs: { ...form.specs, certifications: form.specs.certifications.split(',').map(s => s.trim()).filter(Boolean) }
      };

      const fd = new FormData();
      fd.append('data', JSON.stringify(payload));
      files.forEach(f => fd.append('images', f));

      if (editing) {
        await API.put(`/products/${editing}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Product updated!');
      } else {
        await API.post('/products', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Product added!');
      }
      setShowForm(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      await API.delete(`/products/${id}`);
      toast.success('Product deleted');
      load();
    } catch { toast.error('Delete failed'); }
  };

  return (
    <AdminLayout title="Products">
      <div className="space-y-5">
        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-500">{products.length} products</p>
          <button onClick={openAdd} className="btn-primary">+ Add Product</button>
        </div>

        {/* Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start justify-center overflow-auto py-6 px-4">
            <div className="bg-white rounded-sm w-full max-w-2xl shadow-xl">
              <div className="flex justify-between items-center p-5 border-b">
                <h2 className="font-bold text-gray-900">{editing ? 'Edit Product' : 'Add New Product'}</h2>
                <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
              </div>
              <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2"><label className="label">Product Name *</label><input name="name" className="input" value={form.name} onChange={handleChange} required /></div>
                  <div><label className="label">Price (₹) *</label><input name="price" type="number" className="input" value={form.price} onChange={handleChange} required /></div>
                  <div><label className="label">Original Price (₹)</label><input name="originalPrice" type="number" className="input" value={form.originalPrice} onChange={handleChange} /></div>
                  <div><label className="label">Discount (%)</label><input name="discount" type="number" className="input" value={form.discount} onChange={handleChange} /></div>
                  <div><label className="label">Stock (units)</label><input name="stock" type="number" className="input" value={form.stock} onChange={handleChange} /></div>
                  <div><label className="label">Badge</label><input name="badge" className="input" placeholder="Best Seller, New, etc." value={form.badge} onChange={handleChange} /></div>
                  <div><label className="label">Heat Level</label>
                    <select className="input" value={form.specs.heatLevel} onChange={e => handleNested('specs', 'heatLevel', e.target.value)}>
                      {['Mild','Medium','Hot','Very Hot','Extra Hot'].map(h => <option key={h}>{h}</option>)}
                    </select>
                  </div>
                  <div className="col-span-2"><label className="label">Short Description</label><input name="shortDescription" className="input" value={form.shortDescription} onChange={handleChange} /></div>
                  <div className="col-span-2"><label className="label">Full Description *</label><textarea name="description" className="input h-20 resize-none" value={form.description} onChange={handleChange} required /></div>
                  <div><label className="label">Farmer / Source Name</label><input className="input" value={form.farmer.name} onChange={e => handleNested('farmer', 'name', e.target.value)} /></div>
                  <div><label className="label">Farmer Location</label><input className="input" placeholder="Guntur, Telangana" value={form.farmer.location} onChange={e => handleNested('farmer', 'location', e.target.value)} /></div>
                  <div><label className="label">Weight</label><input className="input" placeholder="200g" value={form.specs.weight} onChange={e => handleNested('specs', 'weight', e.target.value)} /></div>
                  <div><label className="label">Origin</label><input className="input" placeholder="Guntur, Telangana" value={form.specs.origin} onChange={e => handleNested('specs', 'origin', e.target.value)} /></div>
                  <div><label className="label">Process</label><input className="input" value={form.specs.process} onChange={e => handleNested('specs', 'process', e.target.value)} /></div>
                  <div><label className="label">Shelf Life</label><input className="input" value={form.specs.shelfLife} onChange={e => handleNested('specs', 'shelfLife', e.target.value)} /></div>
                  <div className="col-span-2"><label className="label">Certifications (comma separated)</label><input className="input" placeholder="FSSAI, Organic India" value={form.specs.certifications} onChange={e => handleNested('specs', 'certifications', e.target.value)} /></div>
                  <div className="col-span-2"><label className="label">Product Images</label>
                    <input type="file" multiple accept="image/*" onChange={e => setFiles(Array.from(e.target.files))} className="block text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-sm file:border-0 file:bg-red-600 file:text-white file:text-sm file:font-semibold hover:file:bg-red-700" />
                    {files.length > 0 && <p className="text-xs text-green-600 mt-1">{files.length} file(s) selected</p>}
                  </div>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="isActive" checked={form.isActive} onChange={handleChange} /> Active</label>
                    <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="isFeatured" checked={form.isFeatured} onChange={handleChange} /> Featured</label>
                  </div>
                </div>
                <div className="flex gap-3 pt-2 border-t">
                  <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Saving...' : editing ? 'Update Product' : 'Add Product'}</button>
                  <button type="button" onClick={() => setShowForm(false)} className="btn-outline">Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Products Table */}
        <div className="bg-white rounded-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  {['Product', 'Price', 'Stock', 'Rating', 'Status', 'Actions'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr><td colSpan={6} className="text-center py-10"><div className="spinner mx-auto" /></td></tr>
                ) : products.map(p => (
                  <tr key={p._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {p.images?.[0] && <img src={p.images[0]} alt={p.name} className="w-10 h-10 object-cover rounded-sm bg-gray-100" onError={e => e.target.style.display='none'} />}
                        <div>
                          <p className="font-medium text-gray-900">{p.name}</p>
                          <p className="text-xs text-gray-400">{p.specs?.heatLevel} | {p.specs?.weight}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-bold">₹{p.price}</p>
                      {p.originalPrice > p.price && <p className="text-xs text-gray-400 line-through">₹{p.originalPrice}</p>}
                    </td>
                    <td className="px-4 py-3"><span className={`font-semibold ${p.stock < 10 ? 'text-red-600' : 'text-green-700'}`}>{p.stock}</span></td>
                    <td className="px-4 py-3">
                      {p.ratings?.count > 0 ? (
                        <span className="bg-green-100 text-green-700 text-xs font-bold px-1.5 py-0.5 rounded-sm">{p.ratings.average} ★</span>
                      ) : <span className="text-gray-300 text-xs">No ratings</span>}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-sm ${p.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {p.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button onClick={() => openEdit(p)} className="text-xs border border-blue-300 text-blue-600 hover:bg-blue-50 px-2 py-1 rounded-sm transition-colors">Edit</button>
                        <button onClick={() => handleDelete(p._id)} className="text-xs border border-red-300 text-red-600 hover:bg-red-50 px-2 py-1 rounded-sm transition-colors">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!loading && products.length === 0 && <p className="text-center text-gray-400 py-10 text-sm">No products. Click "+ Add Product" to get started.</p>}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
