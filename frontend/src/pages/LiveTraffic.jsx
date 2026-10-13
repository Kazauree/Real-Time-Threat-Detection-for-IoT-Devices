import React, { useState, useEffect } from 'react';
import { Radio, Filter, RefreshCw, Layers } from 'lucide-react';
import { trafficAPI } from '../services/api';
import { useSocket } from '../context/SocketContext';
import SeverityBadge from '../components/SeverityBadge';

const LiveTraffic = () => {
  const { livePredictions } = useSocket();
  const [traffic, setTraffic] = useState([]);
  const [loading, setLoading] = useState(true);
  const [protocolFilter, setProtocolFilter] = useState('');
  const [predictionFilter, setPredictionFilter] = useState('');
  const [sourceTypeFilter, setSourceTypeFilter] = useState('');

  useEffect(() => {
    fetchTraffic();
  }, [protocolFilter, predictionFilter, sourceTypeFilter]);

  useEffect(() => {
    if (livePredictions.length > 0) {
      setTraffic((prev) => [livePredictions[0], ...prev.slice(0, 99)]);
    }
  }, [livePredictions]);

  const fetchTraffic = async () => {
    setLoading(true);
    try {
      const res = await trafficAPI.getTraffic({
        protocol: protocolFilter,
        prediction: predictionFilter,
        source_type: sourceTypeFilter,
        limit: 100
      });
      setTraffic(res.data);
    } catch (e) {
      console.error('Failed to fetch traffic:', e);
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
            <Radio className="w-5 h-5 text-emerald-400 animate-pulse" /> Live IoT Network Traffic Telemetry
          </h3>
          <p className="text-xs text-slate-400 font-mono">Real-time socket stream analyzed by Random Forest Classifier</p>
        </div>

        <button
          onClick={fetchTraffic}
          className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition border border-slate-700 font-mono"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh Telemetry
        </button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <select
          value={protocolFilter}
          onChange={(e) => setProtocolFilter(e.target.value)}
          className="bg-[#151C2C] border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
        >
          <option value="">All Protocols</option>
          <option value="TCP">TCP</option>
          <option value="UDP">UDP</option>
          <option value="ICMP">ICMP</option>
        </select>

        <select
          value={predictionFilter}
          onChange={(e) => setPredictionFilter(e.target.value)}
          className="bg-[#151C2C] border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
        >
          <option value="">All Prediction Classes</option>
          <option value="Normal">Normal</option>
          <option value="DoS">DoS</option>
          <option value="Port Scan">Port Scan</option>
          <option value="Brute Force">Brute Force</option>
          <option value="Botnet">Botnet</option>
          <option value="Suspicious">Suspicious</option>
        </select>

        <select
          value={sourceTypeFilter}
          onChange={(e) => setSourceTypeFilter(e.target.value)}
          className="bg-[#151C2C] border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
        >
          <option value="">All Traffic Sources</option>
          <option value="LIVE">LIVE Only</option>
          <option value="SIMULATED">SIMULATED Only</option>
        </select>
      </div>

      {/* Traffic Table */}
      <div className="bg-[#151C2C] border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto max-h-[65vh]">
          <table className="w-full text-left text-xs">
            <thead className="sticky top-0 bg-[#0F172A] border-b border-slate-800 text-slate-400 uppercase font-mono text-[10px] z-10">
              <tr>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">IoT Device</th>
                <th className="py-3 px-4">Source IP</th>
                <th className="py-3 px-4">Dest IP:Port</th>
                <th className="py-3 px-4">Protocol</th>
                <th className="py-3 px-4">Packets</th>
                <th className="py-3 px-4">Duration</th>
                <th className="py-3 px-4">Prediction</th>
                <th className="py-3 px-4">Confidence</th>
                <th className="py-3 px-4">Severity</th>
                <th className="py-3 px-4">Source</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {loading ? (
                <tr>
                  <td colSpan="11" className="py-8 text-center text-slate-500">
                    Streaming network traffic telemetry...
                  </td>
                </tr>
              ) : traffic.length === 0 ? (
                <tr>
                  <td colSpan="11" className="py-8 text-center text-slate-500">
                    No network traffic flows recorded yet.
                  </td>
                </tr>
              ) : (
                traffic.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-4 text-slate-400 text-[11px]">
                      {row.timestamp?.substring(11, 19) || 'Just now'}
                    </td>
                    <td className="py-3 px-4 text-slate-200 font-semibold">{row.device_name}</td>
                    <td className="py-3 px-4 text-slate-400">{row.source_ip}</td>
                    <td className="py-3 px-4 text-cyan-400">{row.destination_ip}:{row.destination_port}</td>
                    <td className="py-3 px-4 text-slate-300">{row.protocol}</td>
                    <td className="py-3 px-4 text-slate-300">{row.packet_count}</td>
                    <td className="py-3 px-4 text-slate-400">{row.flow_duration} ms</td>
                    <td className="py-3 px-4 font-bold text-slate-100">{row.prediction}</td>
                    <td className="py-3 px-4 text-cyan-400">
                      {((row.confidence || 0.95) * 100).toFixed(1)}%
                    </td>
                    <td className="py-3 px-4">
                      <SeverityBadge severity={row.severity} />
                    </td>
                    <td className="py-3 px-4">
                      <span className={`text-[10px] px-2 py-0.5 rounded font-semibold border ${
                        row.source_type === 'LIVE' ? 'bg-emerald-950/60 text-emerald-400 border-emerald-500/30' : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}>
                        {row.source_type || 'SIMULATED'}
                      </span>
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

export default LiveTraffic;
