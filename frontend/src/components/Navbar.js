import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) navigate(`/products?search=${encodeURIComponent(search.trim())}`);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="bg-spice-dark sticky top-0 z-50 shadow-md" style={{ background: 'linear-gradient(135deg, #7B241C 0%, #C0392B 100%)' }}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center gap-4 h-14">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-1.5 flex-shrink-0">
            <span className="text-2xl">🌶️</span>
            <span className="text-white font-bold text-xl tracking-tight">FarmSpice</span>
          </Link>

          {/* Search */}
          <form onSubmit={handleSearch} className="flex-1 max-w-xl hidden sm:flex">
            <div className="flex w-full">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search for chilli powder..."
                className="flex-1 px-4 py-2 text-sm text-gray-800 outline-none rounded-l-sm"
              />
              <button type="submit" className="bg-orange-400 hover:bg-orange-500 px-4 py-2 rounded-r-sm transition-colors">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>
          </form>

          {/* Nav items */}
          <nav className="hidden md:flex items-center gap-6 ml-auto">
            {user ? (
              <div className="relative group">
                <button className="flex flex-col items-start text-white text-xs">
                  <span className="text-gray-300 text-xs">Hello, {user.name.split(' ')[0]}</span>
                  <span className="font-semibold text-sm">Account ▾</span>
                </button>
                <div className="absolute right-0 top-full mt-1 bg-white rounded shadow-lg w-44 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                  <Link to="/profile" className="block px-4 py-2.5 text-sm hover:bg-gray-50 text-gray-700">My Profile</Link>
                  <Link to="/my-orders" className="block px-4 py-2.5 text-sm hover:bg-gray-50 text-gray-700">My Orders</Link>
                  {isAdmin && <Link to="/admin" className="block px-4 py-2.5 text-sm hover:bg-gray-50 text-red-600 font-semibold">Admin Panel</Link>}
                  <hr className="my-1" />
                  <button onClick={handleLogout} className="block w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 text-gray-700">Logout</button>
                </div>
              </div>
            ) : (
              <Link to="/login" className="flex flex-col items-start text-white text-xs">
                <span className="text-gray-300 text-xs">Hello, Guest</span>
                <span className="font-semibold text-sm">Login ▾</span>
              </Link>
            )}
            <Link to="/track" className="flex flex-col items-start text-white text-xs">
              <span className="text-gray-300 text-xs">Track</span>
              <span className="font-semibold text-sm">My Order</span>
            </Link>
            <Link to="/cart" className="flex items-center gap-1.5 text-white relative">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-orange-400 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">{cartCount}</span>
              )}
              <span className="font-semibold text-sm">Cart</span>
            </Link>
          </nav>

          {/* Mobile menu button */}
          <button className="md:hidden ml-auto text-white" onClick={() => setMenuOpen(!menuOpen)}>
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={menuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
            </svg>
          </button>
        </div>

        {/* Mobile search */}
        <form onSubmit={handleSearch} className="flex sm:hidden pb-2">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products..."
            className="flex-1 px-3 py-2 text-sm text-gray-800 outline-none rounded-l-sm"
          />
          <button type="submit" className="bg-orange-400 px-3 py-2 rounded-r-sm">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        </form>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-red-900 px-4 pb-3 space-y-2 text-white text-sm">
          <Link to="/" className="block py-2 border-b border-red-700" onClick={() => setMenuOpen(false)}>Home</Link>
          <Link to="/products" className="block py-2 border-b border-red-700" onClick={() => setMenuOpen(false)}>Shop</Link>
          <Link to="/cart" className="block py-2 border-b border-red-700" onClick={() => setMenuOpen(false)}>Cart ({cartCount})</Link>
          <Link to="/track" className="block py-2 border-b border-red-700" onClick={() => setMenuOpen(false)}>Track Order</Link>
          {user ? (
            <>
              <Link to="/my-orders" className="block py-2 border-b border-red-700" onClick={() => setMenuOpen(false)}>My Orders</Link>
              {isAdmin && <Link to="/admin" className="block py-2 border-b border-red-700 text-orange-300" onClick={() => setMenuOpen(false)}>Admin</Link>}
              <button onClick={() => { handleLogout(); setMenuOpen(false); }} className="block py-2">Logout</button>
            </>
          ) : (
            <Link to="/login" className="block py-2" onClick={() => setMenuOpen(false)}>Login / Register</Link>
          )}
        </div>
      )}
    </header>
  );
}
