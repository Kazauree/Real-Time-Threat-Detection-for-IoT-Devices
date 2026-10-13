import React, { useState, useEffect } from 'react';
import { 
  Cpu, 
  Radio, 
  AlertTriangle, 
  BrainCircuit, 
  Activity, 
  ShieldCheck, 
  ArrowUpRight,
  Eye,
  Zap
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid 
} from 'recharts';
import StatCard from '../components/StatCard';
import SeverityBadge from '../components/SeverityBadge';
import ThreatModal from '../components/ThreatModal';
import { dashboardAPI, trafficAPI } from '../services/api';
import { useSocket } from '../context/SocketContext';

const Dashboard = ({ onNavigate }) => {
  const { livePredictions } = useSocket();
  const [stats, setStats] = useState(null);
  const [attackDist, setAttackDist] = useState([]);
  const [threatTrends, setThreatTrends] = useState([]);
  const [deviceRisk, setDeviceRisk] = useState([]);
  const [recentTraffic, setRecentTraffic] = useState([]);
  const [selectedThreatId, setSelectedThreatId] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    if (livePredictions.length > 0) {
      fetchDashboardData();
    }
  }, [livePredictions]);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, distRes, trendsRes, riskRes, trafficRes] = await Promise.all([
        dashboardAPI.getStatistics(),
        dashboardAPI.getAttackDistribution(),
        dashboardAPI.getThreatTrends(),
        dashboardAPI.getDeviceRisk(),
        trafficAPI.getLiveTraffic()
      ]);

      setStats(statsRes.data);
      setAttackDist(distRes.data);
      setThreatTrends(trendsRes.data);
      setDeviceRisk(riskRes.data);
      setRecentTraffic(trafficRes.data);
    } catch (e) {
      console.error('Failed to load dashboard telemetry:', e);
    }
  };

  return (
    <div className="space-y-6">
      {/* 4 KPI Top Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Monitored Devices"
          value={stats?.total_devices || 6}
          subtext={`${stats?.active_devices || 5} Online • ${stats?.warning_devices || 1} Warning`}
          icon={Cpu}
          color="cyan"
          trend="+100% Active"
        />
        <StatCard
          title="Traffic Flows Processed"
          value={stats?.total_traffic?.toLocaleString() || '12,450'}
          subtext={`${stats?.normal_percentage || 87.4}% Legitimate Baseline`}
          icon={Radio}
          color="emerald"
        />
        <StatCard
          title="Threats Identified"
          value={stats?.total_threats || 0}
          subtext={`${stats?.critical_alerts || 0} Unresolved Critical Alerts`}
          icon={AlertTriangle}
          color="rose"
          glow={stats?.critical_alerts > 0}
        />
        <StatCard
          title="ML Model Accuracy"
          value={`${stats?.model_accuracy || 98.5}%`}
          subtext="Random Forest Ensemble (v1.0)"
          icon={BrainCircuit}
          color="purple"
        />
      </div>

      {/* Main Analytics Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Threat Trend Timeline Area Chart */}
        <div className="lg:col-span-2 glass-panel rounded-2xl p-6 relative">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2 font-mono">
                <Activity className="w-4 h-4 text-cyan-400" /> Threat Activity Timeline
              </h3>
              <p className="text-xs text-slate-400 font-mono">Real-time threat detection volume over time</p>
            </div>
            <button
              onClick={() => onNavigate('analytics')}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1 font-mono transition"
            >
              Full Analytics <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={threatTrends}>
                <defs>
                  <linearGradient id="colorDoS" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorScan" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#06B6D4" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                <XAxis dataKey="time" stroke="#64748B" fontSize={11} />
                <YAxis stroke="#64748B" fontSize={11} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '12px', fontSize: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.5)' }}
                />
                <Area type="monotone" dataKey="DoS" stroke="#EF4444" strokeWidth={2} fillOpacity={1} fill="url(#colorDoS)" />
                <Area type="monotone" dataKey="Port Scan" stroke="#06B6D4" strokeWidth={2} fillOpacity={1} fill="url(#colorScan)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Attack Category Donut Breakdown */}
        <div className="glass-panel rounded-2xl p-6">
          <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider mb-1 flex items-center gap-2 font-mono">
            <ShieldCheck className="w-4 h-4 text-emerald-400" /> Categorized Flow Distribution
          </h3>
          <p className="text-xs text-slate-400 font-mono mb-4">Traffic classification breakdown</p>

          <div className="h-48 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={attackDist}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {attackDist.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Legend */}
          <div className="grid grid-cols-2 gap-2 text-[11px] font-mono mt-2">
            {attackDist.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2 p-1.5 rounded-lg bg-slate-900/40 border border-slate-800/80">
                <span className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm" style={{ backgroundColor: item.color }}></span>
                <span className="text-slate-300 truncate font-semibold">{item.name}</span>
                <span className="text-cyan-400 font-bold ml-auto">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Real-time Streaming Traffic Ticker & Device Risk Board */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Live Traffic Feed */}
        <div className="lg:col-span-2 glass-panel rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2 font-mono">
                <Radio className="w-4 h-4 text-emerald-400 animate-pulse" /> Live Network Flow Stream
              </h3>
              <p className="text-xs text-slate-400 font-mono">Real-time socket stream analyzed by Random Forest</p>
            </div>
            <button
              onClick={() => onNavigate('traffic')}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1 font-mono transition"
            >
              Full Stream <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase font-mono text-[10px]">
                  <th className="py-2.5 px-3">Time</th>
                  <th className="py-2.5 px-3">Device</th>
                  <th className="py-2.5 px-3">Source IP</th>
                  <th className="py-2.5 px-3">Protocol</th>
                  <th className="py-2.5 px-3">Prediction</th>
                  <th className="py-2.5 px-3">Confidence</th>
                  <th className="py-2.5 px-3">Severity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {recentTraffic.slice(0, 7).map((rec, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/50 transition">
                    <td className="py-2.5 px-3 text-slate-400 text-[11px]">{rec.timestamp?.substring(11, 19)}</td>
                    <td className="py-2.5 px-3 text-slate-100 font-bold">{rec.device_name}</td>
                    <td className="py-2.5 px-3 text-slate-400">{rec.source_ip}</td>
                    <td className="py-2.5 px-3 text-cyan-400">{rec.protocol}:{rec.destination_port}</td>
                    <td className="py-2.5 px-3 font-bold text-slate-200">{rec.prediction}</td>
                    <td className="py-2.5 px-3 text-cyan-400 font-semibold">{(rec.confidence * 100).toFixed(1)}%</td>
                    <td className="py-2.5 px-3">
                      <SeverityBadge severity={rec.severity} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* High Risk Devices */}
        <div className="glass-panel rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2 font-mono">
                <Cpu className="w-4 h-4 text-amber-400" /> Targeted Asset Watchlist
              </h3>
              <p className="text-xs text-slate-400 font-mono">Highest risk score IoT devices</p>
            </div>
            <button
              onClick={() => onNavigate('devices')}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1 font-mono transition"
            >
              Assets <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {deviceRisk.slice(0, 5).map((dev, idx) => (
              <div key={idx} className="p-3.5 bg-slate-900/60 border border-slate-800 rounded-xl flex items-center justify-between hover:border-slate-700 transition">
                <div>
                  <h4 className="text-xs font-bold text-slate-200">{dev.device_name}</h4>
                  <p className="text-[10px] text-slate-400 font-mono">{dev.ip_address} • {dev.device_type}</p>
                </div>
                <div className="text-right">
                  <SeverityBadge severity={dev.risk_level} />
                  <p className="text-[10px] text-slate-400 font-mono mt-1">{dev.threat_count} incidents</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Threat Detail Modal */}
      {selectedThreatId && (
        <ThreatModal
          threatId={selectedThreatId}
          onClose={() => setSelectedThreatId(null)}
          onStatusUpdated={fetchDashboardData}
        />
      )}
    </div>
  );
};

export default Dashboard;
