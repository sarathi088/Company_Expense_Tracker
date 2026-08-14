import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Truck, 
  LayoutDashboard, 
  PlusCircle, 
  MapPin, 
  History, 
  FileText, 
  Download, 
  Sun, 
  Moon, 
  ShieldCheck, 
  LogOut,
  Clock,
  ChevronDown,
  Briefcase,
  Plus
} from 'lucide-react';

// Top Desktop Navigation Bar & Header Controls
export const Navbar = () => {
  const { 
    user, 
    switchRole, 
    logout, 
    settings, 
    toggleDarkMode, 
    activeTab, 
    setActiveTab,
    setIsAddLoadModalOpen
  } = useApp();

  const [time, setTime] = useState(new Date());
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef(null);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Close profile dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formattedTime = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const formattedDate = time.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'load-entry', label: 'Add Load', icon: PlusCircle },
    { id: 'history', label: 'Load History', icon: History },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'locations', label: 'Locations', icon: MapPin, adminOnly: true },
    { id: 'export', label: 'Export', icon: Download },
  ];

  return (
    <header className="sticky top-0 z-40 w-full px-4 lg:px-8 pt-4 pb-2">
      <div className="max-w-7xl mx-auto liquid-glass-card rounded-3xl p-3 lg:p-4 flex items-center justify-between gap-3 transition-all duration-300">
        
        {/* Brand Logo & Title */}
        <div className="flex items-center gap-3 shrink-0">
          <div 
            onClick={() => setActiveTab('dashboard')} 
            className="cursor-pointer flex items-center gap-3 group"
          >
            <div className="relative w-11 h-11 rounded-2xl bg-gradient-to-tr from-brand-600 to-blue-400 p-0.5 shadow-md shadow-blue-500/25 group-hover:scale-105 transition-transform duration-300">
              <div className="w-full h-full bg-white/20 dark:bg-black/20 backdrop-blur-md rounded-[14px] flex items-center justify-center text-white">
                <Truck className="w-6 h-6 stroke-[2.2]" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900" />
            </div>
            <div className="hidden sm:block">
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white leading-none">
                  {settings.companyName}
                </h1>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                  v26 Glass
                </span>
              </div>
              <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                {settings.tagline}
              </p>
            </div>
          </div>
        </div>

        {/* Live Clock Display (Desktop) */}
        <div className="hidden 2xl:flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-white/50 dark:bg-slate-800/50 border border-white/60 dark:border-white/10 backdrop-blur-md text-xs font-semibold text-slate-700 dark:text-slate-300 shrink-0">
          <Clock className="w-3.5 h-3.5 text-blue-500 animate-pulse" />
          <span>{formattedDate}</span>
          <span className="text-blue-600 dark:text-blue-400 font-mono font-bold ml-1">{formattedTime}</span>
        </div>

        {/* Desktop Nav Items */}
        <nav className="hidden lg:flex items-center gap-1 bg-slate-100/60 dark:bg-slate-900/60 p-1.5 rounded-2xl border border-white/40 dark:border-white/5 backdrop-blur-lg shrink min-w-0">
          {navItems.map(item => {
            if (item.adminOnly && user.role !== 'Admin') return null;
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  if (item.id === 'load-entry') {
                    setIsAddLoadModalOpen(true);
                  }
                  setActiveTab(item.id);
                }}
                className={`relative flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-200 shrink-0 ${
                  isActive 
                    ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-md shadow-black/5 dark:shadow-black/20 font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/40 dark:hover:bg-slate-800/40'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600 dark:text-blue-400' : 'opacity-70'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right Controls: Theme Toggle & Role Switcher */}
        <div className="flex items-center gap-2 shrink-0 relative" ref={profileMenuRef}>
          
          <button
            onClick={toggleDarkMode}
            className="p-2.5 rounded-2xl bg-white/60 dark:bg-slate-800/60 border border-white/70 dark:border-white/10 backdrop-blur-md text-slate-700 dark:text-slate-200 hover:scale-105 active:scale-95 transition-all shadow-sm"
            title="Toggle Light/Dark Theme"
          >
            {settings.darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
          </button>

          <button
            onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
            className="flex items-center gap-2 p-1.5 pr-3 rounded-2xl bg-white/70 dark:bg-slate-800/70 border border-white/80 dark:border-white/10 backdrop-blur-md shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-95 transition-all cursor-pointer"
            title="Account & Role Profile Settings"
          >
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-white shadow-sm font-bold ${
              user.role === 'Admin' 
                ? 'bg-gradient-to-tr from-blue-600 to-indigo-600' 
                : 'bg-gradient-to-tr from-emerald-600 to-teal-600'
            }`}>
              {user.role === 'Admin' ? <ShieldCheck className="w-4 h-4" /> : <Briefcase className="w-4 h-4" />}
            </div>

            <div className="text-left hidden sm:block">
              <span className="block text-xs font-bold text-slate-900 dark:text-white leading-none">
                {user.role === 'Admin' ? 'Admin' : 'Manager'}
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                Switch Role
              </span>
            </div>

            <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${isProfileMenuOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Profile & Role Dropdown */}
          {isProfileMenuOpen && (
            <div className="absolute right-0 top-full mt-2 w-64 z-50 liquid-glass-card rounded-3xl p-4 shadow-2xl border border-white/80 dark:border-white/15 backdrop-blur-3xl space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
              
              <div className="flex items-center gap-3 pb-3 border-b border-slate-200/60 dark:border-white/10">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-white font-bold shadow-md ${
                  user.role === 'Admin' 
                    ? 'bg-gradient-to-tr from-blue-600 to-indigo-600' 
                    : 'bg-gradient-to-tr from-emerald-600 to-teal-600'
                }`}>
                  {user.role === 'Admin' ? <ShieldCheck className="w-5 h-5" /> : <Briefcase className="w-5 h-5" />}
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-slate-900 dark:text-white">
                    {user.role === 'Admin' ? 'Admin User' : 'Manager User'}
                  </h4>
                  <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full mt-0.5 ${
                    user.role === 'Admin'
                      ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20'
                      : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                  }`}>
                    {user.role} Mode
                  </span>
                </div>
              </div>

              <div className="space-y-1.5">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block px-1">
                  Select User Access Role
                </span>

                <button
                  onClick={() => {
                    switchRole('Admin');
                    setIsProfileMenuOpen(false);
                  }}
                  className={`w-full p-2.5 rounded-2xl text-left text-xs font-bold transition-all flex items-center justify-between ${
                    user.role === 'Admin'
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
                      : 'bg-white/40 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Admin</span>
                  </div>
                  <span className="text-[10px] opacity-75 font-normal">Full Control</span>
                </button>

                <button
                  onClick={() => {
                    switchRole('Manager');
                    setIsProfileMenuOpen(false);
                  }}
                  className={`w-full p-2.5 rounded-2xl text-left text-xs font-bold transition-all flex items-center justify-between ${
                    user.role === 'Manager'
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/30'
                      : 'bg-white/40 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4" />
                    <span>Manager</span>
                  </div>
                  <span className="text-[10px] opacity-75 font-normal">Operations</span>
                </button>
              </div>

              <div className="pt-2 border-t border-slate-200/60 dark:border-white/10">
                <button
                  onClick={() => {
                    setIsProfileMenuOpen(false);
                    logout();
                  }}
                  className="w-full py-2.5 px-3 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-bold flex items-center justify-center gap-2 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out Session</span>
                </button>
              </div>

            </div>
          )}

        </div>

      </div>
    </header>
  );
};

// Bottom Mobile Navigation & Floating Action Button (FAB)
export const MobileNav = () => {
  const { activeTab, setActiveTab, setIsAddLoadModalOpen } = useApp();

  const navItems = [
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
    { id: 'history', label: 'Loads', icon: History },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'export', label: 'Export', icon: Download },
    { id: 'locations', label: 'Yards', icon: MapPin },
  ];

  return (
    <>
      <div className="lg:hidden fixed bottom-20 right-5 z-40">
        <button
          onClick={() => setIsAddLoadModalOpen(true)}
          className="flex items-center gap-2 px-4 py-3.5 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-sm shadow-xl shadow-blue-500/40 border border-white/30 backdrop-blur-md active:scale-95 transition-transform"
        >
          <Plus className="w-5 h-5 stroke-[2.5]" />
          <span>Add Load</span>
        </button>
      </div>

      <div className="lg:hidden fixed bottom-3 left-3 right-3 z-40">
        <div className="liquid-glass-card rounded-3xl p-2 flex items-center justify-around shadow-2xl border border-white/60 dark:border-white/10 backdrop-blur-3xl">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl transition-all ${
                  isActive 
                    ? 'text-blue-600 dark:text-blue-400 bg-white/60 dark:bg-slate-800/80 shadow-sm font-bold scale-105' 
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
                <span className="text-[10px] mt-0.5 font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
};
