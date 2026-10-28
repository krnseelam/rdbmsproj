import React from 'react';
import { Menu, Database, ShieldCheck, User } from 'lucide-react';
import { useLocation } from 'react-router-dom';

const routeTitles = {
  '/dashboard': 'Dashboard Overview',
  '/artists': 'Artists Catalogue',
  '/albums': 'Albums & Discography',
  '/songs': 'Songs & Master Tracks',
  '/producers': 'Producers Directory',
  '/songwriters': 'Songwriters Directory',
  '/contracts': 'Artist Contracts & Agreements',
  '/platforms': 'Streaming Platforms & Rates',
  '/royalties': 'Royalties & Stream Earnings',
  '/payouts': 'Royalty Payouts Calculator',
};

export default function Navbar({ onToggleSidebar }) {
  const location = useLocation();
  const currentPath = '/' + location.pathname.split('/')[1];
  const title = routeTitles[currentPath] || 'Music Label Management';

  return (
    <header className="sticky top-0 z-30 h-16 bg-dark-950/80 backdrop-blur-md border-b border-slate-800/80 flex items-center justify-between px-4 lg:px-8">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-base font-bold text-white tracking-tight">{title}</h2>
          <p className="text-[11px] text-slate-400 font-mono hidden sm:block">
            MySQL 8 Views • Stored Procedures • Triggers Active
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* DB Status Pill */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-950/50 border border-emerald-500/30 text-emerald-300 text-xs font-medium">
          <Database className="w-3.5 h-3.5 text-emerald-400" />
          <span>label_app@localhost</span>
        </div>

        {/* User avatar badge */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white text-xs font-bold ring-2 ring-purple-500/30">
            KS
          </div>
          <div className="hidden md:block text-left text-xs">
            <p className="font-semibold text-slate-200 leading-none">Karan Seelam</p>
            <p className="text-[10px] text-slate-400 leading-none mt-1">Label Admin</p>
          </div>
        </div>
      </div>
    </header>
  );
}
