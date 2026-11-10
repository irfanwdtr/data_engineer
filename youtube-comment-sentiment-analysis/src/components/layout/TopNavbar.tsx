'use client';

import React, { useState } from 'react';
import {
  Bell,
  ChevronDown,
  User,
  CheckCircle2,
  Sparkles,
  ExternalLink,
  Search,
  Menu,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';

export function TopNavbar() {
  const { currentKeyword, setMobileSidebarOpen } = useApp();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const notifications = [
    {
      id: 1,
      title: 'Analisis Komentar Selesai',
      desc: `2,450 komentar untuk "${currentKeyword}" berhasil diproses.`,
      time: '5 menit lalu',
      read: false,
    },
    {
      id: 2,
      title: 'YouTube Ingestion Pipeline',
      desc: '25 video baru berhasil diindeks ke staging bucket.',
      time: '1 jam lalu',
      read: true,
    },
    {
      id: 3,
      title: 'Sentiment Model Updated',
      desc: 'Model IndoBERT sentiment fine-tuned akurasi 94.2%.',
      time: '1 hari lalu',
      read: true,
    },
  ];

  return (
    <header className="h-16 bg-white border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Left side: Hamburger button on mobile + Active keyword context */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setMobileSidebarOpen(true)}
          className="md:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
          title="Buka Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 px-3 py-1 bg-slate-100/80 text-slate-700 text-xs font-medium rounded-lg border border-slate-200/60">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="hidden sm:inline">Active Dataset:</span>
          <span className="font-semibold text-slate-900">{currentKeyword}</span>
        </div>
      </div>

      {/* Right side: Actions & User Info */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowProfile(false);
            }}
            className="w-9 h-9 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-600 transition-colors relative"
            title="Notifikasi"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" />
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-100 p-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-2">
                <span className="text-xs font-semibold text-slate-800">Notifikasi</span>
                <span className="text-[11px] text-blue-600 hover:underline cursor-pointer">
                  Tandai dibaca
                </span>
              </div>
              <div className="space-y-2">
                {notifications.map((item) => (
                  <div
                    key={item.id}
                    className={`p-2.5 rounded-lg text-xs transition-colors ${
                      item.read ? 'bg-white hover:bg-slate-50' : 'bg-blue-50/50 hover:bg-blue-50'
                    }`}
                  >
                    <div className="flex items-center justify-between font-medium text-slate-800">
                      <span>{item.title}</span>
                      <span className="text-[10px] text-slate-400">{item.time}</span>
                    </div>
                    <p className="text-slate-500 text-[11px] mt-0.5">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Avatar & Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setShowProfile(!showProfile);
              setShowNotifications(false);
            }}
            className="flex items-center gap-2.5 pl-2 pr-1 py-1 rounded-full hover:bg-slate-100 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-semibold text-xs flex items-center justify-center shadow-sm">
              DE
            </div>
            <div className="hidden md:flex flex-col text-left">
              <span className="text-xs font-semibold text-slate-800 leading-tight">
                Data Engineer
              </span>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-500" />
          </button>

          {/* Profile Dropdown */}
          {showProfile && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-100 py-1.5 z-50 text-xs">
              <div className="px-3 py-2 border-b border-slate-100">
                <p className="font-semibold text-slate-800">Irfan Hakim</p>
                <p className="text-slate-400 text-[11px]">engineer@sentiment.internal</p>
              </div>
              <div className="py-1">
                <a
                  href="#pipeline"
                  onClick={(e) => {
                    e.preventDefault();
                    setShowProfile(false);
                  }}
                  className="px-3 py-2 text-slate-700 hover:bg-slate-50 flex items-center justify-between"
                >
                  <span>Data Pipeline Status</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                </a>
                <a
                  href="#storage"
                  onClick={(e) => {
                    e.preventDefault();
                    setShowProfile(false);
                  }}
                  className="px-3 py-2 text-slate-700 hover:bg-slate-50 flex items-center justify-between"
                >
                  <span>PostgreSQL Connector</span>
                  <span className="text-[10px] text-slate-400">Mock Mode</span>
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
