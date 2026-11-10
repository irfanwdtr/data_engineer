'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Search,
  BarChart3,
  Layers,
  Database,
  Clock,
  Youtube,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useApp } from '@/context/AppContext';

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
}

const navItems: NavItem[] = [
  { name: 'Overview', href: '/', icon: LayoutDashboard },
  { name: 'YouTube Search', href: '/search', icon: Search },
  { name: 'Sentiment Analysis', href: '/sentiment', icon: BarChart3 },
  { name: 'Topic Analysis', href: '/topics', icon: Layers },
  { name: 'Data Explorer', href: '/explorer', icon: Database },
  { name: 'Analysis History', href: '/history', icon: Clock },
];

export function Sidebar() {
  const pathname = usePathname();
  const { mobileSidebarOpen, setMobileSidebarOpen } = useApp();

  const sidebarContent = (
    <div className="w-64 bg-[#0b1329] text-white flex flex-col shrink-0 min-h-screen border-r border-slate-800/80 select-none h-full">
      {/* Brand Header */}
      <div className="px-6 py-6 flex items-center justify-between border-b border-slate-800/50">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-red-600 flex items-center justify-center shadow-lg shadow-red-600/30 shrink-0">
            <Youtube className="w-5 h-5 text-white fill-white" />
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-sm leading-tight text-white tracking-wide">
              YouTube Comment
            </span>
            <span className="text-xs text-slate-400 leading-tight">
              Sentiment Analysis
            </span>
          </div>
        </div>

        {/* Close Button on Mobile */}
        <button
          onClick={() => setMobileSidebarOpen(false)}
          className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-6 space-y-1.5">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => setMobileSidebarOpen(false)}
              className={cn(
                'flex items-center gap-3.5 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group',
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              )}
            >
              <Icon
                className={cn(
                  'w-4 h-4 transition-transform duration-200 group-hover:scale-105',
                  isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'
                )}
              />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer Info / Badge */}
      <div className="p-4 mx-3 mb-4 rounded-xl bg-gradient-to-b from-slate-900/80 to-[#070d1d] border border-slate-800/80 relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-blue-600/10 rounded-full blur-xl pointer-events-none" />
        <div className="flex items-center gap-2 mb-1.5">
          <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-300 border border-slate-700/60">
            v1.0.0
          </span>
          <span className="text-[11px] text-emerald-400 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Ready
          </span>
        </div>
        <p className="text-xs text-slate-300 font-medium">Data Engineering Project</p>
        <p className="text-[11px] text-slate-500 mt-0.5">NLP Sentiment Pipeline</p>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden md:flex flex-col shrink-0">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <div className="relative z-10 flex flex-col h-full animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
