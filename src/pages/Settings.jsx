import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { motion } from 'framer-motion';
import { 
  Settings as SettingsIcon, 
  Building2, 
  DollarSign, 
  Moon, 
  Sun, 
  Bell, 
  Upload, 
  Save, 
  ShieldCheck, 
  User, 
  RotateCcw,
  Sparkles
} from 'lucide-react';

export const Settings = () => {
  const { settings, setSettings, toggleDarkMode, user, switchRole, addToast } = useApp();

  const [companyName, setCompanyName] = useState(settings.companyName);
  const [tagline, setTagline] = useState(settings.tagline);
  const [currency, setCurrency] = useState(settings.currency);
  const [notificationsEnabled, setNotificationsEnabled] = useState(settings.notificationsEnabled);

  const handleSaveSettings = (e) => {
    e.preventDefault();
    setSettings(prev => ({
      ...prev,
      companyName,
      tagline,
      currency,
      notificationsEnabled
    }));
    addToast('Company settings updated successfully!', 'success');
  };

  return (
    <div className="space-y-8 pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <SettingsIcon className="w-8 h-8 text-blue-600 dark:text-blue-400 stroke-[2.2]" />
            <span>Platform Settings & Customization</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Configure company identity, currency formats, liquid glass themes, and notification preferences
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Settings Form */}
        <div className="lg:col-span-2 liquid-glass-card rounded-4xl p-6 sm:p-8 shadow-2xl space-y-6">
          
          <form onSubmit={handleSaveSettings} className="space-y-6">
            
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-blue-500" />
                <span>Company Profile & Branding</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Transport Company Name
                  </label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl text-sm font-semibold text-slate-900 dark:text-white liquid-glass-input outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Company Tagline
                  </label>
                  <input
                    type="text"
                    value={tagline}
                    onChange={(e) => setTagline(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl text-sm font-semibold text-slate-900 dark:text-white liquid-glass-input outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Currency Selection */}
            <div className="pt-4 border-t border-slate-200/60 dark:border-white/10">
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-500" />
                <span>Financial Currency Unit</span>
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { symbol: '₹', label: 'INR (Rupees)' },
                  { symbol: '$', label: 'USD ($)' },
                  { symbol: '€', label: 'EUR (€)' },
                  { symbol: '£', label: 'GBP (£)' }
                ].map(curr => (
                  <button
                    key={curr.symbol}
                    type="button"
                    onClick={() => setCurrency(curr.symbol)}
                    className={`p-3.5 rounded-2xl text-xs font-bold border transition-all flex flex-col items-center gap-1 ${
                      currency === curr.symbol
                        ? 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-500/30'
                        : 'bg-white/40 dark:bg-slate-800/40 border-white/50 dark:border-white/10 text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    <span className="text-lg font-black">{curr.symbol}</span>
                    <span>{curr.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Notifications */}
            <div className="pt-4 border-t border-slate-200/60 dark:border-white/10">
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <Bell className="w-4 h-4 text-purple-500" />
                <span>Notification Preferences</span>
              </h3>

              <label className="flex items-center justify-between p-4 rounded-2xl bg-white/40 dark:bg-slate-800/40 border border-white/50 dark:border-white/10 cursor-pointer">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">Liquid Glass Toast Alerts</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Show floating toast notifications when loads or rates are saved</p>
                </div>
                <input
                  type="checkbox"
                  checked={notificationsEnabled}
                  onChange={(e) => setNotificationsEnabled(e.target.checked)}
                  className="w-5 h-5 rounded text-blue-600"
                />
              </label>
            </div>

            {/* Save Button */}
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="px-6 py-3.5 rounded-2xl text-xs font-bold text-white liquid-glass-button flex items-center gap-2 shadow-lg shadow-blue-500/30"
              >
                <Save className="w-4 h-4" />
                <span>Save All Settings</span>
              </button>
            </div>

          </form>

        </div>

        {/* Theme & User Controls */}
        <div className="space-y-6">
          
          {/* iOS Theme Switcher Card */}
          <div className="liquid-glass-card rounded-4xl p-6 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>iOS 26 Liquid Theme Mode</span>
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => !settings.darkMode || toggleDarkMode()}
                className={`p-4 rounded-3xl text-center border transition-all flex flex-col items-center gap-2 ${
                  !settings.darkMode
                    ? 'bg-blue-600 text-white border-blue-500 shadow-md'
                    : 'bg-white/40 dark:bg-slate-800/40 text-slate-400 border-transparent'
                }`}
              >
                <Sun className="w-6 h-6" />
                <span className="text-xs font-bold">Light Glass</span>
              </button>

              <button
                onClick={() => settings.darkMode || toggleDarkMode()}
                className={`p-4 rounded-3xl text-center border transition-all flex flex-col items-center gap-2 ${
                  settings.darkMode
                    ? 'bg-blue-600 text-white border-blue-500 shadow-md'
                    : 'bg-white/40 dark:bg-slate-800/40 text-slate-400 border-transparent'
                }`}
              >
                <Moon className="w-6 h-6" />
                <span className="text-xs font-bold">Dark Slate</span>
              </button>
            </div>
          </div>

          {/* Active Session & Role Pill */}
          <div className="liquid-glass-card rounded-4xl p-6 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-500" />
              <span>Active User Role</span>
            </h3>

            <div className="p-4 rounded-2xl bg-white/40 dark:bg-slate-800/40 border border-white/50 dark:border-white/10 text-xs space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Username:</span>
                <span className="font-bold text-slate-900 dark:text-white">{user.username}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Current Role:</span>
                <span className="font-black text-blue-600 dark:text-blue-400 uppercase">{user.role}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => switchRole('Admin')}
                className="py-2.5 rounded-2xl bg-blue-500/10 text-blue-600 font-bold text-xs hover:bg-blue-500/20"
              >
                Switch to Admin
              </button>
              <button
                onClick={() => switchRole('Staff')}
                className="py-2.5 rounded-2xl bg-slate-500/10 text-slate-600 font-bold text-xs hover:bg-slate-500/20"
              >
                Switch to Staff
              </button>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
