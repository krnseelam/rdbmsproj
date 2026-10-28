import React from 'react';
import { Loader2 } from 'lucide-react';

export default function LoadingSpinner({ message = 'Loading data...', size = 'md' }) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <Loader2 className={`${sizeClasses[size] || sizeClasses.md} text-purple-500 animate-spin mb-3`} />
      {message && <p className="text-slate-400 text-sm font-medium">{message}</p>}
    </div>
  );
}
