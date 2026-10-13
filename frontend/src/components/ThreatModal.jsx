import React, { useState, useEffect } from 'react';
import { X, ShieldAlert, CheckCircle, AlertOctagon, HelpCircle, Activity } from 'lucide-react';
import { threatsAPI } from '../services/api';
import SeverityBadge from './SeverityBadge';

const ThreatModal = ({ threatId, onClose, onStatusUpdated }) => {
  const [threat, setThreat] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (threatId) {
      fetchDetail();
    }
  }, [threatId]);

  const fetchDetail = async () => {
    setLoading(true);
    try {
      const res = await threatsAPI.getThreatDetail(threatId);
      setThreat(res.data);
    } catch (e) {
      console.error('Failed to load threat detail:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (newStatus) => {
    setUpdating(true);
    try {
      await threatsAPI.updateThreatStatus(threatId, newStatus);
      if (onStatusUpdated) onStatusUpdated();
      fetchDetail();
    } catch (e) {
      console.error('Failed to update status:', e);
    } finally {
      setUpdating(false);
    }
  };

  if (!threatId) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#151C2C] border border-slate-700 rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-400">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                Threat Investigation #{threatId}
                {threat && <SeverityBadge severity={threat.severity} />}
              </h3>
              <p className="text-xs text-slate-400 font-mono">Random Forest Machine Learning Classification</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="p-12 text-center text-slate-400 font-mono">
            Loading threat diagnostic telemetry...
          </div>
        ) : !threat ? (
          <div className="p-12 text-center text-rose-400 font-mono">
            Failed to retrieve threat details.
          </div>
        ) : (
          <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
            {/* Overview Box */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-900/60 border border-slate-800">
              <div>
                <span className="text-[10px] text-slate-400 font-mono uppercase">Threat Type</span>
                <p className="text-sm font-bold text-rose-400">{threat.threat_type}</p>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-mono uppercase">ML Confidence</span>
                <p className="text-sm font-bold text-cyan-400 font-mono">
                  {(threat.prediction_details?.confidence * 100).toFixed(1)}%
                </p>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-mono uppercase">Device Name</span>
                <p className="text-sm font-semibold text-slate-200 truncate">{threat.device_name}</p>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-mono uppercase">Current Status</span>
                <p className="text-sm font-semibold text-amber-400">{threat.status}</p>
              </div>
            </div>

            {/* Network Traffic Telemetry */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3 flex items-center gap-2">
                <Activity className="w-4 h-4 text-cyan-400" /> Extracted Flow Telemetry
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs font-mono">
                <div className="p-3 bg-slate-900/40 rounded-lg border border-slate-800">
                  <span className="text-slate-500">Source IP</span>
                  <p className="text-slate-200 font-semibold">{threat.traffic_details?.source_ip}</p>
                </div>
                <div className="p-3 bg-slate-900/40 rounded-lg border border-slate-800">
                  <span className="text-slate-500">Destination IP</span>
                  <p className="text-slate-200 font-semibold">{threat.traffic_details?.destination_ip}</p>
                </div>
                <div className="p-3 bg-slate-900/40 rounded-lg border border-slate-800">
                  <span className="text-slate-500">Protocol / Port</span>
                  <p className="text-cyan-400 font-semibold">
                    {threat.traffic_details?.protocol} / Port {threat.traffic_details?.destination_port}
                  </p>
                </div>
                <div className="p-3 bg-slate-900/40 rounded-lg border border-slate-800">
                  <span className="text-slate-500">Flow Duration</span>
                  <p className="text-slate-200 font-semibold">{threat.traffic_details?.flow_duration} ms</p>
                </div>
                <div className="p-3 bg-slate-900/40 rounded-lg border border-slate-800">
                  <span className="text-slate-500">Packet Count</span>
                  <p className="text-slate-200 font-semibold">{threat.traffic_details?.packet_count} pkts</p>
                </div>
                <div className="p-3 bg-slate-900/40 rounded-lg border border-slate-800">
                  <span className="text-slate-500">Traffic Source</span>
                  <span className="ml-2 text-[10px] px-2 py-0.5 rounded bg-slate-800 text-cyan-300 font-semibold">
                    {threat.traffic_details?.source_type}
                  </span>
                </div>
              </div>
            </div>

            {/* Explainable Model Indicators */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3 flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-amber-400" /> Explainable Model Indicators
              </h4>
              <div className="p-4 bg-amber-950/20 border border-amber-500/30 rounded-xl space-y-2">
                <p className="text-xs text-amber-200 font-medium">{threat.description}</p>
                <ul className="list-disc list-inside text-xs text-amber-300/80 space-y-1 font-mono">
                  <li>Random Forest Tree ensemble voting matched signature parameters for {threat.threat_type}.</li>
                  <li>Flow feature distribution significantly deviates from legitimate IoT telemetry baseline.</li>
                </ul>
              </div>
            </div>

            {/* Recommended Security Response */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3 flex items-center gap-2">
                <AlertOctagon className="w-4 h-4 text-rose-400" /> Recommended Mitigation Playbook
              </h4>
              <div className="space-y-2">
                {threat.recommended_actions?.map((act, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 p-3 bg-slate-900/40 rounded-lg border border-slate-800 text-xs text-slate-300">
                    <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{act}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/60 flex items-center justify-between">
          <span className="text-xs text-slate-400 font-mono">
            Detected: {threat?.detected_at}
          </span>
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleUpdateStatus('Ignored')}
              disabled={updating}
              className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
            >
              Ignore Threat
            </button>
            <button
              onClick={() => handleUpdateStatus('Resolved')}
              disabled={updating}
              className="px-4 py-2 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition shadow-lg shadow-emerald-950/40"
            >
              Mark Resolved
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThreatModal;
