import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import API from "../utils/api";
import toast from "react-hot-toast";

export default function Register() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "" });
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  useEffect(() => {
    // Load Google Sign In script
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    document.head.appendChild(script);
    return () => document.head.removeChild(script);
  }, []);

  const handleGoogleLogin = () => {
    const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;
    if (!clientId || clientId === "placeholder") {
      toast.error("Google login not configured yet. Please use email registration.");
      return;
    }
    setGoogleLoading(true);
    window.google?.accounts.id.initialize({
      client_id: clientId,
      callback: async (response) => {
        try {
          const res = await API.post("/auth/google", { credential: response.credential });
          login(res.data.token, res.data.user);
          toast.success("Welcome to FarmSpice!");
          navigate("/");
        } catch (err) {
          toast.error(err.response?.data?.message || "Google login failed");
        } finally {
          setGoogleLoading(false);
        }
      }
    });
    window.google?.accounts.id.prompt();
  };

  const validatePassword = (pwd) => {
    const hasLetter = /[a-zA-Z]/.test(pwd);
    const hasNumber = /[0-9]/.test(pwd);
    return pwd.length >= 6 && hasLetter && hasNumber;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { toast.error("Please enter your full name"); return; }
    if (!form.email.trim()) { toast.error("Please enter your email"); return; }
    if (!validatePassword(form.password)) {
      toast.error("Password must be at least 6 characters with letters and numbers");
      return;
    }
    setLoading(true);
    try {
      const res = await API.post("/auth/register", form);
      login(res.data.token, res.data.user);
      toast.success("Account created! Welcome to FarmSpice!");
      navigate("/");
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <Link to="/" className="inline-flex items-center gap-2 text-2xl font-bold text-red-700">
            <span>🌶️</span> FarmSpice
          </Link>
          <p className="text-gray-500 text-sm mt-1">Pure Chilli Powder, Direct from Farmers</p>
        </div>

        <div className="bg-white rounded-sm shadow-sm border border-gray-200 p-8">
          <h1 className="text-xl font-bold text-gray-900 mb-1">Create Account</h1>
          <p className="text-sm text-gray-500 mb-5">Join thousands of happy spice lovers</p>

          {/* Google Button */}
          <button
            onClick={handleGoogleLogin}
            disabled={googleLoading}
            className="w-full flex items-center justify-center gap-3 border border-gray-300 rounded-sm py-2.5 px-4 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors mb-4"
          >
            <svg width="18" height="18" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            </svg>
            {googleLoading ? "Signing in..." : "Continue with Google"}
          </button>

          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 border-t border-gray-200"></div>
            <span className="text-xs text-gray-400 font-medium">OR</span>
            <div className="flex-1 border-t border-gray-200"></div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
              <input type="text" placeholder="Ravi Kumar"
                className="w-full border border-gray-300 rounded-sm px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
              <input type="email" placeholder="you@example.com"
                className="w-full border border-gray-300 rounded-sm px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
              <input type="tel" placeholder="+91 98765 43210"
                className="w-full border border-gray-300 rounded-sm px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
              <p className="text-xs text-gray-400 mt-1">Each phone number can only be used once</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
              <input type="password" placeholder="Min 6 chars with letters & numbers"
                className="w-full border border-gray-300 rounded-sm px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required minLength={6} />
              <div className="mt-1.5 flex gap-2">
                <span className={`text-xs px-2 py-0.5 rounded-sm ${form.password.length >= 6 ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-400"}`}>6+ chars</span>
                <span className={`text-xs px-2 py-0.5 rounded-sm ${/[a-zA-Z]/.test(form.password) ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-400"}`}>letters</span>
                <span className={`text-xs px-2 py-0.5 rounded-sm ${/[0-9]/.test(form.password) ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-400"}`}>numbers</span>
              </div>
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-bold py-3 rounded-sm text-sm transition-colors">
              {loading ? "Creating Account..." : "CREATE ACCOUNT"}
            </button>
          </form>

          <p className="text-center text-xs text-gray-400 mt-3">
            By creating an account, you agree to our Terms & Privacy Policy
          </p>
          <p className="text-center text-sm text-gray-500 mt-3">
            Already have an account?{" "}
            <Link to="/login" className="text-red-600 font-semibold hover:underline">Login</Link>
          </p>
        </div>
        <div className="text-center mt-3">
          <p className="text-xs text-gray-400">🔒 Your data is 100% safe and secure</p>
        </div>
      </div>
    </div>
  );
}
