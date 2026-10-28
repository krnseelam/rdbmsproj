import React from 'react';

export default function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  color = 'purple',
}) {
  const colorStyles = {
    purple: {
      border: 'hover:border-purple-500/40',
      glow: 'from-purple-600/10 to-transparent',
      badge: 'bg-purple-950/60 border-purple-500/30 text-purple-300',
      iconBg: 'bg-purple-600/15 text-purple-400',
    },
    emerald: {
      border: 'hover:border-emerald-500/40',
      glow: 'from-emerald-600/10 to-transparent',
      badge: 'bg-emerald-950/60 border-emerald-500/30 text-emerald-300',
      iconBg: 'bg-emerald-600/15 text-emerald-400',
    },
    cyan: {
      border: 'hover:border-cyan-500/40',
      glow: 'from-cyan-600/10 to-transparent',
      badge: 'bg-cyan-950/60 border-cyan-500/30 text-cyan-300',
      iconBg: 'bg-cyan-600/15 text-cyan-400',
    },
    amber: {
      border: 'hover:border-amber-500/40',
      glow: 'from-amber-600/10 to-transparent',
      badge: 'bg-amber-950/60 border-amber-500/30 text-amber-300',
      iconBg: 'bg-amber-600/15 text-amber-400',
    },
    pink: {
      border: 'hover:border-pink-500/40',
      glow: 'from-pink-600/10 to-transparent',
      badge: 'bg-pink-950/60 border-pink-500/30 text-pink-300',
      iconBg: 'bg-pink-600/15 text-pink-400',
    },
  };

  const style = colorStyles[color] || colorStyles.purple;

  return (
    <div
      className={`relative overflow-hidden glass-panel rounded-2xl p-5 border border-slate-800/80 transition-all duration-300 hover:-translate-y-1 ${style.border}`}
    >
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl ${style.glow} pointer-events-none rounded-full blur-2xl -mr-8 -mt-8`} />

      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs uppercase tracking-wider font-semibold text-slate-400 mb-1">
            {title}
          </p>
          <h3 className="text-2xl font-bold tracking-tight text-white">{value}</h3>
        </div>

        {Icon && (
          <div className={`p-2.5 rounded-xl ${style.iconBg} border border-white/5`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      {(subtitle || trend) && (
        <div className="mt-3 flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/60">
          <span>{subtitle}</span>
          {trend && (
            <span className={`px-2 py-0.5 rounded-full border text-[11px] font-medium ${style.badge}`}>
              {trend}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
