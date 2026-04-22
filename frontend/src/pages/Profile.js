import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import API from '../utils/api';
import toast from 'react-hot-toast';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '' });
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '' });
  const [loading, setLoading] = useState(false);

  const handleProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await API.put('/auth/profile', form);
      updateUser(res.data);
      toast.success('Profile updated!');
    } catch { toast.error('Update failed'); }
    finally { setLoading(false); }
  };

  const handlePassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await API.post('/auth/change-password', pwForm);
      toast.success('Password changed!');
      setPwForm({ currentPassword: '', newPassword: '' });
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-xl font-bold text-gray-900 mb-6">My Profile</h1>
        <div className="card p-6 mb-4">
          <h2 className="font-bold text-gray-700 mb-4">Personal Information</h2>
          <form onSubmit={handleProfile} className="space-y-4">
            <div><label className="label">Full Name</label><input className="input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
            <div><label className="label">Email</label><input className="input" value={user?.email} disabled className="input bg-gray-50 cursor-not-allowed" /></div>
            <div><label className="label">Phone</label><input className="input" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+91 98765 43210" /></div>
            <button type="submit" disabled={loading} className="btn-primary">{loading ? 'Saving...' : 'Save Changes'}</button>
          </form>
        </div>
        <div className="card p-6">
          <h2 className="font-bold text-gray-700 mb-4">Change Password</h2>
          <form onSubmit={handlePassword} className="space-y-4">
            <div><label className="label">Current Password</label><input type="password" className="input" value={pwForm.currentPassword} onChange={e => setPwForm({ ...pwForm, currentPassword: e.target.value })} required /></div>
            <div><label className="label">New Password</label><input type="password" className="input" value={pwForm.newPassword} onChange={e => setPwForm({ ...pwForm, newPassword: e.target.value })} minLength={6} required /></div>
            <button type="submit" disabled={loading} className="btn-primary">{loading ? 'Updating...' : 'Change Password'}</button>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
}
