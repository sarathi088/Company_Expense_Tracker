import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Truck, Lock, User, ShieldCheck, ArrowRight, Check, AlertCircle, Sparkles, HelpCircle } from 'lucide-react';

export const Login = () => {
  const { login, settings } = useApp();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('password123');
  const [role, setRole] = useState('Admin');
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showForgotModal, setShowForgotModal] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!username.trim()) {
      setErrorMsg('Please enter your username');
      return;
    }
    if (!password.trim()) {
      setErrorMsg('Please enter your password');
      return;
    }

    setErrorMsg('');
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      login(username, password, role);
    }, 800);
  };

  const handleQuickLogin = (selectedRole) => {
    setRole(selectedRole);
    setUsername(selectedRole.toLowerCase());
    setPassword('demo1234');
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      login(selectedRole === 'Admin' ? 'Admin User' : 'Staff Member', 'demo1234', selectedRole);
    }, 600);
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 overflow-hidden">
      
      {/* Liquid Background Orbs */}
      <div className="bg-orb bg-orb-1" />
      <div className="bg-orb bg-orb-2" />
      <div className="bg-orb bg-orb-3" />

      {/* Floating Glass Bubbles */}
      <motion.div 
        animate={{ y: [0, -20, 0], rotate: [0, 10, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-20 left-10 hidden md:flex items-center gap-3 p-3.5 rounded-2xl liquid-glass-pill shadow-xl text-xs font-semibold text-blue-700 dark:text-blue-300"
      >
        <div className="p-2 rounded-xl bg-blue-500 text-white">
          <Truck className="w-4 h-4" />
        </div>
        <div>
          <p className="font-bold">Live Load Stream</p>
          <p className="text-[10px] text-slate-500 dark:text-slate-400">1,240+ Loads Managed Today</p>
        </div>
      </motion.div>

      <motion.div 
        animate={{ y: [0, 25, 0], rotate: [0, -8, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        className="absolute bottom-20 right-10 hidden md:flex items-center gap-3 p-3.5 rounded-2xl liquid-glass-pill shadow-xl text-xs font-semibold text-emerald-700 dark:text-emerald-300"
      >
        <div className="p-2 rounded-xl bg-emerald-500 text-white">
          <Sparkles className="w-4 h-4" />
        </div>
        <div>
          <p className="font-bold">iOS 26 Liquid System</p>
          <p className="text-[10px] text-slate-500 dark:text-slate-400">High precision rate tracking</p>
        </div>
      </motion.div>

      {/* Main Glass Login Container */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="liquid-glass-card rounded-4xl p-8 sm:p-10 shadow-2xl border border-white/70 dark:border-white/15 backdrop-blur-3xl">
          
          {/* Header & Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-gradient-to-tr from-brand-600 via-blue-500 to-indigo-400 p-1 shadow-lg shadow-blue-500/30 mb-4 group">
              <div className="w-full h-full bg-white/20 dark:bg-black/20 backdrop-blur-md rounded-[20px] flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                <Truck className="w-9 h-9 stroke-[2.2]" />
              </div>
            </div>
            
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {settings.companyName}
            </h2>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">
              "{settings.tagline}"
            </p>

            {/* Quick Demo Preset Pills */}
            <div className="mt-5 p-1 rounded-2xl bg-slate-200/50 dark:bg-slate-800/60 border border-white/50 dark:border-white/10 flex items-center gap-1">
              <button
                type="button"
                onClick={() => setRole('Admin')}
                className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  role === 'Admin'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Admin</span>
              </button>
              <button
                type="button"
                onClick={() => setRole('Manager')}
                className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  role === 'Manager'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>Manager</span>
              </button>
            </div>
          </div>

          {/* Error Banner */}
          {errorMsg && (
            <div className="mb-5 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Username / Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username..."
                  className="w-full pl-10 pr-4 py-3 rounded-2xl text-sm font-medium text-slate-900 dark:text-white placeholder-slate-400 liquid-glass-input outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password..."
                  className="w-full pl-10 pr-4 py-3 rounded-2xl text-sm font-medium text-slate-900 dark:text-white placeholder-slate-400 liquid-glass-input outline-none"
                />
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                />
                <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Remember session</span>
              </label>

              <button
                type="button"
                onClick={() => setShowForgotModal(true)}
                className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
              >
                Forgot Password?
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3.5 px-6 rounded-2xl text-sm font-bold text-white liquid-glass-button flex items-center justify-center gap-2 disabled:opacity-75"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In as {role}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Preset One-Click Demo Logins */}
          <div className="mt-8 pt-6 border-t border-slate-200/50 dark:border-white/10 text-center">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">
              Instant One-Click Demo Access
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('Admin')}
                className="p-2.5 rounded-2xl bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 text-blue-700 dark:text-blue-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                <span>Demo Admin</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('Manager')}
                className="p-2.5 rounded-2xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
              >
                <User className="w-3.5 h-3.5 text-emerald-600" />
                <span>Demo Manager</span>
              </button>
            </div>
          </div>

        </div>
      </motion.div>

      {/* Forgot Password Modal */}
      <AnimatePresence>
        {showForgotModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="w-full max-w-sm liquid-glass-card rounded-3xl p-6 shadow-2xl text-center"
            >
              <div className="w-12 h-12 rounded-2xl bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto mb-3">
                <HelpCircle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Reset Account Access</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                For demo testing, you can use any username & password, or click "Demo Admin" to instantly enter.
              </p>
              <button
                onClick={() => setShowForgotModal(false)}
                className="mt-5 w-full py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs"
              >
                Got It, Return to Login
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
