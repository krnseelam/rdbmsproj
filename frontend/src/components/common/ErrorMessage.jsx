import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

export default function ErrorMessage({ message, errorType, detail, onRetry }) {
  return (
    <div className="p-4 bg-rose-950/40 border border-rose-500/30 rounded-xl text-rose-200 my-4">
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h4 className="font-semibold text-sm text-rose-300">
              {errorType ? `Database Error [${errorType}]` : 'Operation Failed'}
            </h4>
          </div>
          <p className="text-sm mt-1 text-slate-300">{message || 'An unknown error occurred.'}</p>
          {detail && (
            <p className="text-xs font-mono mt-2 p-2 bg-dark-950/80 rounded border border-rose-900/50 text-rose-300/80 break-all">
              {detail}
            </p>
          )}
        </div>
        {onRetry && (
          <button
            onClick={onRetry}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-rose-900/40 hover:bg-rose-900/70 border border-rose-700/50 text-rose-200 rounded-lg transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Retry
          </button>
        )}
      </div>
    </div>
  );
}
