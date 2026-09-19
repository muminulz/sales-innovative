import React from 'react';
import { PhoneCall, PhoneForwarded } from 'lucide-react';
import { CallLog, Lead } from '../../types';
import { todayIso } from '../../utils/storage';

interface CallsTabProps {
  calls: CallLog[];
  leads: Lead[];
  onOpenLead: (lead: Lead) => void;
  onCallLead: (lead: Lead) => void;
  onCallWorkspace: () => void;
}

export const CallsTab: React.FC<CallsTabProps> = ({
  calls,
  leads,
  onOpenLead,
  onCallLead,
  onCallWorkspace,
}) => {
  const today = todayIso();
  const todayCalls = calls.filter((c) => String(c.at).slice(0, 10) === today);
  const connectedCalls = calls.filter((c) => c.outcome === 'Connected');

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-zinc-100">
            Call Center & History
          </h2>
          <p className="text-xs text-zinc-400">
            Every dial attempt, connected outcome, duration and note stays attached to the lead.
          </p>
        </div>
        <button
          type="button"
          onClick={onCallWorkspace}
          className="h-9 px-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md shadow-emerald-500/20"
        >
          <PhoneCall className="w-4 h-4 stroke-[2.5]" />
          <span>Call Current Lead</span>
        </button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="p-3 rounded-xl border border-white/10 bg-[#0e1114]">
          <div className="text-[10px] font-bold uppercase text-zinc-400">
            Today’s Dials
          </div>
          <div className="text-2xl font-black text-emerald-400 mt-1">
            {todayCalls.length}
          </div>
        </div>
        <div className="p-3 rounded-xl border border-white/10 bg-[#0e1114]">
          <div className="text-[10px] font-bold uppercase text-zinc-400">
            Connected
          </div>
          <div className="text-2xl font-black text-cyan-400 mt-1">
            {connectedCalls.length}
          </div>
        </div>
        <div className="p-3 rounded-xl border border-white/10 bg-[#0e1114]">
          <div className="text-[10px] font-bold uppercase text-zinc-400">
            Total Attempts
          </div>
          <div className="text-2xl font-black text-zinc-200 mt-1">
            {calls.length}
          </div>
        </div>
        <div className="p-3 rounded-xl border border-white/10 bg-[#0e1114]">
          <div className="text-[10px] font-bold uppercase text-zinc-400">
            Connection Rate
          </div>
          <div className="text-2xl font-black text-amber-400 mt-1">
            {calls.length > 0
              ? `${Math.round((connectedCalls.length / calls.length) * 100)}%`
              : '0%'}
          </div>
        </div>
      </div>

      {/* Call Table */}
      <div className="rounded-xl border border-white/10 bg-[#0e1114] overflow-x-auto">
        <table className="w-full border-collapse text-left text-xs min-w-[700px]">
          <thead>
            <tr className="border-b border-white/10 bg-[#0c0f12] text-zinc-400 text-[10px] uppercase tracking-wider font-bold">
              <th className="p-3">When</th>
              <th className="p-3">Lead</th>
              <th className="p-3">Course</th>
              <th className="p-3">Outcome</th>
              <th className="p-3">Duration</th>
              <th className="p-3">Notes</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-zinc-200">
            {calls.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-zinc-500">
                  No call attempts recorded yet. Use Call buttons to log calls.
                </td>
              </tr>
            ) : (
              calls.map((call) => {
                const lead = leads.find((l) => l.id === call.leadId);
                const d = new Date(call.at);
                return (
                  <tr
                    key={call.id}
                    className="hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="p-3">
                      <div className="font-bold text-zinc-200">
                        {d.toLocaleDateString()}
                      </div>
                      <div className="text-[10px] text-zinc-400">
                        {d.toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="font-bold text-zinc-100">
                        {lead?.name || lead?.phone || 'Lead'}
                      </div>
                      <div className="text-[10px] text-zinc-400">
                        {lead?.phone || ''}
                      </div>
                    </td>
                    <td className="p-3 max-w-[180px] truncate text-zinc-400">
                      {call.course || lead?.course || '—'}
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-zinc-900 border border-white/10 text-zinc-300">
                        {call.outcome || 'Attempted'}
                      </span>
                    </td>
                    <td className="p-3">
                      {call.duration ? `${call.duration} min` : '—'}
                    </td>
                    <td className="p-3 max-w-xs truncate text-zinc-300">
                      {call.notes || '—'}
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {lead && (
                          <>
                            <button
                              type="button"
                              onClick={() => onCallLead(lead)}
                              className="h-7 px-2 rounded-md bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                            >
                              <PhoneForwarded className="w-3 h-3" />
                              <span>Redial</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => onOpenLead(lead)}
                              className="h-7 px-2.5 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-[10px] font-bold cursor-pointer"
                            >
                              Open
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
