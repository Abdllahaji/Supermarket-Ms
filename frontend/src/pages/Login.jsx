import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { HiShoppingCart, HiMail, HiLockClosed, HiEye, HiEyeOff, HiShieldCheck, HiUserGroup, HiCash } from 'react-icons/hi';

const Login = () => {
  const { login, isAuthenticated } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter both email and password');
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      toast.success('Logged in successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed. Check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    toast.success(`Filled credentials for ${demoEmail}`);
  };

  const demoAccounts = [
    {
      role: 'Admin',
      name: 'Full Access (Maamulaha)',
      email: 'admin@supermarket.com',
      password: 'admin123',
      color: 'bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100',
      badgeColor: 'bg-purple-600 text-white',
      icon: HiShieldCheck
    },
    {
      role: 'Manager',
      name: 'Inventory & Reports',
      email: 'manager@supermarket.com',
      password: 'admin123',
      color: 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100',
      badgeColor: 'bg-blue-600 text-white',
      icon: HiUserGroup
    },
    {
      role: 'Cashier',
      name: 'POS Terminal (Qasnajiga)',
      email: 'sarah@supermarket.com',
      password: 'cashier123',
      color: 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100',
      badgeColor: 'bg-emerald-600 text-white',
      icon: HiCash
    }
  ];

  return (
    <div className="min-h-screen py-10 flex items-center justify-center bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg w-full bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
        
        {/* Header */}
        <div className="bg-slate-900 px-6 py-6 text-center text-white">
          <div className="inline-flex p-3 bg-indigo-600 rounded-2xl mb-3 shadow-lg shadow-indigo-500/30">
            <HiShoppingCart className="text-3xl text-white" />
          </div>
          <h1 className="text-2xl font-black tracking-tight">SuperMarket MS</h1>
          <p className="text-xs text-gray-400 mt-1 uppercase tracking-wider font-semibold">Offline Supermarket Management System</p>
        </div>

        <div className="px-6 py-8 sm:px-10">
          <div className="mb-6 text-center">
            <h2 className="text-xl font-bold text-gray-900">Sign in to your account</h2>
            <p className="text-xs text-gray-500 mt-1">Select an account below or enter your credentials</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Email Address</label>
              <div className="relative flex items-center">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <HiMail className="text-gray-400 text-lg" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                  placeholder="admin@supermarket.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Password</label>
              <div className="relative flex items-center">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <HiLockClosed className="text-gray-400 text-lg" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <HiEyeOff className="text-lg" /> : <HiEye className="text-lg" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 rounded-xl shadow-md text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400 transition-all active:scale-[0.99] mt-2"
            >
              {loading ? 'Verifying...' : 'Sign In'}
            </button>
          </form>

          {/* Quick Demo Accounts Selector */}
          <div className="mt-8 border-t border-gray-100 pt-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500">🔑 Demo Accounts (Riix si toos ah):</span>
            </div>

            <div className="space-y-2">
              {demoAccounts.map((acc) => {
                const Icon = acc.icon;
                return (
                  <button
                    key={acc.role}
                    type="button"
                    onClick={() => handleQuickFill(acc.email, acc.password)}
                    className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between ${acc.color}`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-white rounded-lg shadow-xs">
                        <Icon className="text-lg" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-bold">{acc.role}</span>
                          <span className="text-[10px] text-gray-500 font-normal">({acc.name})</span>
                        </div>
                        <p className="text-[11px] font-mono text-gray-600 mt-0.5">{acc.email} • <span className="font-semibold text-gray-800">{acc.password}</span></p>
                      </div>
                    </div>
                    <span className="text-[11px] font-semibold underline ml-2">Click to fill</span>
                  </button>
                );
              })}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Login;
