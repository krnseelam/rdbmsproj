import React from 'react';

export default function ChartCard({ title, subtitle, action, children, className = '' }) {
  return (
    <div className={`glass-panel rounded-2xl p-5 border border-slate-800/80 flex flex-col ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-semibold text-white tracking-tight">{title}</h3>
          {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
        </div>
        {action && <div>{action}</div>}
      </div>
      <div className="flex-1 w-full min-h-[260px]">
        {children}
      </div>
    </div>
  );
}
