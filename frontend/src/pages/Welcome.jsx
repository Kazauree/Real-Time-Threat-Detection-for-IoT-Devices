import React from 'react';
import { ShieldAlert, BrainCircuit, Radio, Cpu, BarChart2, ArrowRight, Zap, Lock } from 'lucide-react';

const features = [
  { icon: BrainCircuit, title: 'Random Forest AI', text: 'A trained Random Forest classifier analyses every network flow and labels it Normal, DoS, Port Scan, Brute Force, Botnet or Suspicious.' },
  { icon: Radio, title: 'Real-Time Detection', text: 'WebSocket streaming pushes predictions and alerts to your dashboard instantly, with no page refresh.' },
  { icon: Cpu, title: 'IoT Asset Management', text: 'Register cameras, sensors, routers and gateways, and track the risk level of each device.' },
  { icon: BarChart2, title: 'Threat Analytics', text: 'Attack trends, distributions, confusion matrix, feature importance and exportable PDF/CSV reports.' },
];

const stats = [
  { label: 'Threat Classes', value: '6' },
  { label: 'Flow Features', value: '10' },
  { label: 'Live Updates', value: 'WebSocket' },
  { label: 'Algorithm', value: 'Random Forest' },
];

const Welcome = ({ onGetStarted }) => (
  <div className="min-h-screen bg-[#070A10] relative overflow-hidden">
    <div className="absolute inset-0 bg-[radial-gradient(#1E293B_1px,transparent_1px)] [background-size:32px_32px] opacity-30 pointer-events-none"></div>
    <div className="absolute -top-40 -left-40 w-[28rem] h-[28rem] rounded-full bg-cyan-500/10 blur-3xl pointer-events-none"></div>
    <div className="absolute -bottom-40 -right-40 w-[28rem] h-[28rem] rounded-full bg-purple-500/10 blur-3xl pointer-events-none"></div>

    <div className="relative z-10 max-w-6xl mx-auto px-6 py-8">
      {/* Top bar */}
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/10 border border-cyan-500/40 text-cyan-400 glow-cyan">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <span className="font-extrabold text-slate-100 font-mono tracking-tight">IoT SHIELD</span>
        </div>
        <button
          onClick={onGetStarted}
          className="px-5 py-2 rounded-xl border border-cyan-500/40 text-cyan-400 text-sm font-bold hover:bg-cyan-950/50 transition flex items-center gap-2"
        >
          <Lock className="w-4 h-4" /> Sign In
        </button>
      </header>

      {/* Hero */}
      <section className="text-center pt-20 pb-16">
        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-400 text-xs font-mono font-semibold mb-6">
          <Zap className="w-3.5 h-3.5" /> Machine Learning Powered Security
        </span>
        <h1 className="text-4xl md:text-6xl font-black text-slate-100 tracking-tight leading-tight">
          Real-Time Threat Detection<br />
          <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
            for IoT Devices
          </span>
        </h1>
        <p className="mt-6 max-w-2xl mx-auto text-slate-400 text-base md:text-lg">
          Monitor your connected devices, detect malicious network activity with a Random Forest
          classifier, and respond to attacks the moment they happen.
        </p>
        <button
          onClick={onGetStarted}
          className="mt-10 inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold shadow-lg shadow-cyan-950/50 transition group"
        >
          Get Started <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition" />
        </button>
      </section>

      {/* Stats */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="glass-panel rounded-2xl p-5 text-center">
            <p className="text-xl md:text-2xl font-extrabold text-cyan-400 font-mono">{s.value}</p>
            <p className="text-[11px] uppercase tracking-wider text-slate-400 font-mono mt-1">{s.label}</p>
          </div>
        ))}
      </section>

      {/* Features */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-10">
        {features.map(({ icon: Icon, title, text }) => (
          <div key={title} className="glass-panel glass-panel-hover rounded-2xl p-6 flex gap-4">
            <div className="p-3 h-fit rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/10 border border-cyan-500/30 text-cyan-400">
              <Icon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-100">{title}</h3>
              <p className="text-sm text-slate-400 mt-1">{text}</p>
            </div>
          </div>
        ))}
      </section>

      <footer className="text-center text-xs text-slate-500 font-mono mt-16 pb-4">
        Real-Time Threat Detection in IoT Devices Using Random Forest Machine Learning
      </footer>
    </div>
  </div>
);

export default Welcome;
