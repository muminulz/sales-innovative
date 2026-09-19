import React, { useState } from 'react';
import {
  Activity,
  ChevronDown,
  Phone,
  Mail,
  Clock3,
} from 'lucide-react';
import { HistoryItem } from '../types';

interface ActivitySectionProps {
  history: HistoryItem[];
  onCallValue: (phone: string, name?: string) => void;
  onEmailValue: (email: string, name?: string) => void;
  onClearHistory: () => void;
}

export const ActivitySection: React.FC<ActivitySectionProps> = ({
  history,
  onCallValue,
  onEmailValue,
  onClearHistory,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filterFrom, setFilterFrom] = useState('');
  const [filterTo, setFilterTo] = useState('');

  const filtered = history.filter((item) => {
    const d = new Date(item.timestamp);
    if (filterFrom) {
      const fromDate = new Date(filterFrom + 'T00:00:00');
      if (d < fromDate) return false;
    }
    if (filterTo) {
      const toDate = new Date(filterTo + 'T23:59:59');
      if (d > toDate) return false;
    }
    return true;
  });

  const clearFilters = () => {
    setFilterFrom('');
    setFilterTo('');
  };

  return (
    <div className="border border-white/10 rounded-2xl bg-[#090b0a] shadow-lg overflow-hidden mb-6">
      {/* Header */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3.5 cursor-pointer hover:bg-white/[0.02] transition-colors select-none"
      >
        <div className="flex items-center gap-2 text-xs font-bold text-zinc-200">
          <Activity className="w-4 h-4 text-emerald-400" />
          <span>Activity & Dial History</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            {history.length}
          </span>
        </div>

        {/* Filters */}
        <div
          onClick={(e) => e.stopPropagation()}
          className="flex items-center gap-1.5 flex-wrap"
        >
          <div className="flex items-center gap-1">
            <span className="text-[10px] font-semibold text-zinc-500">From</span>
            <input
              type="date"
              value={filterFrom}
              onChange={(e) => setFilterFrom(e.target.value)}
              className="h-7 px-2 rounded-lg bg-zinc-900 border border-white/10 text-[10px] text-zinc-300 outline-none focus:border-emerald-500/40"
            />
          </div>

          <div className="flex items-center gap-1">
            <span className="text-[10px] font-semibold text-zinc-500">To</span>
            <input
              type="date"
              value={filterTo}
              onChange={(e) => setFilterTo(e.target.value)}
              className="h-7 px-2 rounded-lg bg-zinc-900 border border-white/10 text-[10px] text-zinc-300 outline-none focus:border-emerald-500/40"
            />
          </div>

          {(filterFrom || filterTo) && (
            <button
              type="button"
              onClick={clearFilters}
              className="h-7 px-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-[10px] font-bold text-zinc-400 hover:text-white"
            >
              Clear
            </button>
          )}

          <button
            type="button"
            onClick={onClearHistory}
            className="h-7 px-2 rounded-lg bg-zinc-900 hover:bg-rose-950/40 border border-white/10 hover:border-rose-500/30 text-[10px] font-bold text-zinc-400 hover:text-rose-300 transition-colors"
          >
            Clear history
          </button>

          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="w-7 h-7 rounded-lg bg-zinc-900 border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white"
            title="Toggle activity"
          >
            <ChevronDown
              className={`w-4 h-4 transition-transform duration-200 ${
                isOpen ? 'rotate-180' : ''
              }`}
            />
          </button>
        </div>
      </div>

      {/* Expandable Body */}
      {isOpen && (
        <div className="border-t border-white/5 p-2 bg-black/20 max-h-96 overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="py-8 text-center text-zinc-500 text-xs flex flex-col items-center gap-1.5">
              <Clock3 className="w-6 h-6 opacity-30" />
              <span>{history.length === 0 ? 'No activity history yet' : 'No records match the selected date range'}</span>
            </div>
          ) : (
            <div className="space-y-1">
              {filtered.map((item, idx) => {
                const date = new Date(item.timestamp);
                const timeStr = date.toLocaleString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                });
                const isCall = item.type === 'call';

                return (
                  <div
                    key={idx}
                    className="flex items-center justify-between gap-3 p-2 rounded-xl hover:bg-white/[0.03] border border-transparent hover:border-white/5 transition-all"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span
                        className={`px-2 py-0.5 rounded-md text-[9px] font-extrabold uppercase tracking-wide flex items-center gap-1 flex-none ${
                          isCall
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-rose-500/10 text-rose-300 border border-rose-500/20'
                        }`}
                      >
                        {isCall ? (
                          <Phone className="w-2.5 h-2.5" />
                        ) : (
                          <Mail className="w-2.5 h-2.5" />
                        )}
                        <span>{isCall ? 'Call' : 'Email'}</span>
                      </span>

                      <span className="text-xs font-semibold text-zinc-200 truncate">
                        {item.value}
                      </span>

                      {item.name && (
                        <span className="text-[11px] text-zinc-400 truncate hidden sm:inline">
                          ({item.name})
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 flex-none">
                      <span className="text-[10px] text-zinc-500">{timeStr}</span>
                      <button
                        type="button"
                        onClick={() =>
                          isCall
                            ? onCallValue(item.value, item.name)
                            : onEmailValue(item.value, item.name)
                        }
                        className="w-7 h-7 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-white/10 flex items-center justify-center text-zinc-300 hover:text-white transition-colors"
                        title={isCall ? 'Call again' : 'Compose email'}
                      >
                        {isCall ? (
                          <Phone className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <Mail className="w-3 h-3 text-rose-400" />
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
