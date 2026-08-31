import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { motion } from 'framer-motion';
import { 
  FileText, 
  Calendar, 
  Filter, 
  TrendingUp, 
  Award, 
  Layers, 
  Download, 
  Printer,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { formatDateDDMMYYYY } from '../lib/dateUtils';

export const Reports = () => {
  const { loads, locations, settings, setActiveTab, addToast } = useApp();

  const [timeFilter, setTimeFilter] = useState('MONTHLY'); // 'DAILY', 'WEEKLY', 'MONTHLY', 'CUSTOM'
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Date Filtering Logic
  const filteredLoads = useMemo(() => {
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    return loads.filter(load => {
      const loadDate = new Date(load.date);

      if (timeFilter === 'DAILY') {
        const todayStr = new Date().toISOString().split('T')[0];
        return load.date === todayStr;
      }

      if (timeFilter === 'WEEKLY') {
        const weekAgo = new Date();
        weekAgo.setDate(today.getDate() - 7);
        return loadDate >= weekAgo && loadDate <= today;
      }

      if (timeFilter === 'MONTHLY') {
        const monthAgo = new Date();
        monthAgo.setDate(today.getDate() - 30);
        return loadDate >= monthAgo && loadDate <= today;
      }

      if (timeFilter === 'CUSTOM') {
        if (!startDate && !endDate) return true;
        const start = startDate ? new Date(startDate) : new Date('2000-01-01');
        const end = endDate ? new Date(endDate) : new Date('2099-12-31');
        end.setHours(23, 59, 59, 999);
        return loadDate >= start && loadDate <= end;
      }

      return true;
    });
  }, [loads, timeFilter, startDate, endDate]);

  // Aggregate Revenue Per Location
  const locationBreakdown = useMemo(() => {
    const map = {};

    // Initialize map with all known locations
    locations.forEach(loc => {
      map[loc.name] = {
        locationName: loc.name,
        rate: loc.rate,
        loadsCount: 0,
        totalRevenue: 0
      };
    });

    // Accumulate filtered loads
    filteredLoads.forEach(load => {
      if (!map[load.locationName]) {
        map[load.locationName] = {
          locationName: load.locationName,
          rate: load.rate || 0,
          loadsCount: 0,
          totalRevenue: 0
        };
      }
      const qty = Number(load.quantity) || 1;
      const rev = Number(load.total) || (qty * (load.rate || 0));

      map[load.locationName].loadsCount += qty;
      map[load.locationName].totalRevenue += rev;
    });

    return Object.values(map);
  }, [locations, filteredLoads]);

  // Compute Grand Totals
  const grandTotalLoads = locationBreakdown.reduce((acc, curr) => acc + curr.loadsCount, 0);
  const grandTotalRevenue = locationBreakdown.reduce((acc, curr) => acc + curr.totalRevenue, 0);
  const totalLocationsCount = locations.filter(l => l.active).length;

  // Best Performing Location
  let bestLocation = { locationName: 'None', totalRevenue: 0, loadsCount: 0 };
  locationBreakdown.forEach(item => {
    if (item.totalRevenue > bestLocation.totalRevenue) {
      bestLocation = item;
    }
  });

  const bestLocPercentage = grandTotalRevenue > 0 
    ? Math.round((bestLocation.totalRevenue / grandTotalRevenue) * 100) 
    : 0;

  const handlePrintReport = () => {
    window.print();
    addToast('Opening print dialog for report', 'info');
  };

  return (
    <div className="space-y-8 pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <FileText className="w-8 h-8 text-blue-600 dark:text-blue-400 stroke-[2.2]" />
            <span>Transport Revenue & Load Reports</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Automated location tariff breakdown and executive financial summaries
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrintReport}
            className="px-4 py-2.5 rounded-2xl bg-white/70 dark:bg-slate-800/70 border border-white/60 dark:border-white/10 text-slate-800 dark:text-slate-200 text-xs font-bold flex items-center gap-1.5 shadow-sm hover:bg-white dark:hover:bg-slate-800 transition-colors"
          >
            <Printer className="w-4 h-4 text-blue-500" />
            <span>Print Report</span>
          </button>
          
          <button
            onClick={() => setActiveTab('export')}
            className="px-4 py-2.5 rounded-2xl text-xs font-bold text-white liquid-glass-button flex items-center gap-1.5 shadow-md shadow-blue-500/30"
          >
            <Download className="w-4 h-4" />
            <span>PDF Export Center</span>
          </button>
        </div>
      </div>

      {/* REPORT TIME RANGE FILTER BAR */}
      <div className="liquid-glass-card rounded-3xl p-4 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-blue-500" />
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Select Time Frame:</span>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {['DAILY', 'WEEKLY', 'MONTHLY', 'CUSTOM'].map(filter => (
            <button
              key={filter}
              onClick={() => setTimeFilter(filter)}
              className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all ${
                timeFilter === filter
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
                  : 'bg-white/50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Custom Range Picker */}
        {timeFilter === 'CUSTOM' && (
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-3 py-1.5 rounded-xl text-xs font-medium liquid-glass-input"
            />
            <span className="text-xs text-slate-400">to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-3 py-1.5 rounded-xl text-xs font-medium liquid-glass-input"
            />
          </div>
        )}
      </div>

      {/* GRAND TOTAL PREMIUM GLASS CARD */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="liquid-glass-card rounded-4xl p-6 lg:p-8 relative overflow-hidden shadow-2xl border border-white/80 dark:border-white/15"
      >
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-gradient-to-br from-blue-500/20 via-emerald-500/20 to-transparent blur-3xl pointer-events-none" />

        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-200/60 dark:border-white/10">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold">
              <Sparkles className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Executive Grand Summary</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Aggregated payload metrics for selected window</p>
            </div>
          </div>
          <span className="text-xs font-extrabold uppercase px-3 py-1 rounded-full bg-blue-600 text-white shadow-sm">
            {timeFilter}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          
          <div className="p-5 rounded-3xl bg-white/40 dark:bg-slate-800/40 border border-white/50 dark:border-white/5 backdrop-blur-md">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Total Loads Handled
            </span>
            <h3 className="text-3xl font-black text-slate-900 dark:text-white mt-1">
              {grandTotalLoads.toLocaleString()}
            </h3>
            <span className="text-[11px] text-blue-600 dark:text-blue-400 font-bold mt-1 block">
              Units dispatched
            </span>
          </div>

          <div className="p-5 rounded-3xl bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border border-blue-500/20 backdrop-blur-md">
            <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
              Grand Revenue Total
            </span>
            <h3 className="text-3xl font-black text-slate-900 dark:text-white mt-1">
              {settings.currency}{grandTotalRevenue.toLocaleString()}
            </h3>
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold mt-1 block">
              Formula: Loads × Rate
            </span>
          </div>

          <div className="p-5 rounded-3xl bg-white/40 dark:bg-slate-800/40 border border-white/50 dark:border-white/5 backdrop-blur-md">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Active Yards
            </span>
            <h3 className="text-3xl font-black text-slate-900 dark:text-white mt-1">
              {totalLocationsCount}
            </h3>
            <span className="text-[11px] text-slate-400 font-medium mt-1 block">
              Operational locations
            </span>
          </div>

          <div className="p-5 rounded-3xl bg-amber-500/10 border border-amber-500/20 backdrop-blur-md">
            <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-bold text-xs">
              <Award className="w-4 h-4" />
              <span className="uppercase tracking-wider">Top Performing Yard</span>
            </div>
            <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mt-1 truncate">
              {bestLocation.locationName}
            </h3>
            <span className="text-[11px] text-amber-700 dark:text-amber-300 font-semibold mt-0.5 block">
              {settings.currency}{bestLocation.totalRevenue.toLocaleString()} ({bestLocPercentage}% share)
            </span>
          </div>

        </div>

      </motion.div>

      {/* RECENTLY ADDED LOADS HISTORY TABLE */}
      <div className="liquid-glass-card rounded-4xl p-6 lg:p-8 shadow-2xl space-y-4">
        
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Recently Added Loads History</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Dispatched load consignments recorded for selected period ({timeFilter})
            </p>
          </div>
          <button
            onClick={() => setActiveTab('history')}
            className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
          >
            <span>View Full History ({loads.length})</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200/60 dark:border-white/10 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                <th className="pb-3 px-3">Load ID</th>
                <th className="pb-3 px-3">Location</th>
                <th className="pb-3 px-3 text-center">Quantity</th>
                <th className="pb-3 px-3">Tariff Rate</th>
                <th className="pb-3 px-3">Total Amount</th>
                <th className="pb-3 px-3">Consignment Date</th>
                <th className="pb-3 px-3">Logged By</th>
                <th className="pb-3 px-3">Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5 font-medium text-slate-800 dark:text-slate-200">
              {filteredLoads.length > 0 ? (
                filteredLoads.map(load => (
                  <tr key={load.id} className="table-glass-row">
                    <td className="py-3.5 px-3 font-extrabold text-blue-600 dark:text-blue-400">{load.id}</td>
                    <td className="py-3.5 px-3 font-semibold">{load.locationName}</td>
                    <td className="py-3.5 px-3 text-center font-bold">
                      <span className="px-2.5 py-1 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                        {load.quantity}
                      </span>
                    </td>
                    <td className="py-3.5 px-3">{settings.currency}{load.rate}</td>
                    <td className="py-3.5 px-3 font-extrabold text-slate-900 dark:text-white">
                      {settings.currency}{load.total.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-3 font-mono opacity-80">{formatDateDDMMYYYY(load.date)}</td>
                    <td className="py-3.5 px-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-200/60 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300">
                        {load.createdBy || 'Admin'}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 max-w-xs truncate opacity-75">{load.remarks || '—'}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 font-medium">
                    No load consignments recorded for this selected time window ({timeFilter}).
                  </td>
                </tr>
              )}
            </tbody>
            {filteredLoads.length > 0 && (
              <tfoot>
                <tr className="border-t-2 border-slate-900/10 dark:border-white/20 font-black text-slate-900 dark:text-white text-sm">
                  <td className="pt-4 px-3">Total Summary</td>
                  <td className="pt-4 px-3 opacity-60">—</td>
                  <td className="pt-4 px-3 text-center font-black">{grandTotalLoads} loads</td>
                  <td className="pt-4 px-3 opacity-60">—</td>
                  <td className="pt-4 px-3 text-blue-600 dark:text-blue-400">
                    {settings.currency}{grandTotalRevenue.toLocaleString()}
                  </td>
                  <td colSpan={3} className="pt-4 px-3 text-xs font-bold text-slate-500 text-right">
                    Showing {filteredLoads.length} consignment entries
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>

      </div>

    </div>
  );
};
