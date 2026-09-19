import React, { useState, useEffect } from 'react';
import {
  Wrench,
  X,
  Database,
  LogIn,
  CalendarDays,
  Sparkles,
  FileSpreadsheet,
  FileText,
  MessageSquare,
} from 'lucide-react';

export const QuickToolsDrawer: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const tools = [
    {
      name: 'EduCRM',
      href: 'https://crm.innovativeskillsbd.com/',
      icon: <Database className="w-4 h-4 text-emerald-400" />,
      title: 'EduCRM Portal',
    },
    {
      name: 'Skills Login',
      href: 'https://innovativeskillsbd.com/innovativeskills/login',
      icon: <LogIn className="w-4 h-4 text-blue-400" />,
      title: 'Innovative Skills LMS',
    },
    {
      name: 'Sheets',
      href: 'https://docs.google.com/spreadsheets/u/0/',
      icon: <FileSpreadsheet className="w-4 h-4 text-green-400" />,
      title: 'Google Sheets',
    },
    {
      name: 'Forms',
      href: 'https://docs.google.com/forms/u/0/',
      icon: <FileText className="w-4 h-4 text-purple-400" />,
      title: 'Google Forms',
    },
    {
      name: 'Chat',
      href: 'https://chat.google.com/app/chat/AAQA3iwDMRc',
      icon: <MessageSquare className="w-4 h-4 text-cyan-400" />,
      title: 'Google Chat Operations',
    },
    {
      name: 'Batches',
      href: 'https://innovativeskillsbd.com/upcoming-batches',
      icon: <CalendarDays className="w-4 h-4 text-amber-400" />,
      title: 'Upcoming Batches',
    },
  ];

  return (
    <>
      {/* Floating Toggle Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? 'Close quick tools' : 'Open quick tools'}
        className="fixed right-4 top-20 z-40 w-11 h-11 rounded-full border border-white/15 bg-zinc-900/90 text-zinc-200 hover:text-white hover:bg-zinc-800 shadow-2xl backdrop-blur-md flex items-center justify-center cursor-pointer transition-all hover:scale-105 active:scale-95"
        title="Quick Operations Tools"
      >
        {isOpen ? <X className="w-5 h-5" /> : <Wrench className="w-5 h-5" />}
      </button>

      {/* Scrim */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-30 bg-black/40 backdrop-blur-xs transition-opacity"
        />
      )}

      {/* Floating Palette */}
      <aside
        className={`fixed right-4 top-20 z-40 w-[min(340px,calc(100vw-32px))] p-3.5 rounded-2xl bg-zinc-950/90 border border-white/15 shadow-2xl backdrop-blur-2xl transition-all duration-200 origin-top-right ${
          isOpen
            ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'
        }`}
      >
        <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-white/10">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/80" />
            <span className="text-xs font-bold text-zinc-200 tracking-wide uppercase">
              Operations Tools
            </span>
          </div>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="text-zinc-500 hover:text-zinc-300 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {tools.map((tool) => (
            <a
              key={tool.name}
              href={tool.href}
              target="_blank"
              rel="noopener noreferrer"
              title={tool.title}
              className="h-13 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/15 flex items-center gap-2.5 transition-all group"
            >
              <span className="w-7 h-7 rounded-lg bg-zinc-900 border border-white/10 flex items-center justify-center flex-none group-hover:scale-105 transition-transform">
                {tool.icon}
              </span>
              <span className="text-xs font-semibold text-zinc-200 truncate group-hover:text-white">
                {tool.name}
              </span>
            </a>
          ))}

          {/* Ask Gemini Button */}
          <a
            href="https://gemini.google.com/"
            target="_blank"
            rel="noopener noreferrer"
            title="Ask Gemini"
            className="col-span-2 h-12 px-3 rounded-xl bg-gradient-to-r from-indigo-950/40 via-purple-950/30 to-zinc-900 border border-indigo-500/25 hover:border-indigo-400/40 flex items-center gap-2.5 transition-all group"
          >
            <span className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 via-purple-500 to-rose-400 flex items-center justify-center flex-none text-white shadow-sm shadow-indigo-500/30">
              <Sparkles className="w-4 h-4" />
            </span>
            <div className="min-w-0">
              <div className="text-xs font-bold text-indigo-200 truncate">
                Ask Gemini
              </div>
              <div className="text-[10px] text-zinc-400 truncate">
                AI assistance & research
              </div>
            </div>
          </a>
        </div>
      </aside>
    </>
  );
};
