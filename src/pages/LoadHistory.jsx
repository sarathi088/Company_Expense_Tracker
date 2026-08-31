import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Filter, 
  ArrowUpDown, 
  Download, 
  Trash2, 
  Edit, 
  ChevronLeft, 
  ChevronRight, 
  FileSpreadsheet, 
  FileText, 
  Plus,
  Calendar,
  X,
  Check
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { formatDateDDMMYYYY } from '../lib/dateUtils';

export const LoadHistory = () => {
  const { loads, locations, deleteLoad, editLoad, user, settings, addToast, setIsAddLoadModalOpen } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('ALL');
  const [sortBy, setSortBy] = useState('date-desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Edit Modal State
  const [editingLoad, setEditingLoad] = useState(null);

  // Filter & Sort Logic
  const filteredLoads = useMemo(() => {
    return loads.filter(load => {
      const matchesSearch = 
        load.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        load.locationName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (load.remarks && load.remarks.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (load.createdBy && load.createdBy.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesLocation = selectedLocation === 'ALL' || load.locationName === selectedLocation;

      return matchesSearch && matchesLocation;
    }).sort((a, b) => {
      if (sortBy === 'date-desc') return new Date(b.date) - new Date(a.date);
      if (sortBy === 'date-asc') return new Date(a.date) - new Date(b.date);
      if (sortBy === 'total-desc') return b.total - a.total;
      if (sortBy === 'total-asc') return a.total - b.total;
      if (sortBy === 'qty-desc') return b.quantity - a.quantity;
      return 0;
    });
  }, [loads, searchTerm, selectedLocation, sortBy]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredLoads.length / pageSize) || 1;
  const paginatedLoads = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredLoads.slice(start, start + pageSize);
  }, [filteredLoads, currentPage, pageSize]);

  // Export CSV
  const handleExportCSV = () => {
    if (filteredLoads.length === 0) {
      addToast('No data available to export', 'error');
      return;
    }

    const headers = ['Load ID', 'Location', 'Quantity', 'Rate (₹)', 'Total Amount (₹)', 'Date', 'Remarks', 'Logged By'];
    const rows = filteredLoads.map(l => [
      l.id,
      l.locationName,
      l.quantity,
      l.rate,
      l.total,
      formatDateDDMMYYYY(l.date),
      `"${l.remarks || ''}"`,
      l.createdBy
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Load_History_Export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    addToast('Load history exported as CSV successfully!', 'success');
  };

  // Export Excel
  const handleExportExcel = () => {
    if (filteredLoads.length === 0) {
      addToast('No data available to export', 'error');
      return;
    }

    const exportData = filteredLoads.map(l => ({
      'Load ID': l.id,
      'Location Yard': l.locationName,
      'Load Quantity': l.quantity,
      'Tariff Rate (₹)': l.rate,
      'Total Amount (₹)': l.total,
      'Consignment Date': formatDateDDMMYYYY(l.date),
      'Remarks': l.remarks || '',
      'Created By': l.createdBy
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Load Consignments');
    XLSX.writeFile(workbook, `Company_Loads_${new Date().toISOString().split('T')[0]}.xlsx`);

    addToast('Load history exported as Excel (.xlsx) successfully!', 'success');
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Load Consignment History
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Search, filter, edit, and export complete dispatch logs
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2.5 rounded-2xl bg-white/70 dark:bg-slate-800/70 border border-white/60 dark:border-white/10 text-slate-800 dark:text-slate-200 text-xs font-bold flex items-center gap-1.5 shadow-sm hover:bg-white dark:hover:bg-slate-800 transition-colors"
          >
            <FileText className="w-4 h-4 text-blue-500" />
            <span>CSV</span>
          </button>
          
          <button
            onClick={handleExportExcel}
            className="px-3.5 py-2.5 rounded-2xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
            <span>Excel (.xlsx)</span>
          </button>

          <button
            onClick={() => setIsAddLoadModalOpen(true)}
            className="px-4 py-2.5 rounded-2xl text-xs font-bold text-white liquid-glass-button flex items-center gap-1.5 shadow-md shadow-blue-500/30"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add Load</span>
          </button>
        </div>
      </div>

      {/* FILTER & SEARCH CONTROLS BAR */}
      <div className="liquid-glass-card rounded-3xl p-4 shadow-lg flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Search Bar */}
        <div className="relative w-full md:w-80">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search Load ID, location, remarks..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl text-xs font-medium text-slate-900 dark:text-white liquid-glass-input outline-none"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          
          {/* Location Filter */}
          <div className="flex items-center gap-1.5">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="px-3 py-2 rounded-2xl text-xs font-semibold text-slate-900 dark:text-white liquid-glass-input outline-none cursor-pointer"
            >
              <option value="ALL" className="bg-slate-900 text-white">All Locations</option>
              {locations.map(l => (
                <option key={l.id} value={l.name} className="bg-slate-900 text-white">{l.name}</option>
              ))}
            </select>
          </div>

          {/* Sort Filter */}
          <div className="flex items-center gap-1.5">
            <ArrowUpDown className="w-4 h-4 text-slate-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 rounded-2xl text-xs font-semibold text-slate-900 dark:text-white liquid-glass-input outline-none cursor-pointer"
            >
              <option value="date-desc" className="bg-slate-900 text-white">Date: Newest First</option>
              <option value="date-asc" className="bg-slate-900 text-white">Date: Oldest First</option>
              <option value="total-desc" className="bg-slate-900 text-white">Total: High to Low</option>
              <option value="total-asc" className="bg-slate-900 text-white">Total: Low to High</option>
              <option value="qty-desc" className="bg-slate-900 text-white">Quantity: High to Low</option>
            </select>
          </div>

        </div>
      </div>

      {/* DATA GRID TABLE */}
      <div className="liquid-glass-card rounded-4xl p-6 shadow-2xl overflow-hidden">
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200/60 dark:border-white/10 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                <th className="pb-3 px-3">Load ID</th>
                <th className="pb-3 px-3">Location</th>
                <th className="pb-3 px-3 text-center">Quantity</th>
                <th className="pb-3 px-3">Tariff Rate</th>
                <th className="pb-3 px-3">Total Amount</th>
                <th className="pb-3 px-3">Date</th>
                <th className="pb-3 px-3">Logged By</th>
                <th className="pb-3 px-3">Remarks</th>
                {user.role === 'Admin' && <th className="pb-3 px-3 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5 font-medium text-slate-800 dark:text-slate-200">
              {paginatedLoads.length > 0 ? (
                paginatedLoads.map(load => (
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
                        {load.createdBy}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 max-w-xs truncate opacity-75">{load.remarks || '—'}</td>
                    
                    {user.role === 'Admin' && (
                      <td className="py-3.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setEditingLoad({ ...load })}
                            className="p-1.5 rounded-xl text-slate-400 hover:text-blue-600 hover:bg-blue-500/10 transition-colors"
                            title="Edit Load"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteLoad(load.id)}
                            className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-500/10 transition-colors"
                            title="Delete Load"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={user.role === 'Admin' ? 9 : 8} className="py-12 text-center text-slate-400 font-medium">
                    No load records matched your current query or filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION BAR */}
        <div className="mt-6 pt-4 border-t border-slate-200/60 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Showing <span className="font-bold text-slate-900 dark:text-white">{filteredLoads.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}</span> to <span className="font-bold text-slate-900 dark:text-white">{Math.min(currentPage * pageSize, filteredLoads.length)}</span> of <span className="font-bold text-slate-900 dark:text-white">{filteredLoads.length}</span> entries
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-slate-500">Rows per page:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="px-2 py-1 rounded-xl text-xs font-bold liquid-glass-input outline-none"
              >
                <option value={5} className="bg-slate-900 text-white">5</option>
                <option value={10} className="bg-slate-900 text-white">10</option>
                <option value={25} className="bg-slate-900 text-white">25</option>
                <option value={50} className="bg-slate-900 text-white">50</option>
              </select>
            </div>

            <div className="flex items-center gap-1">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                className="p-2 rounded-xl bg-slate-200/60 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs font-bold px-3 py-1">
                {currentPage} / {totalPages}
              </span>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                className="p-2 rounded-xl bg-slate-200/60 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 disabled:opacity-40"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* EDIT LOAD MODAL */}
      <AnimatePresence>
        {editingLoad && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg liquid-glass-card rounded-4xl p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-200/60 dark:border-white/10">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Edit Load Record ({editingLoad.id})</h3>
                <button onClick={() => setEditingLoad(null)} className="text-slate-400 hover:text-slate-700">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4 text-xs font-medium">
                <div>
                  <label className="block text-slate-500 font-bold mb-1">Location</label>
                  <select
                    value={editingLoad.locationName}
                    onChange={(e) => {
                      const locObj = locations.find(l => l.name === e.target.value);
                      setEditingLoad(prev => ({
                        ...prev,
                        locationName: e.target.value,
                        rate: locObj ? locObj.rate : prev.rate
                      }));
                    }}
                    className="w-full p-2.5 rounded-xl liquid-glass-input"
                  >
                    {locations.map(l => (
                      <option key={l.id} value={l.name} className="bg-slate-900 text-white">{l.name}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-500 font-bold mb-1">Quantity</label>
                    <input
                      type="number"
                      value={editingLoad.quantity}
                      onChange={(e) => setEditingLoad(prev => ({ ...prev, quantity: Number(e.target.value) }))}
                      className="w-full p-2.5 rounded-xl liquid-glass-input"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 font-bold mb-1">Tariff Rate ({settings.currency})</label>
                    <input
                      type="number"
                      value={editingLoad.rate}
                      onChange={(e) => setEditingLoad(prev => ({ ...prev, rate: Number(e.target.value) }))}
                      className="w-full p-2.5 rounded-xl liquid-glass-input"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-500 font-bold mb-1">Remarks</label>
                  <input
                    type="text"
                    value={editingLoad.remarks || ''}
                    onChange={(e) => setEditingLoad(prev => ({ ...prev, remarks: e.target.value }))}
                    className="w-full p-2.5 rounded-xl liquid-glass-input"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  onClick={() => setEditingLoad(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    editLoad(editingLoad.id, editingLoad);
                    setEditingLoad(null);
                  }}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-white liquid-glass-button"
                >
                  Save Changes
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
