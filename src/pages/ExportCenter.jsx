import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { motion } from 'framer-motion';
import { 
  Download, 
  FileText, 
  FileSpreadsheet, 
  Printer, 
  Building2, 
  Calendar,
  Sparkles,
  CheckCircle,
  Filter
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

export const ExportCenter = () => {
  const { loads, locations, settings, addToast } = useApp();

  // Extract unique available months from loads in YYYY-MM format
  const availableMonths = useMemo(() => {
    const monthsSet = new Set();
    // Always include current month
    const currentYYYYMM = new Date().toISOString().slice(0, 7);
    monthsSet.add(currentYYYYMM);

    loads.forEach(l => {
      if (l.date) {
        monthsSet.add(l.date.slice(0, 7));
      }
    });

    return Array.from(monthsSet).sort().reverse();
  }, [loads]);

  const [selectedMonth, setSelectedMonth] = useState(() => availableMonths[0] || new Date().toISOString().slice(0, 7));
  const [exportFormat, setExportFormat] = useState('PDF'); // 'PDF', 'EXCEL', 'CSV'
  const [includeRemarks, setIncludeRemarks] = useState(true);

  // Format month for display e.g. "2026-08" -> "August 2026"
  const getMonthLabel = (yyyyMM) => {
    const [year, month] = yyyyMM.split('-');
    const date = new Date(Number(year), Number(month) - 1, 1);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  // Filter loads for selected month and sort in ascending chronological order (01 to 31)
  const monthlyLoads = useMemo(() => {
    return loads
      .filter(l => l.date && l.date.startsWith(selectedMonth))
      .sort((a, b) => (a.date || '').localeCompare(b.date || '') || (a.id || '').localeCompare(b.id || ''));
  }, [loads, selectedMonth]);

  // Compute Location Breakdown for selected month
  const monthlyLocationBreakdown = useMemo(() => {
    const map = {};

    locations.forEach(loc => {
      map[loc.name] = {
        locationName: loc.name,
        rate: loc.rate,
        loadsCount: 0,
        totalRevenue: 0
      };
    });

    monthlyLoads.forEach(l => {
      if (!map[l.locationName]) {
        map[l.locationName] = {
          locationName: l.locationName,
          rate: l.rate || 0,
          loadsCount: 0,
          totalRevenue: 0
        };
      }
      const qty = Number(l.quantity) || 1;
      const rev = Number(l.total) || (qty * (l.rate || 0));

      map[l.locationName].loadsCount += qty;
      map[l.locationName].totalRevenue += rev;
    });

    return Object.values(map);
  }, [locations, monthlyLoads]);

  // Monthly Grand Totals
  const monthlyTotalLoads = monthlyLocationBreakdown.reduce((acc, c) => acc + c.loadsCount, 0);
  const monthlyTotalRevenue = monthlyLocationBreakdown.reduce((acc, c) => acc + c.totalRevenue, 0);

  // Generate Month-Wise PDF Report
  const handleGeneratePDF = () => {
    try {
      const doc = new jsPDF();
      const monthLabel = getMonthLabel(selectedMonth);
      const todayStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

      // Title & Header
      doc.setFontSize(20);
      doc.setTextColor(37, 99, 235); // Deep Blue
      doc.text(settings.companyName, 14, 20);

      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139);
      doc.text(`MONTH-WISE TRANSPORT & REVENUE REPORT`, 14, 26);
      doc.text(`Selected Billing Month: ${monthLabel} | Generated: ${todayStr}`, 14, 31);

      doc.setLineWidth(0.5);
      doc.setDrawColor(226, 232, 240);
      doc.line(14, 35, 196, 35);

      // Monthly Grand Summary
      doc.setFontSize(12);
      doc.setTextColor(15, 23, 42);
      doc.text(`EXECUTIVE SUMMARY — ${monthLabel.toUpperCase()}`, 14, 43);

      const summaryData = [
        ['Target Month Period', monthLabel],
        ['Total Dispatched Loads', `${monthlyTotalLoads} loads`],
        ['Total Month Revenue', `Rs. ${monthlyTotalRevenue.toLocaleString()}`]
      ];

      doc.autoTable({
        startY: 47,
        head: [['Metric', 'Monthly Total']],
        body: summaryData,
        theme: 'striped',
        headStyles: { fillColor: [37, 99, 235] },
        styles: { fontSize: 10 }
      });

      // Location Revenue Summary Table for Month
      doc.setFontSize(12);
      doc.setTextColor(15, 23, 42);
      doc.text(`LOCATION TARIFF & REVENUE BREAKDOWN (${monthLabel})`, 14, doc.lastAutoTable.finalY + 12);

      const locSummaryRows = monthlyLocationBreakdown.map(loc => [
        loc.locationName,
        `Rs. ${loc.rate}`,
        loc.loadsCount,
        `Rs. ${loc.totalRevenue.toLocaleString()}`
      ]);

      locSummaryRows.push([
        'GRAND TOTAL',
        '—',
        `${monthlyTotalLoads} loads`,
        `Rs. ${monthlyTotalRevenue.toLocaleString()}`
      ]);

      doc.autoTable({
        startY: doc.lastAutoTable.finalY + 16,
        head: [['Location Yard', 'Rate / Load', 'No. of Loads', 'Total Revenue']],
        body: locSummaryRows,
        theme: 'grid',
        headStyles: { fillColor: [15, 23, 42] },
        styles: { fontSize: 9 }
      });

      // Detailed Consignment Logs for Month
      if (monthlyLoads.length > 0) {
        doc.setFontSize(12);
        doc.setTextColor(15, 23, 42);
        doc.text(`DETAILED CONSIGNMENT LOGS (${monthLabel})`, 14, doc.lastAutoTable.finalY + 12);

        const tableHead = ['Load ID', 'Location', 'Qty', 'Rate', 'Total Amount', 'Date'];
        if (includeRemarks) tableHead.push('Remarks');

        const tableBody = monthlyLoads.map(l => {
          const row = [l.id, l.locationName, l.quantity, `Rs. ${l.rate}`, `Rs. ${l.total}`, l.date];
          if (includeRemarks) row.push(l.remarks || '—');
          return row;
        });

        doc.autoTable({
          startY: doc.lastAutoTable.finalY + 16,
          head: [tableHead],
          body: tableBody,
          theme: 'striped',
          headStyles: { fillColor: [37, 99, 235] },
          styles: { fontSize: 8.5 }
        });
      }

      const fileName = `${settings.companyName.replace(/\s+/g, '_')}_${monthLabel.replace(/\s+/g, '_')}_Report.pdf`;
      doc.save(fileName);
      addToast(`Month-wise PDF Report (${monthLabel}) downloaded successfully!`, 'success');
    } catch (err) {
      console.error(err);
      addToast('Error generating month-wise PDF report', 'error');
    }
  };

  // Generate Month-Wise Excel
  const handleGenerateExcel = () => {
    const monthLabel = getMonthLabel(selectedMonth);

    // Sheet 1: Month Summary
    const summaryData = monthlyLocationBreakdown.map(loc => ({
      'Month': monthLabel,
      'Location Yard': loc.locationName,
      'Tariff Rate (₹)': loc.rate,
      'Number of Loads': loc.loadsCount,
      'Total Revenue (₹)': loc.totalRevenue
    }));
    summaryData.push({
      'Month': monthLabel,
      'Location Yard': 'GRAND TOTAL',
      'Tariff Rate (₹)': 0,
      'Number of Loads': monthlyTotalLoads,
      'Total Revenue (₹)': monthlyTotalRevenue
    });

    // Sheet 2: Consignment Logs
    const logData = monthlyLoads.map(l => ({
      'Load ID': l.id,
      'Month': monthLabel,
      'Location': l.locationName,
      'Quantity': l.quantity,
      'Rate': l.rate,
      'Total Amount': l.total,
      'Date': l.date,
      'Remarks': l.remarks || '',
      'Logged By': l.createdBy
    }));

    const workbook = XLSX.utils.book_new();

    const sheet1 = XLSX.utils.json_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(workbook, sheet1, 'Location Summary');

    if (logData.length > 0) {
      const sheet2 = XLSX.utils.json_to_sheet(logData);
      XLSX.utils.book_append_sheet(workbook, sheet2, 'Monthly Consignments');
    }

    const fileName = `${settings.companyName.replace(/\s+/g, '_')}_Month_Report_${monthLabel.replace(/\s+/g, '_')}.xlsx`;
    XLSX.writeFile(workbook, fileName);
    addToast(`Month-wise Excel Report (${monthLabel}) downloaded!`, 'success');
  };

  // Generate Month-Wise CSV
  const handleGenerateCSV = () => {
    const monthLabel = getMonthLabel(selectedMonth);

    const headers = ['Month', 'Location Yard', 'Rate (₹)', 'Loads Count', 'Total Revenue (₹)'];
    const rows = monthlyLocationBreakdown.map(loc => [
      `"${monthLabel}"`,
      `"${loc.locationName}"`,
      loc.rate,
      loc.loadsCount,
      loc.totalRevenue
    ]);
    rows.push([`"${monthLabel}"`, '"GRAND TOTAL"', 0, monthlyTotalLoads, monthlyTotalRevenue]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${settings.companyName.replace(/\s+/g, '_')}_Month_${monthLabel.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    addToast(`Month-wise CSV Report (${monthLabel}) downloaded!`, 'success');
  };

  const handlePrint = () => {
    window.print();
    addToast(`Opening print view for ${getMonthLabel(selectedMonth)} report`, 'info');
  };

  return (
    <div className="space-y-8 pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Download className="w-8 h-8 text-blue-600 dark:text-blue-400 stroke-[2.2]" />
            <span>Month-Wise Transport Export Center</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Download official transport payload and revenue data strictly formatted from month-wise reports
          </p>
        </div>
      </div>

      {/* MONTH SELECTION FILTER BAR */}
      <div className="liquid-glass-card rounded-3xl p-5 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4 border border-blue-500/20">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Select Billing Month *</h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">All export files will be generated exclusively for the selected month</p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="w-full sm:w-64 px-4 py-3 rounded-2xl text-sm font-bold text-slate-900 dark:text-white liquid-glass-input outline-none cursor-pointer"
          >
            {availableMonths.map(m => (
              <option key={m} value={m} className="bg-slate-900 text-white font-medium">
                {getMonthLabel(m)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Export Controls */}
        <div className="liquid-glass-card rounded-4xl p-6 sm:p-8 shadow-xl space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Export Options</h3>
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400">
              {getMonthLabel(selectedMonth)}
            </span>
          </div>

          <div className="space-y-3">
            <button
              type="button"
              onClick={() => setExportFormat('PDF')}
              className={`w-full p-4 rounded-3xl text-left border transition-all flex items-center gap-3 ${
                exportFormat === 'PDF'
                  ? 'bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-500/30'
                  : 'bg-white/40 dark:bg-slate-800/40 border-white/50 dark:border-white/10 text-slate-800 dark:text-slate-200'
              }`}
            >
              <FileText className="w-6 h-6 shrink-0" />
              <div>
                <h4 className="font-bold text-sm">PDF Month Report</h4>
                <p className="text-[11px] opacity-80">Branded monthly report with location summary</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setExportFormat('EXCEL')}
              className={`w-full p-4 rounded-3xl text-left border transition-all flex items-center gap-3 ${
                exportFormat === 'EXCEL'
                  ? 'bg-emerald-600 text-white border-emerald-500 shadow-lg shadow-emerald-500/30'
                  : 'bg-white/40 dark:bg-slate-800/40 border-white/50 dark:border-white/10 text-slate-800 dark:text-slate-200'
              }`}
            >
              <FileSpreadsheet className="w-6 h-6 shrink-0" />
              <div>
                <h4 className="font-bold text-sm">Excel Month Report (.xlsx)</h4>
                <p className="text-[11px] opacity-80">Location summary & consignment sheets</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setExportFormat('CSV')}
              className={`w-full p-4 rounded-3xl text-left border transition-all flex items-center gap-3 ${
                exportFormat === 'CSV'
                  ? 'bg-slate-800 text-white border-slate-700 shadow-lg'
                  : 'bg-white/40 dark:bg-slate-800/40 border-white/50 dark:border-white/10 text-slate-800 dark:text-slate-200'
              }`}
            >
              <FileText className="w-6 h-6 shrink-0" />
              <div>
                <h4 className="font-bold text-sm">CSV Month Summary</h4>
                <p className="text-[11px] opacity-80">Raw CSV month data export</p>
              </div>
            </button>
          </div>

          <div className="pt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={includeRemarks}
                onChange={(e) => setIncludeRemarks(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600"
              />
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Include driver remarks & truck numbers
              </span>
            </label>
          </div>

          {/* Trigger Action */}
          <button
            onClick={() => {
              if (exportFormat === 'PDF') handleGeneratePDF();
              else if (exportFormat === 'EXCEL') handleGenerateExcel();
              else handleGenerateCSV();
            }}
            className="w-full py-4 rounded-2xl font-bold text-sm text-white liquid-glass-button flex items-center justify-center gap-2 shadow-lg shadow-blue-500/30"
          >
            <Download className="w-4 h-4 stroke-[2.5]" />
            <span>Download {getMonthLabel(selectedMonth)} ({exportFormat})</span>
          </button>
        </div>

        {/* Live Month-Wise Document Output Preview */}
        <div className="lg:col-span-2 liquid-glass-card rounded-4xl p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-200/60 dark:border-white/10">
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-blue-500" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Month-Wise Document Output Preview ({getMonthLabel(selectedMonth)})
              </h3>
            </div>
            <button
              onClick={handlePrint}
              className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
            >
              <Printer className="w-4 h-4" />
              <span>Print Preview</span>
            </button>
          </div>

          {/* Simulated Printed Month-Wise Document Frame */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-inner space-y-6 text-slate-800 dark:text-slate-200">
            
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl font-extrabold text-blue-600 dark:text-blue-400">{settings.companyName}</h2>
                <p className="text-xs font-semibold text-slate-500">{settings.tagline}</p>
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300 mt-1">
                  MONTHLY TRANSPORT & REVENUE SUMMARY
                </p>
              </div>
              <div className="text-right text-xs font-mono">
                <p className="font-bold text-blue-600 dark:text-blue-400">{getMonthLabel(selectedMonth)}</p>
                <p className="text-slate-400">Generated: {new Date().toLocaleDateString()}</p>
              </div>
            </div>

            {/* Monthly Summary Bar */}
            <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-xs grid grid-cols-2 gap-4">
              <div>
                <span className="text-slate-500 dark:text-slate-400 block font-semibold">Monthly Total Loads</span>
                <span className="text-lg font-black text-slate-900 dark:text-white">{monthlyTotalLoads} loads</span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400 block font-semibold">Monthly Revenue Total</span>
                <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                  {settings.currency}{monthlyTotalRevenue.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Location Revenue Table Preview for Selected Month */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Location Tariff Summary ({getMonthLabel(selectedMonth)})
              </h4>
              
              <table className="w-full text-left text-xs border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                <thead className="bg-slate-100 dark:bg-slate-800 font-bold">
                  <tr>
                    <th className="p-2">Location Yard</th>
                    <th className="p-2">Rate</th>
                    <th className="p-2 text-center">Loads</th>
                    <th className="p-2">Total Revenue</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {monthlyLocationBreakdown.map(loc => (
                    <tr key={loc.locationName}>
                      <td className="p-2 font-semibold">{loc.locationName}</td>
                      <td className="p-2">{settings.currency}{loc.rate}</td>
                      <td className="p-2 text-center font-bold">{loc.loadsCount}</td>
                      <td className="p-2 font-extrabold text-blue-600 dark:text-blue-400">
                        {settings.currency}{loc.totalRevenue.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="text-[11px] text-slate-400 italic text-center">
              Previewing {monthlyLoads.length} consignment entries recorded for {getMonthLabel(selectedMonth)}.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
};
