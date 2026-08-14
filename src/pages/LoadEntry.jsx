import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { motion } from 'framer-motion';
import { Truck, MapPin, Calendar, Hash, FileText, CheckCircle2, RotateCcw, Calculator, ArrowRight } from 'lucide-react';

export const LoadEntry = ({ isModal = false, onClose = () => {} }) => {
  const { locations, addLoad, settings, setActiveTab } = useApp();

  const activeLocations = locations.filter(l => l.active);

  const [locationName, setLocationName] = useState(activeLocations[0]?.name || 'Sidco');
  const [quantity, setQuantity] = useState('1');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [remarks, setRemarks] = useState('');
  const [errors, setErrors] = useState({});

  // Get current rate of selected location
  const selectedLocObj = locations.find(l => l.name === locationName);
  const currentRate = selectedLocObj ? selectedLocObj.rate : 600;
  const computedTotal = (Number(quantity) || 0) * currentRate;

  const handleLocationChange = (e) => {
    setLocationName(e.target.value);
  };

  const handleClear = () => {
    setLocationName(activeLocations[0]?.name || 'Sidco');
    setQuantity('1');
    setDate(new Date().toISOString().split('T')[0]);
    setRemarks('');
    setErrors({});
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!locationName) {
      newErrors.locationName = 'Please select a location';
    }
    if (!quantity || Number(quantity) <= 0) {
      newErrors.quantity = 'Please enter a valid load quantity (> 0)';
    }
    if (!date) {
      newErrors.date = 'Please select a date';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    addLoad({
      locationName,
      quantity: Number(quantity),
      date,
      remarks,
      rate: currentRate
    });

    handleClear();
    if (isModal) {
      onClose();
    } else {
      setActiveTab('history');
    }
  };

  const content = (
    <div className="space-y-6">
      
      {/* Form Title Header */}
      {!isModal && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <Truck className="w-8 h-8 text-blue-600 dark:text-blue-400 stroke-[2.2]" />
              <span>Record New Load Consignment</span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Enter transport details to log load volume and compute automated location tariffs
            </p>
          </div>
        </div>
      )}

      {/* Main Glass Card Form */}
      <div className="liquid-glass-card rounded-4xl p-6 sm:p-8 shadow-2xl border border-white/70 dark:border-white/15 backdrop-blur-3xl">
        
        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Location Select Dropdown */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-blue-500" />
                <span>Select Location Yard *</span>
              </label>
              <select
                value={locationName}
                onChange={handleLocationChange}
                className="w-full px-4 py-3 rounded-2xl text-sm font-semibold text-slate-900 dark:text-white liquid-glass-input outline-none cursor-pointer"
              >
                {activeLocations.map(loc => (
                  <option key={loc.id} value={loc.name} className="bg-slate-900 text-white">
                    {loc.name} — ({settings.currency}{loc.rate} / load)
                  </option>
                ))}
              </select>
              {errors.locationName && (
                <p className="text-[11px] font-bold text-rose-500 mt-1">{errors.locationName}</p>
              )}
            </div>

            {/* Load Quantity Input */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1.5">
                <Hash className="w-4 h-4 text-blue-500" />
                <span>Load Quantity (Units / Trucks) *</span>
              </label>
              <input
                type="number"
                min="1"
                step="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="e.g. 15"
                className="w-full px-4 py-3 rounded-2xl text-sm font-semibold text-slate-900 dark:text-white liquid-glass-input outline-none"
              />
              {errors.quantity && (
                <p className="text-[11px] font-bold text-rose-500 mt-1">{errors.quantity}</p>
              )}
            </div>

            {/* Date Input */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-blue-500" />
                <span>Consignment Date *</span>
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl text-sm font-semibold text-slate-900 dark:text-white liquid-glass-input outline-none"
              />
              {errors.date && (
                <p className="text-[11px] font-bold text-rose-500 mt-1">{errors.date}</p>
              )}
            </div>

            {/* Remarks / Truck Number / Notes */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-blue-500" />
                <span>Driver / Truck No / Remarks</span>
              </label>
              <input
                type="text"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="e.g. Truck TN-38-AX-9912 / Priority load"
                className="w-full px-4 py-3 rounded-2xl text-sm font-medium text-slate-900 dark:text-white liquid-glass-input outline-none"
              />
            </div>

          </div>

          {/* REALTIME CALCULATION PREVIEW CARD */}
          <div className="p-5 rounded-3xl bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-emerald-500/10 border border-blue-500/20 backdrop-blur-xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/30">
                <Calculator className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-blue-600 dark:text-blue-400 tracking-wider">
                  Automated Valuation Breakdown
                </span>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  {quantity || 0} Loads @ {settings.currency}{currentRate} / load
                </h4>
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold block">Total Revenue</span>
              <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                {settings.currency}{computedTotal.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={handleClear}
              className="px-5 py-3 rounded-2xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-slate-800/50 transition-colors flex items-center gap-1.5"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Clear</span>
            </button>

            <button
              type="submit"
              className="px-7 py-3.5 rounded-2xl text-xs font-bold text-white liquid-glass-button flex items-center gap-2 shadow-lg shadow-blue-500/30"
            >
              <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
              <span>Save Load Consignment</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );

  return content;
};
