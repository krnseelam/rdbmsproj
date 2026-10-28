import React from 'react';
import { Database, Plus } from 'lucide-react';

export default function EmptyState({
  title = 'No records found',
  description = 'There is currently no data to display.',
  actionLabel,
  onAction,
  icon: Icon = Database,
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center glass-panel rounded-2xl border border-dashed border-slate-800 my-4">
      <div className="w-14 h-14 rounded-2xl bg-slate-800/60 border border-slate-700/50 flex items-center justify-center text-purple-400 mb-4 shadow-lg shadow-purple-950/20">
        <Icon className="w-7 h-7" />
      </div>
      <h3 className="text-base font-semibold text-slate-200 mb-1">{title}</h3>
      <p className="text-sm text-slate-400 max-w-sm mb-6">{description}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-sm font-medium rounded-xl shadow-lg shadow-purple-900/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          {actionLabel}
        </button>
      )}
    </div>
  );
}
