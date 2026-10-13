import React, { useState } from 'react';
import { Bell, Wifi, Play, ShieldAlert, Check, Zap } from 'lucide-react';
import { useSocket } from '../context/SocketContext';
import { predictAPI } from '../services/api';
import SeverityBadge from './SeverityBadge';

const Navbar = ({ activePage }) => {
  const { isConnected, liveAlerts, clearAlerts } = useSocket();
  const [showAlertsMenu, setShowAlertsMenu] = useState(false);
  const [simulating, setSimulating] = useState(false);

  const getTitle = () => {
    switch (activePage) {
      case 'dashboard': return 'Executive Threat Dashboard';
      case 'devices': return 'IoT Device Asset Manager';
      case 'traffic': return 'Real-Time IoT Traffic Stream';
      case 'threats': return 'Cyber Threat Incident Center';
      case 'analytics': return 'Threat Intelligence & Analytics';
      case 'ml': return 'Random Forest Machine Learning Engine';
      case 'reports': return 'Security Compliance Reports';
      case 'logs': return 'System Audit Logs';
      default: return 'IoT Threat Detection';
    }
  };

  const triggerSimulatedThreat = async (attackType) => {
    setSimulating(true);
    try {
      const samplePayloads = {
        DoS: {
          device_id: 1,
          source_ip: '192.168.1.12',
          destination_ip: '192.168.1.1',
          destination_port: 80,
          protocol: 'TCP',
          source_type: 'SIMULATED',
          features: {
            flow_duration: 15,
            packet_count: 5000,
            byte_count: 300000,
            pkt_len_mean: 60,
            pkt_len_std: 2,
            flow_pkts_per_sec: 333000,
            flow_bytes_per_sec: 20000000,
            port_entropy: 0.2,
            dest_port: 80,
            protocol: 'TCP'
          }
        },
        PortScan: {
          device_id: 2,
          source_ip: '192.168.1.19',
          destination_ip: '192.168.1.1',
          destination_port: 445,
          protocol: 'TCP',
          source_type: 'SIMULATED',
          features: {
            flow_duration: 5,
            packet_count: 2,
            byte_count: 120,
            pkt_len_mean: 60,
            pkt_len_std: 0,
            flow_pkts_per_sec: 400,
            flow_bytes_per_sec: 24000,
            port_entropy: 4.8,
            dest_port: 445,
            protocol: 'TCP'
          }
        },
        BruteForce: {
          device_id: 4,
          source_ip: '192.168.1.25',
          destination_ip: '192.168.1.1',
          destination_port: 22,
          protocol: 'TCP',
          source_type: 'SIMULATED',
          features: {
            flow_duration: 2500,
            packet_count: 450,
            byte_count: 90000,
            pkt_len_mean: 200,
            pkt_len_std: 35,
            flow_pkts_per_sec: 180,
            flow_bytes_per_sec: 36000,
            port_entropy: 0.5,
            dest_port: 22,
            protocol: 'TCP'
          }
        }
      };

      await predictAPI.sendPrediction(samplePayloads[attackType] || samplePayloads.DoS);
    } catch (e) {
      console.error('Simulation trigger failed:', e);
    } finally {
      setTimeout(() => setSimulating(false), 400);
    }
  };

  return (
    <header className="h-16 bg-[#0F172A]/70 backdrop-blur-xl border-b border-slate-800/80 px-6 flex items-center justify-between sticky top-0 z-20 shadow-md">
      <div>
        <h2 className="text-base font-extrabold text-slate-100 tracking-tight">{getTitle()}</h2>
        <p className="text-[11px] text-cyan-400 font-mono">Real-Time Random Forest ML Classifier</p>
      </div>

      <div className="flex items-center gap-4">
        {/* Simulation Action Triggers */}
        <div className="flex items-center gap-1.5 bg-slate-950/80 p-1.5 rounded-xl border border-slate-800">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider px-2 flex items-center gap-1">
            <Zap className="w-3 h-3 text-amber-400" /> Inject Attack:
          </span>
          <button
            onClick={() => triggerSimulatedThreat('DoS')}
            disabled={simulating}
            className="px-2.5 py-1 text-xs font-bold text-rose-400 hover:bg-rose-950/50 rounded-lg border border-rose-500/30 transition shadow-sm"
          >
            DoS
          </button>
          <button
            onClick={() => triggerSimulatedThreat('PortScan')}
            disabled={simulating}
            className="px-2.5 py-1 text-xs font-bold text-sky-400 hover:bg-sky-950/50 rounded-lg border border-sky-500/30 transition shadow-sm"
          >
            Scan
          </button>
          <button
            onClick={() => triggerSimulatedThreat('BruteForce')}
            disabled={simulating}
            className="px-2.5 py-1 text-xs font-bold text-orange-400 hover:bg-orange-950/50 rounded-lg border border-orange-500/30 transition shadow-sm"
          >
            BruteForce
          </button>
        </div>

        {/* WebSocket Connection Radar Indicator */}
        <div className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-slate-950/80 border border-slate-800 text-xs font-mono">
          {isConnected ? (
            <>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#10B981]"></span>
              <span className="text-emerald-400 font-bold tracking-wide">SOCKET LIVE</span>
            </>
          ) : (
            <>
              <span className="w-2 h-2 rounded-full bg-amber-400"></span>
              <span className="text-amber-400 font-bold tracking-wide">CONNECTING</span>
            </>
          )}
        </div>

        {/* Real-Time Alerts Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowAlertsMenu(!showAlertsMenu)}
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-slate-100 hover:border-slate-700 relative transition shadow-sm"
          >
            <Bell className="w-5 h-5" />
            {liveAlerts.length > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white font-bold text-[10px] rounded-full flex items-center justify-center animate-bounce shadow-md">
                {liveAlerts.length}
              </span>
            )}
          </button>

          {showAlertsMenu && (
            <div className="absolute right-0 mt-2 w-80 bg-[#151C2C]/95 backdrop-blur-2xl border border-slate-700 rounded-2xl shadow-2xl z-50 overflow-hidden">
              <div className="p-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-rose-400" /> Real-Time Alerts
                </h4>
                {liveAlerts.length > 0 && (
                  <button
                    onClick={clearAlerts}
                    className="text-[10px] text-cyan-400 hover:underline flex items-center gap-1 font-mono"
                  >
                    <Check className="w-3 h-3" /> Clear All
                  </button>
                )}
              </div>

              <div className="max-h-72 overflow-y-auto divide-y divide-slate-800/60">
                {liveAlerts.length === 0 ? (
                  <div className="p-6 text-center text-slate-500 text-xs font-mono">
                    No active threat alerts
                  </div>
                ) : (
                  liveAlerts.map((alert, idx) => (
                    <div key={idx} className="p-3.5 hover:bg-slate-800/50 transition">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-100">{alert.title}</span>
                        <SeverityBadge severity={alert.severity} />
                      </div>
                      <p className="text-[11px] text-slate-300 mt-1">{alert.message}</p>
                      <p className="text-[10px] text-slate-500 font-mono mt-1">{alert.timestamp}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
