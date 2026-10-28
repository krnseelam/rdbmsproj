import React from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export default function Toast({ toast, onClose }) {
  const { type, message } = toast;

  const typeConfig = {
    success: {
      bg: 'bg-emerald-950/90 border-emerald-500/40 text-emerald-200',
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />,
      title: 'Success',
    },
    error: {
      bg: 'bg-rose-950/90 border-rose-500/40 text-rose-200',
      icon: <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />,
      title: 'Error',
    },
    warning: {
      bg: 'bg-amber-950/90 border-amber-500/40 text-amber-200',
      icon: <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />,
      title: 'Warning',
    },
    info: {
      bg: 'bg-indigo-950/90 border-indigo-500/40 text-indigo-200',
      icon: <Info className="w-5 h-5 text-indigo-400 shrink-0" />,
      title: 'Notice',
    },
  };

  const current = typeConfig[type] || typeConfig.info;

  return (
    <div
      className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border backdrop-blur-md shadow-2xl transition-all duration-300 animate-slide-in ${current.bg}`}
    >
      {current.icon}
      <div className="flex-1 text-sm">
        <p className="font-semibold text-xs tracking-wider uppercase opacity-80 mb-0.5">
          {current.title}
        </p>
        <p className="leading-snug break-words">{message}</p>
      </div>
      <button
        onClick={onClose}
        className="text-slate-400 hover:text-white transition-colors p-1 -mr-1 -mt-1 rounded-lg"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
