import React, { useState, useEffect } from 'react';
import { AlertTriangle, Filter, Eye, RefreshCw, CheckCircle, ShieldAlert } from 'lucide-react';
import { threatsAPI } from '../services/api';
import SeverityBadge from '../components/SeverityBadge';
import ThreatModal from '../components/ThreatModal';

const Threats = () => {
  const [threats, setThreats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [severityFilter, setSeverityFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [threatTypeFilter, setThreatTypeFilter] = useState('');
  const [selectedThreatId, setSelectedThreatId] = useState(null);

  useEffect(() => {
    fetchThreats();
  }, [severityFilter, statusFilter, threatTypeFilter]);

  const fetchThreats = async () => {
    setLoading(true);
    try {
      const res = await threatsAPI.getThreats({
        severity: severityFilter,
        status: statusFilter,
        threat_type: threatTypeFilter,
        limit: 50
      });
      setThreats(res.data);
    } catch (e) {
      console.error('Failed to fetch threats:', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#151C2C] border border-slate-800 p-5 rounded-xl">
        <div>
          <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-rose-400" /> Cyber Threat Incident Management Center
          </h3>
          <p className="text-xs text-slate-400 font-mono">Flagged IoT attacks & security incident responses</p>
        </div>

        <button
          onClick={fetchThreats}
          className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition border border-slate-700 font-mono"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh Incidents
        </button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <select
          value={severityFilter}
          onChange={(e) => setSeverityFilter(e.target.value)}
          className="bg-[#151C2C] border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
        >
          <option value="">All Severity Levels</option>
          <option value="LOW">LOW</option>
          <option value="MEDIUM">MEDIUM</option>
          <option value="HIGH">HIGH</option>
          <option value="CRITICAL">CRITICAL</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-[#151C2C] border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
        >
          <option value="">All Incident Statuses</option>
          <option value="Investigating">Investigating</option>
          <option value="Resolved">Resolved</option>
          <option value="Ignored">Ignored</option>
        </select>

        <select
          value={threatTypeFilter}
          onChange={(e) => setThreatTypeFilter(e.target.value)}
          className="bg-[#151C2C] border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
        >
          <option value="">All Threat Categories</option>
          <option value="DoS">DoS Attack</option>
          <option value="Port Scan">Port Scanning</option>
          <option value="Brute Force">Brute Force</option>
          <option value="Botnet">Botnet C2</option>
          <option value="Suspicious">Suspicious Activity</option>
        </select>
      </div>

      {/* Threats Board Table */}
      <div className="bg-[#151C2C] border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-900/60 border-b border-slate-800 text-slate-400 uppercase font-mono text-[10px]">
                <th className="py-3 px-4">Threat ID</th>
                <th className="py-3 px-4">Device</th>
                <th className="py-3 px-4">Target IP</th>
                <th className="py-3 px-4">Threat Type</th>
                <th className="py-3 px-4">Severity</th>
                <th className="py-3 px-4">Confidence</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Detected At</th>
                <th className="py-3 px-4 text-right">Investigate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {loading ? (
                <tr>
                  <td colSpan="9" className="py-8 text-center text-slate-500">
                    Loading security incident log...
                  </td>
                </tr>
              ) : threats.length === 0 ? (
                <tr>
                  <td colSpan="9" className="py-8 text-center text-slate-500">
                    No active threat incidents recorded.
                  </td>
                </tr>
              ) : (
                threats.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-4 text-cyan-400 font-bold">#{t.id}</td>
                    <td className="py-3 px-4 text-slate-100 font-semibold">{t.device_name}</td>
                    <td className="py-3 px-4 text-slate-400">{t.device_ip}</td>
                    <td className="py-3 px-4 font-bold text-rose-400">{t.threat_type}</td>
                    <td className="py-3 px-4">
                      <SeverityBadge severity={t.severity} />
                    </td>
                    <td className="py-3 px-4 text-slate-300">{(t.confidence * 100).toFixed(1)}%</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                        t.status === 'Resolved' ? 'bg-emerald-950/60 text-emerald-400 border-emerald-500/30' : t.status === 'Investigating' ? 'bg-amber-950/60 text-amber-400 border-amber-500/30' : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}>
                        {t.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-400 text-[11px]">
                      {t.detected_at?.substring(0, 19).replace('T', ' ')}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setSelectedThreatId(t.id)}
                        className="px-3 py-1 rounded bg-slate-800 hover:bg-cyan-950 hover:text-cyan-400 text-slate-200 border border-slate-700 transition text-[11px] font-semibold flex items-center gap-1.5 ml-auto"
                      >
                        <Eye className="w-3.5 h-3.5" /> Inspect
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedThreatId && (
        <ThreatModal
          threatId={selectedThreatId}
          onClose={() => setSelectedThreatId(null)}
          onStatusUpdated={fetchThreats}
        />
      )}
    </div>
  );
};

export default Threats;
