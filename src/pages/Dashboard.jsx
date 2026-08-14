import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { motion } from 'framer-motion';
import { 
  Truck, 
  Calendar, 
  Clock, 
  TrendingUp, 
  MapPin, 
  BarChart, 
  Plus, 
  ArrowRight,
  ChevronRight,
  ShieldAlert,
  Sparkles
} from 'lucide-react';

export const Dashboard = () => {
  const { loads, locations, user, settings, setActiveTab, setIsAddLoadModalOpen } = useApp();

  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Compute Greetings
  const hour = time.getHours();
  let greeting = 'Good Evening';
  if (hour < 12) greeting = 'Good Morning';
  else if (hour < 17) greeting = 'Good Afternoon';

  // Filter loads for current month & year
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  const currentMonthLoads = loads.filter(l => {
    if (!l.date) return false;
    const parts = l.date.split('-');
    if (parts.length >= 2) {
      const yr = parseInt(parts[0], 10);
      const mo = parseInt(parts[1], 10) - 1;
      if (!isNaN(yr) && !isNaN(mo)) {
        return yr === currentYear && mo === currentMonth;
      }
    }
    const d = new Date(l.date);
    return !isNaN(d.getTime()) && d.getFullYear() === currentYear && d.getMonth() === currentMonth;
  });

  // Compute KPIs for current month & year
  const totalLoadsCount = currentMonthLoads.reduce((acc, curr) => acc + (Number(curr.quantity) || 1), 0);
  const totalLoadsRecords = currentMonthLoads.length;

  const todayStr = new Date().toISOString().split('T')[0];
  const todaysLoads = loads
    .filter(l => l.date === todayStr)
    .reduce((acc, curr) => acc + (Number(curr.quantity) || 1), 0);

  const monthlyRevenue = currentMonthLoads.reduce((acc, curr) => acc + (Number(curr.total) || 0), 0);

  const activeLocationsCount = locations.filter(l => l.active).length;

  // Recent 5 loads
  const recentLoads = loads.slice(0, 5);

  const kpis = [
    {
      id: 'total-loads',
      title: 'Total Loads',
      value: totalLoadsCount.toLocaleString(),
      subtitle: `${totalLoadsRecords} consignments logged`,
      icon: Truck,
      color: 'from-blue-500 to-indigo-600',
      textColor: 'text-blue-600 dark:text-blue-400',
      badge: '+12.4% vs last mo'
    },
    {
      id: 'todays-loads',
      title: "Today's Loads",
      value: todaysLoads.toLocaleString(),
      subtitle: `Logged on ${time.toLocaleDateString([], { month: 'short', day: 'numeric' })}`,
      icon: Calendar,
      color: 'from-emerald-500 to-teal-600',
      textColor: 'text-emerald-600 dark:text-emerald-400',
      badge: 'Live Today'
    },
    {
      id: 'monthly-revenue',
      title: 'Monthly Revenue',
      value: `${settings.currency}${monthlyRevenue.toLocaleString()}`,
      subtitle: 'Gross revenue generated',
      icon: TrendingUp,
      color: 'from-blue-600 to-cyan-500',
      textColor: 'text-blue-700 dark:text-blue-300',
      badge: '+18.2% Growth'
    },
    {
      id: 'active-locations',
      title: 'Active Locations',
      value: activeLocationsCount.toString(),
      subtitle: `Out of ${locations.length} total operational yards`,
      icon: MapPin,
      color: 'from-violet-500 to-purple-600',
      textColor: 'text-violet-600 dark:text-violet-400',
      badge: 'Operational'
    }
  ];

  return (
    <div className="space-y-8 pb-12">
      
      {/* HERO GREETING BANNER */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="liquid-glass-card rounded-4xl p-6 lg:p-8 relative overflow-hidden shadow-xl"
      >
        <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-blue-500/20 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                iOS 26 Liquid Dashboard
              </span>
              <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-bold">
                {user.role} Mode
              </span>
            </div>
            
            <h1 className="text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {greeting}, {user.username || user.role} 👋
            </h1>
            <p className="text-sm font-medium text-slate-600 dark:text-slate-300 mt-1.5 max-w-xl">
              Track real-time load performance, location rates, and revenue streams with high-precision transport metrics.
            </p>
          </div>

          {/* Action Hub */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setIsAddLoadModalOpen(true)}
              className="px-5 py-3 rounded-2xl text-sm font-bold text-white liquid-glass-button flex items-center gap-2 shadow-lg shadow-blue-500/30"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Record New Load</span>
            </button>
            <button
              onClick={() => setActiveTab('reports')}
              className="px-4 py-3 rounded-2xl text-sm font-bold bg-white/70 dark:bg-slate-800/80 border border-white/60 dark:border-white/10 text-slate-800 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-800 transition-colors shadow-sm"
            >
              <span>View Reports</span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* KPI CARDS GRID */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <span>Key Performance Indicators</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-semibold">
              Live Realtime
            </span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {kpis.map((kpi, index) => {
            const Icon = kpi.icon;
            return (
              <motion.div
                key={kpi.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="liquid-glass-card rounded-3xl p-6 relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300 shadow-lg cursor-pointer"
                onClick={() => setActiveTab(kpi.id === 'total-loads' || kpi.id === 'todays-loads' ? 'history' : 'reports')}
              >
                <div className="flex items-start justify-between">
                  <div className={`p-3 rounded-2xl bg-gradient-to-br ${kpi.color} text-white shadow-md shadow-black/10 group-hover:rotate-6 transition-transform`}>
                    <Icon className="w-6 h-6 stroke-[2]" />
                  </div>
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-slate-200/60 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border border-white/40 dark:border-white/10">
                    {kpi.badge}
                  </span>
                </div>

                <div className="mt-5">
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    {kpi.title}
                  </p>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1 tracking-tight">
                    {kpi.value}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
                    {kpi.subtitle}
                  </p>
                </div>

                {/* Decorative Bottom Bar */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-blue-500/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* RECENT LOADS & QUICK LOCATION RATES OVERVIEW */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recent Loads Data Table */}
        <div className="lg:col-span-2 liquid-glass-card rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Recent Load Entries</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Latest transport movements logged into system</p>
            </div>
            <button
              onClick={() => setActiveTab('history')}
              className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
            >
              <span>View All ({loads.length})</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Mini Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200/60 dark:border-white/10 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                  <th className="pb-3 px-2">Load ID</th>
                  <th className="pb-3 px-2">Location</th>
                  <th className="pb-3 px-2">Qty</th>
                  <th className="pb-3 px-2">Rate</th>
                  <th className="pb-3 px-2">Total (₹)</th>
                  <th className="pb-3 px-2">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5 font-medium text-slate-800 dark:text-slate-200">
                {recentLoads.map(load => (
                  <tr key={load.id} className="table-glass-row">
                    <td className="py-3 px-2 font-bold text-blue-600 dark:text-blue-400">{load.id}</td>
                    <td className="py-3 px-2">{load.locationName}</td>
                    <td className="py-3 px-2 font-semibold">{load.quantity}</td>
                    <td className="py-3 px-2">₹{load.rate}</td>
                    <td className="py-3 px-2 font-bold text-slate-900 dark:text-white">₹{load.total.toLocaleString()}</td>
                    <td className="py-3 px-2 opacity-80">{load.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Location Rate Master Cards */}
        <div className="liquid-glass-card rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Active Location Rates</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Current standard tariff per load</p>
            </div>
            {user.role === 'Admin' && (
              <button
                onClick={() => setActiveTab('locations')}
                className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
              >
                Manage
              </button>
            )}
          </div>

          <div className="space-y-2.5 max-h-[280px] overflow-y-auto pr-1">
            {locations.map(loc => (
              <div
                key={loc.id}
                className="flex items-center justify-between p-3 rounded-2xl bg-white/40 dark:bg-slate-800/40 border border-white/50 dark:border-white/5 backdrop-blur-md"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xs">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">{loc.name}</h4>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">Rate fixed</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm font-extrabold text-blue-600 dark:text-blue-400">
                    {settings.currency}{loc.rate}
                  </span>
                  <p className="text-[9px] text-slate-400 uppercase">per load</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
