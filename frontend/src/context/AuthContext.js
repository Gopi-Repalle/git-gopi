import React, { createContext, useContext, useState, useEffect } from 'react';
import API from '../utils/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('farmspice_token');
    const saved = localStorage.getItem('farmspice_user');
    if (token && saved) {
      try { setUser(JSON.parse(saved)); } catch {}
      // Verify token is still valid
      API.get('/auth/me')
        .then(res => { setUser(res.data); localStorage.setItem('farmspice_user', JSON.stringify(res.data)); })
        .catch(() => { localStorage.removeItem('farmspice_token'); localStorage.removeItem('farmspice_user'); setUser(null); })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = (token, userData) => {
    localStorage.setItem('farmspice_token', token);
    localStorage.setItem('farmspice_user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('farmspice_token');
    localStorage.removeItem('farmspice_user');
    setUser(null);
  };

  const updateUser = (data) => {
    const updated = { ...user, ...data };
    localStorage.setItem('farmspice_user', JSON.stringify(updated));
    setUser(updated);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateUser, isAdmin: user?.role === 'admin' }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
