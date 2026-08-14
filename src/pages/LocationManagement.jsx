import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Plus, Edit2, Trash2, Check, X, ShieldAlert, DollarSign, Layers } from 'lucide-react';

export const LocationManagement = () => {
  const { 
    locations, 
    addLocation, 
    editLocation, 
    toggleLocationActive, 
    deleteLocation, 
    loads, 
    user, 
    settings 
  } = useApp();

  const [newLocName, setNewLocName] = useState('');
  const [newLocRate, setNewLocRate] = useState('');
  const [editingLocId, setEditingLocId] = useState(null);
  const [editingRate, setEditingRate] = useState('');

  // Access Control Check
  if (user.role !== 'Admin') {
    return (
      <div className="liquid-glass-card rounded-4xl p-10 text-center max-w-lg mx-auto my-12 space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-rose-500/20 text-rose-500 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Admin Access Required</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Location & Rate Management is restricted to Admin personnel only. Please switch your user mode to "Admin" using the top bar to access rate settings.
        </p>
      </div>
    );
  }

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!newLocName.trim() || !newLocRate) return;

    const success = addLocation({
      name: newLocName,
      rate: Number(newLocRate)
    });

    if (success) {
      setNewLocName('');
      setNewLocRate('');
    }
  };

  const handleStartEdit = (loc) => {
    setEditingLocId(loc.id);
    setEditingRate(loc.rate.toString());
  };

  const handleSaveEdit = (id) => {
    editLocation(id, editingRate);
    setEditingLocId(null);
  };

  return (
    <div className="space-y-8 pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <MapPin className="w-8 h-8 text-blue-600 dark:text-blue-400 stroke-[2.2]" />
            <span>Yard Locations & Rate Tariff Master</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Manage dispatch locations, set fixed tariffs per load, and configure operational yards
          </p>
        </div>
      </div>

      {/* ADD LOCATION FORM CARD */}
      <div className="liquid-glass-card rounded-4xl p-6 sm:p-8 shadow-xl">
        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <Plus className="w-4 h-4 text-blue-500" />
          <span>Add New Location & Set Tariff Rate</span>
        </h3>

        <form onSubmit={handleAddSubmit} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Location Name
            </label>
            <input
              type="text"
              value={newLocName}
              onChange={(e) => setNewLocName(e.target.value)}
              placeholder="e.g. Coimbatore Hub"
              className="w-full px-4 py-2.5 rounded-2xl text-sm font-medium text-slate-900 dark:text-white liquid-glass-input outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Rate Per Load ({settings.currency})
            </label>
            <input
              type="number"
              min="0"
              value={newLocRate}
              onChange={(e) => setNewLocRate(e.target.value)}
              placeholder="e.g. 750"
              className="w-full px-4 py-2.5 rounded-2xl text-sm font-medium text-slate-900 dark:text-white liquid-glass-input outline-none"
            />
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              className="w-full py-3 px-5 rounded-2xl text-xs font-bold text-white liquid-glass-button flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Add Location Yard</span>
            </button>
          </div>
        </form>
      </div>

      {/* LOCATIONS LIST GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {locations.map(loc => {
          // Calculate stats for this location
          const locLoads = loads.filter(l => l.locationName === loc.name);
          const totalQty = locLoads.reduce((acc, curr) => acc + (Number(curr.quantity) || 1), 0);
          const totalRev = locLoads.reduce((acc, curr) => acc + (Number(curr.total) || 0), 0);

          const isEditing = editingLocId === loc.id;

          return (
            <motion.div
              key={loc.id}
              layout
              className="liquid-glass-card rounded-3xl p-6 relative flex flex-col justify-between shadow-lg space-y-4"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">{loc.name}</h3>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      loc.active 
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' 
                        : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                    }`}>
                      {loc.active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleStartEdit(loc)}
                    className="p-2 rounded-xl text-slate-400 hover:text-blue-600 hover:bg-blue-500/10 transition-colors"
                    title="Edit Rate"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteLocation(loc.id)}
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-500/10 transition-colors"
                    title="Delete Location"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Rate Box */}
              <div className="p-4 rounded-2xl bg-slate-100/60 dark:bg-slate-800/60 border border-white/50 dark:border-white/10 flex items-center justify-between">
                <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">Tariff Per Load</span>
                
                {isEditing ? (
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      value={editingRate}
                      onChange={(e) => setEditingRate(e.target.value)}
                      className="w-20 px-2 py-1 text-sm font-bold rounded-xl text-slate-900 dark:text-white liquid-glass-input"
                    />
                    <button
                      onClick={() => handleSaveEdit(loc.id)}
                      className="p-1.5 rounded-xl bg-emerald-500 text-white"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setEditingLocId(null)}
                      className="p-1.5 rounded-xl bg-slate-400 text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <span className="text-xl font-extrabold text-blue-600 dark:text-blue-400">
                    {settings.currency}{loc.rate}
                  </span>
                )}
              </div>

              {/* Performance Summary */}
              <div className="grid grid-cols-2 gap-2 text-center text-xs pt-1 border-t border-slate-200/50 dark:border-white/10">
                <div>
                  <span className="text-[10px] text-slate-400 font-medium block">Total Loads</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{totalQty} units</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-medium block">Gross Earnings</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    {settings.currency}{totalRev.toLocaleString()}
                  </span>
                </div>
              </div>

            </motion.div>
          );
        })}
      </div>

    </div>
  );
};
