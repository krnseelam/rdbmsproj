import React from 'react';
import { Filter } from 'lucide-react';

export default function FilterDropdown({
  label,
  value,
  onChange,
  options = [],
  allLabel = 'All',
  className = '',
}) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {label && (
        <span className="text-xs font-medium text-slate-400 flex items-center gap-1">
          <Filter className="w-3.5 h-3.5 text-purple-400" />
          {label}:
        </span>
      )}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="px-3 py-2 bg-dark-900/90 border border-slate-700/60 focus:border-purple-500 rounded-xl text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20 cursor-pointer transition-all"
      >
        <option value="">{allLabel}</option>
        {options.map((opt) => {
          const val = typeof opt === 'object' ? opt.value : opt;
          const lbl = typeof opt === 'object' ? opt.label : opt;
          return (
            <option key={val} value={val} className="bg-dark-900 text-slate-100">
              {lbl}
            </option>
          );
        })}
      </select>
    </div>
  );
}
