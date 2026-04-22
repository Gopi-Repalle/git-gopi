import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../utils/api';
import toast from 'react-hot-toast';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const from = location.state?.from || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await API.post('/auth/login', form);
      login(res.data.token, res.data.user);
      toast.success(`Welcome back, ${res.data.user.name.split(' ')[0]}! 🌶️`);
      navigate(res.data.user.role === 'admin' ? '/admin' : from);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <Link to="/" className="inline-flex items-center gap-2 text-2xl font-bold text-red-700">
            <span>🌶️</span> FarmSpice
          </Link>
        </div>
        <div className="card p-8">
          <h1 className="text-xl font-bold text-gray-900 mb-1">Login</h1>
          <p className="text-sm text-gray-500 mb-6">Get access to your Orders and Profile</p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Email Address</label>
              <input type="email" className="input" placeholder="you@example.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
            </div>
            <div>
              <label className="label">Password</label>
              <input type="password" className="input" placeholder="Your password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
            </div>
            <button type="submit" disabled={loading} className="w-full btn-primary py-3 text-sm font-bold">
              {loading ? 'Logging in...' : 'LOGIN'}
            </button>
          </form>
          <p className="text-center text-sm text-gray-500 mt-4">
            New to FarmSpice?{' '}
            <Link to="/register" className="text-red-600 font-semibold hover:underline">Create Account</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export function Register() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await API.post('/auth/register', form);
      login(res.data.token, res.data.user);
      toast.success('Account created! Welcome to FarmSpice 🌶️');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.errors?.[0]?.msg || err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <Link to="/" className="inline-flex items-center gap-2 text-2xl font-bold text-red-700">
            <span>🌶️</span> FarmSpice
          </Link>
        </div>
        <div className="card p-8">
          <h1 className="text-xl font-bold text-gray-900 mb-1">Create Account</h1>
          <p className="text-sm text-gray-500 mb-6">Join thousands of happy spice lovers</p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Full Name</label>
              <input type="text" className="input" placeholder="Ravi Kumar" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div>
              <label className="label">Email Address</label>
              <input type="email" className="input" placeholder="you@example.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
            </div>
            <div>
              <label className="label">Phone Number</label>
              <input type="tel" className="input" placeholder="+91 98765 43210" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
            </div>
            <div>
              <label className="label">Password</label>
              <input type="password" className="input" placeholder="Min 6 characters" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required minLength={6} />
            </div>
            <button type="submit" disabled={loading} className="w-full btn-primary py-3 text-sm font-bold">
              {loading ? 'Creating Account...' : 'CREATE ACCOUNT'}
            </button>
          </form>
          <p className="text-center text-sm text-gray-500 mt-4">
            Already have an account?{' '}
            <Link to="/login" className="text-red-600 font-semibold hover:underline">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
