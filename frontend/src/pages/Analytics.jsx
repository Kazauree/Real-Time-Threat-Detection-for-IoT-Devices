import React, { useState, useEffect } from 'react';
import { BarChart2, PieChart as PieIcon, TrendingUp, ShieldAlert } from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { dashboardAPI } from '../services/api';

const Analytics = () => {
  const [attackDist, setAttackDist] = useState([]);
  const [deviceRisk, setDeviceRisk] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const [distRes, riskRes] = await Promise.all([
        dashboardAPI.getAttackDistribution(),
        dashboardAPI.getDeviceRisk()
      ]);
      setAttackDist(distRes.data);
      setDeviceRisk(riskRes.data);
    } catch (e) {
      console.error('Failed to load analytics:', e);
    } finally {
      setLoading(false);
    }
  };

  const deviceChartData = deviceRisk.map((d) => ({
    name: d.device_name.length > 14 ? d.device_name.substring(0, 14) + '...' : d.device_name,
    Threats: d.threat_count,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#151C2C] border border-slate-800 p-5 rounded-xl">
        <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
          <BarChart2 className="w-5 h-5 text-cyan-400" /> Cyber Threat Intelligence Analytics
        </h3>
        <p className="text-xs text-slate-400 font-mono">Aggregated attack vectors and target vulnerability statistics</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attack Category Pie Distribution */}
        <div className="bg-[#151C2C] border border-slate-800 rounded-xl p-5">
          <h4 className="text-sm font-bold text-slate-100 uppercase tracking-wider mb-4 flex items-center gap-2">
            <PieIcon className="w-4 h-4 text-purple-400" /> Attack Vector Distribution
          </h4>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={attackDist}
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  dataKey="value"
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                >
                  {attackDist.map((entry, idx) => (
                    <Cell key={`cell-${idx}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Threats per IoT Asset Bar Chart */}
        <div className="bg-[#151C2C] border border-slate-800 rounded-xl p-5">
          <h4 className="text-sm font-bold text-slate-100 uppercase tracking-wider mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" /> Targeted IoT Assets Leaderboard
          </h4>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deviceChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                <XAxis dataKey="name" stroke="#64748B" fontSize={11} />
                <YAxis stroke="#64748B" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }} />
                <Bar dataKey="Threats" fill="#06B6D4" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
