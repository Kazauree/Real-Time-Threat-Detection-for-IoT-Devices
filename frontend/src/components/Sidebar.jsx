import React from 'react';
import { 
  ShieldAlert, 
  LayoutDashboard, 
  Cpu, 
  Radio, 
  AlertTriangle, 
  BarChart2, 
  BrainCircuit, 
  FileText, 
  FileCode, 
  LogOut,
  UserCheck,
  Zap
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ activePage, setActivePage }) => {
  const { user, logout } = useAuth();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'devices', label: 'IoT Devices', icon: Cpu },
    { id: 'traffic', label: 'Live Traffic', icon: Radio },
    { id: 'threats', label: 'Threat Center', icon: AlertTriangle },
    { id: 'analytics', label: 'Analytics', icon: BarChart2 },
    { id: 'ml', label: 'Machine Learning', icon: BrainCircuit },
    { id: 'reports', label: 'Security Reports', icon: FileText },
    { id: 'logs', label: 'System Logs', icon: FileCode },
  ];

  return (
    <aside className="w-64 bg-[#0F172A]/80 backdrop-blur-xl border-r border-slate-800/80 flex flex-col justify-between min-h-screen sticky top-0 z-30 shadow-2xl">
      <div>
        {/* Brand Logo */}
        <div className="p-6 border-b border-slate-800/80 flex items-center gap-3">
          <div className="p-3 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/10 border border-cyan-500/40 text-cyan-400 glow-cyan">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-extrabold text-base text-slate-100 tracking-tight flex items-center gap-1.5 font-mono">
              IoT SHIELD <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-500/40 font-semibold">v1.0</span>
            </h1>
            <p className="text-[11px] text-slate-400 font-mono">Threat Detection SOC</p>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="p-4 space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActivePage(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold tracking-wide transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-500/20 to-slate-900 text-cyan-400 border border-cyan-500/40 glow-cyan font-bold shadow-lg'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-4 h-4 transition-transform duration-200 ${isActive ? 'text-cyan-400 scale-110' : 'text-slate-400'}`} />
                <span>{item.label}</span>
                {isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 ml-auto shadow-[0_0_8px_#06B6D4]"></span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* System Status Footer */}
      <div className="p-4 space-y-3 border-t border-slate-800/80 bg-slate-900/60">
        <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_10px_#10B981]"></div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-300 font-mono">RF ML CLASSIFIER</p>
            <p className="text-[10px] text-emerald-400 font-mono">Status: ACTIVE • 100%</p>
          </div>
        </div>

        <div className="flex items-center justify-between px-2 pt-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center text-cyan-400 border border-slate-700">
              <UserCheck className="w-4 h-4" />
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-semibold text-slate-200 truncate">{user?.name || 'Administrator'}</p>
              <p className="text-[10px] text-cyan-400 font-mono uppercase tracking-wider">{user?.role || 'Admin'}</p>
            </div>
          </div>
        </div>

        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-semibold text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 border border-slate-800 hover:border-rose-900/50 transition-all"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
