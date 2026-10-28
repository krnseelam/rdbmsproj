import React from 'react';

export default function SelectInput({
  label,
  name,
  value,
  onChange,
  options = [],
  placeholder = 'Select an option',
  required = false,
  error,
  helpText,
  disabled = false,
  className = '',
}) {
  return (
    <div className={`flex flex-col space-y-1.5 ${className}`}>
      {label && (
        <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
          {label} {required && <span className="text-rose-400">*</span>}
        </label>
      )}
      <select
        name={name}
        value={value ?? ''}
        onChange={onChange}
        required={required}
        disabled={disabled}
        className={`w-full px-3.5 py-2.5 bg-dark-950/70 border ${
          error ? 'border-rose-500/80 focus:ring-rose-500/20' : 'border-slate-700/80 focus:border-purple-500 focus:ring-purple-500/20'
        } rounded-xl text-sm text-slate-100 focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all`}
      >
        <option value="" disabled className="bg-dark-900 text-slate-500">
          {placeholder}
        </option>
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
      {helpText && !error && <span className="text-xs text-slate-400">{helpText}</span>}
      {error && <span className="text-xs text-rose-400 font-medium">{error}</span>}
    </div>
  );
}
