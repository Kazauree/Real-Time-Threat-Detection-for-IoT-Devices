import React from 'react';

const StatCard = ({ title, value, subtext, icon: Icon, color = 'cyan', glow = false, trend }) => {
  const colorStyles = {
    cyan: {
      borderTop: 'border-t-2 border-t-cyan-500',
      iconBg: 'bg-gradient-to-br from-cyan-500/20 to-blue-600/10 text-cyan-400 border-cyan-500/30 glow-cyan',
      textAccent: 'text-cyan-400',
    },
    emerald: {
      borderTop: 'border-t-2 border-t-emerald-500',
      iconBg: 'bg-gradient-to-br from-emerald-500/20 to-teal-600/10 text-emerald-400 border-emerald-500/30 glow-emerald',
      textAccent: 'text-emerald-400',
    },
    amber: {
      borderTop: 'border-t-2 border-t-amber-500',
      iconBg: 'bg-gradient-to-br from-amber-500/20 to-orange-600/10 text-amber-400 border-amber-500/30 glow-amber',
      textAccent: 'text-amber-400',
    },
    rose: {
      borderTop: 'border-t-2 border-t-rose-500',
      iconBg: 'bg-gradient-to-br from-rose-500/25 to-red-600/10 text-rose-400 border-rose-500/40 glow-rose',
      textAccent: 'text-rose-400',
    },
    purple: {
      borderTop: 'border-t-2 border-t-purple-500',
      iconBg: 'bg-gradient-to-br from-purple-500/20 to-indigo-600/10 text-purple-400 border-purple-500/30',
      textAccent: 'text-purple-400',
    },
  };

  const style = colorStyles[color] || colorStyles.cyan;

  return (
    <div className={`glass-panel glass-panel-hover rounded-2xl p-5 relative overflow-hidden ${style.borderTop}`}>
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 font-mono">
            {title}
          </span>
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl font-extrabold text-slate-100 font-mono tracking-tight">{value}</h3>
            {trend && (
              <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-500/30">
                {trend}
              </span>
            )}
          </div>
          {subtext && (
            <p className="text-xs text-slate-400 font-medium pt-1 flex items-center gap-1.5">
              <span className={`w-1.5 h-1.5 rounded-full ${style.textAccent}`}></span>
              {subtext}
            </p>
          )}
        </div>

        {Icon && (
          <div className={`p-3.5 rounded-xl border ${style.iconBg} transition-transform duration-300 group-hover:scale-110`}>
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;
