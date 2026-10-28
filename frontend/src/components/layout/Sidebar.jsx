import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Mic2,
  Disc,
  Music,
  Sliders,
  PenTool,
  FileText,
  Radio,
  Coins,
  Calculator,
  Database,
  ExternalLink,
} from 'lucide-react';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/artists', label: 'Artists', icon: Mic2 },
  { path: '/albums', label: 'Albums', icon: Disc },
  { path: '/songs', label: 'Songs', icon: Music },
  { path: '/producers', label: 'Producers', icon: Sliders },
  { path: '/songwriters', label: 'Songwriters', icon: PenTool },
  { path: '/contracts', label: 'Contracts', icon: FileText },
  { path: '/platforms', label: 'Streaming Platforms', icon: Radio },
  { path: '/royalties', label: 'Royalties', icon: Coins },
  { path: '/payouts', label: 'Payouts', icon: Calculator },
];

export default function Sidebar({ isOpen, onClose }) {
  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-dark-900 border-r border-slate-800/80 flex flex-col transition-transform duration-300 lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 px-6 flex items-center gap-3 border-b border-slate-800/80 bg-dark-950/40">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-pink-500 flex items-center justify-center text-white shadow-lg shadow-purple-900/30">
            <Music className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-white tracking-tight leading-none">
              SONIC RECORDINGS
            </h1>
            <span className="text-[10px] font-mono uppercase text-purple-400 tracking-wider">
              Music Label RDBMS
            </span>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
            Main Navigation
          </p>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                    isActive
                      ? 'bg-gradient-to-r from-purple-600/20 to-indigo-600/10 text-purple-300 border border-purple-500/30 shadow-sm font-semibold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon className={`w-4 h-4 ${isActive ? 'text-purple-400' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* Footer Database Badge */}
        <div className="p-4 border-t border-slate-800/80 bg-dark-950/40">
          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-200 truncate">music_label_db</p>
              <p className="text-[10px] text-slate-400 font-mono">MySQL 8.4 • Connected</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
