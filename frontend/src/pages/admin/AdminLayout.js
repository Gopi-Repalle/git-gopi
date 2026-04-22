import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { path: '/admin', label: 'Dashboard', icon: '📊' },
  { path: '/admin/orders', label: 'Orders', icon: '📦' },
  { path: '/admin/products', label: 'Products', icon: '🌶️' },
  { path: '/admin/customers', label: 'Customers', icon: '👥' },
  { path: '/admin/returns', label: 'Returns', icon: '↩️' },
];

export default function AdminLayout({ children, title }) {
  const { pathname } = useLocation();
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <aside className="w-56 bg-gray-900 flex-shrink-0 flex flex-col">
        <div className="p-4 border-b border-gray-700">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-xl">🌶️</span>
            <div>
              <p className="text-white font-bold text-sm">FarmSpice</p>
              <p className="text-gray-400 text-xs">Admin Panel</p>
            </div>
          </Link>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-sm text-sm font-medium transition-colors ${
                pathname === item.path
                  ? 'bg-red-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-3 border-t border-gray-700 space-y-1">
          <Link to="/" className="flex items-center gap-2.5 px-3 py-2 rounded-sm text-sm text-gray-300 hover:bg-gray-800">
            <span>🏪</span> View Store
          </Link>
          <button onClick={handleLogout} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-sm text-sm text-gray-300 hover:bg-gray-800">
            <span>🚪</span> Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">
        <header className="bg-white border-b px-6 py-4">
          <h1 className="text-lg font-bold text-gray-900">{title}</h1>
        </header>
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
