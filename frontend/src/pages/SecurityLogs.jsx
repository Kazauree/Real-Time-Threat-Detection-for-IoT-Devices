import React, { useState, useEffect } from 'react';
import { FileCode, RefreshCw, UserCheck, Shield } from 'lucide-react';
import { logsAPI } from '../services/api';

const SecurityLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await logsAPI.getLogs({ limit: 100 });
      setLogs(res.data);
    } catch (e) {
      console.error('Failed to fetch security logs:', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between bg-[#151C2C] border border-slate-800 p-5 rounded-xl">
        <div>
          <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <FileCode className="w-5 h-5 text-cyan-400" /> System Security & Audit Trails
          </h3>
          <p className="text-xs text-slate-400 font-mono">Immutable audit log of user logins, device changes & ML operations</p>
        </div>

        <button
          onClick={fetchLogs}
          className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition border border-slate-700 font-mono"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh Audit Log
        </button>
      </div>

      {/* Logs Table */}
      <div className="bg-[#151C2C] border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto max-h-[65vh]">
          <table className="w-full text-left text-xs">
            <thead className="sticky top-0 bg-[#0F172A] border-b border-slate-800 text-slate-400 uppercase font-mono text-[10px] z-10">
              <tr>
                <th className="py-3 px-4">Log ID</th>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Action Type</th>
                <th className="py-3 px-4">IP Address</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-slate-500">
                    Loading security audit logs...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-slate-500">
                    No security audit logs recorded yet.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-4 text-cyan-400 font-bold">#{log.id}</td>
                    <td className="py-3 px-4 text-slate-200 font-semibold">{log.user_name}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-900 text-cyan-400 border border-cyan-500/30">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-400">{log.ip_address}</td>
                    <td className="py-3 px-4 text-slate-300">{log.description}</td>
                    <td className="py-3 px-4 text-slate-400 text-[11px]">
                      {log.created_at?.substring(0, 19).replace('T', ' ')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SecurityLogs;
