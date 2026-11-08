import React, { useState } from 'react';
import { X, Lock, User, Eye, EyeOff } from 'lucide-react';
import { LOGO_URL } from './Navbar';
import { apiUrl } from '../services/api';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (admin: { username: string; name: string; role: string }) => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const res = await fetch(apiUrl('/api/admin/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Invalid credentials.');
      }

      localStorage.setItem('mk_admin_token', data.token);
      localStorage.setItem('mk_admin_user', JSON.stringify(data.admin));
      onLoginSuccess(data.admin);
    } catch (err: any) {
      setErrorMsg(err.message || 'Login failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      {/* Container with ambient warm glow */}
      <div className="relative w-full max-w-sm bg-[#161310] rounded-2xl sm:rounded-3xl border border-stone-800 shadow-2xl overflow-hidden text-stone-100 p-6 sm:p-8 space-y-5 sm:space-y-6">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-stone-900 text-stone-400 hover:text-white flex items-center justify-center transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Logo & MiniK Login Title matching screenshot */}
        <div className="text-center space-y-2 pt-2">
          <div className="h-14 w-auto flex items-center justify-center mx-auto">
            <img
              src={LOGO_URL}
              alt="MiniKitchen Logo"
              referrerPolicy="no-referrer"
              className="h-12 w-auto object-contain"
            />
          </div>
          <h3 className="font-sans text-xl font-bold text-white tracking-tight">
            MiniK Login
          </h3>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {errorMsg && (
            <div className="p-2.5 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs">
              {errorMsg}
            </div>
          )}

          {/* Username Input with User icon matching screenshot */}
          <div className="relative">
            <User className="w-4 h-4 text-stone-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              required
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full pl-10 pr-4 py-3 text-xs sm:text-sm rounded-xl bg-white text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#f5a623] font-sans"
            />
          </div>

          {/* Password Input with Lock icon & Eye toggle matching screenshot */}
          <div className="relative">
            <Lock className="w-4 h-4 text-stone-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type={showPassword ? 'text' : 'password'}
              required
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-10 py-3 text-xs sm:text-sm rounded-xl bg-white text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#f5a623] font-sans"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {/* Gold Gradient Login Button matching screenshot */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#f5a623] to-[#e09419] hover:brightness-105 text-[#121110] font-bold text-sm transition-all shadow-lg active:scale-[0.99] disabled:opacity-50 mt-2"
          >
            {loading ? 'Signing in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
};
