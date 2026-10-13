import React, { useState } from 'react';
import { FileText, Download, Calendar, ShieldCheck, FileSpreadsheet } from 'lucide-react';
import { reportsAPI } from '../services/api';

const Reports = () => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const downloadThreatsCSV = () => {
    window.open(reportsAPI.getThreatsReportUrl('csv'), '_blank');
  };

  const downloadThreatsPDF = () => {
    window.open(reportsAPI.getThreatsReportUrl('pdf'), '_blank');
  };

  const downloadTrafficCSV = () => {
    window.open(reportsAPI.getTrafficReportUrl(), '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#151C2C] border border-slate-800 p-5 rounded-xl">
        <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
          <FileText className="w-5 h-5 text-cyan-400" /> Executive Security & Compliance Reports
        </h3>
        <p className="text-xs text-slate-400 font-mono">Generate downloadable PDF audit reports & raw CSV datasets</p>
      </div>

      {/* Date Filter Card */}
      <div className="bg-[#151C2C] border border-slate-800 rounded-xl p-5">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-cyan-400" /> Reporting Date Interval
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
            />
          </div>
        </div>
      </div>

      {/* Available Report Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Threat Incident PDF & CSV Report */}
        <div className="bg-[#151C2C] border border-slate-800 rounded-xl p-6 flex flex-col justify-between">
          <div>
            <div className="p-3 w-fit rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-400 mb-4">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-slate-100 mb-1">IoT Cyber Threat Summary Report</h4>
            <p className="text-xs text-slate-400 mb-4">
              Contains complete incident logs, threat classifications, severity scores, affected IoT devices, and Random Forest prediction probabilities.
            </p>
          </div>

          <div className="flex items-center gap-3 pt-4 border-t border-slate-800">
            <button
              onClick={downloadThreatsPDF}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs transition shadow-lg shadow-rose-950/50"
            >
              <Download className="w-4 h-4" /> Export PDF Report
            </button>
            <button
              onClick={downloadThreatsCSV}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" /> Export CSV Data
            </button>
          </div>
        </div>

        {/* Network Traffic Raw Dataset */}
        <div className="bg-[#151C2C] border border-slate-800 rounded-xl p-6 flex flex-col justify-between">
          <div>
            <div className="p-3 w-fit rounded-xl bg-cyan-950/60 border border-cyan-500/40 text-cyan-400 mb-4">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-slate-100 mb-1">Raw Network Traffic Telemetry</h4>
            <p className="text-xs text-slate-400 mb-4">
              Exports raw flow records including flow duration, packet counts, byte counts, destination ports, protocols, and model target predictions.
            </p>
          </div>

          <div className="pt-4 border-t border-slate-800">
            <button
              onClick={downloadTrafficCSV}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs transition shadow-lg shadow-cyan-950/50"
            >
              <Download className="w-4 h-4" /> Export Traffic Dataset (CSV)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
