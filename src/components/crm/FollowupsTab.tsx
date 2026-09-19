import React from 'react';
import { CheckCircle2, PhoneCall, Plus } from 'lucide-react';
import { FollowUp, Lead } from '../../types';
import { todayIso } from '../../utils/storage';

interface FollowupsTabProps {
  followups: FollowUp[];
  leads: Lead[];
  onOpenLead: (lead: Lead) => void;
  onCallLead: (lead: Lead) => void;
  onToggleDone: (followupId: string) => void;
  onNewFollowup: () => void;
}

export const FollowupsTab: React.FC<FollowupsTabProps> = ({
  followups,
  leads,
  onOpenLead,
  onCallLead,
  onToggleDone,
  onNewFollowup,
}) => {
  const today = todayIso();
  const sorted = [...followups].sort((a, b) => {
    if (a.done !== b.done) return a.done ? 1 : -1;
    return a.date.localeCompare(b.date);
  });

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-zinc-100">
            Follow-up Queue
          </h2>
          <p className="text-xs text-zinc-400">
            Keep commitments visible: overdue and today’s tasks are highlighted.
          </p>
        </div>
        <button
          type="button"
          onClick={onNewFollowup}
          className="h-9 px-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md shadow-emerald-500/20"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Add Follow-up</span>
        </button>
      </div>

      <div className="rounded-xl border border-white/10 bg-[#0e1114] overflow-x-auto">
        <table className="w-full border-collapse text-left text-xs min-w-[650px]">
          <thead>
            <tr className="border-b border-white/10 bg-[#0c0f12] text-zinc-400 text-[10px] uppercase tracking-wider font-bold">
              <th className="p-3">Status</th>
              <th className="p-3">Date</th>
              <th className="p-3">Lead</th>
              <th className="p-3">Type</th>
              <th className="p-3">Plan / Notes</th>
              <th className="p-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-zinc-200">
            {sorted.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-zinc-500">
                  No scheduled follow-ups. Click "+ Add Follow-up" or set one from a lead!
                </td>
              </tr>
            ) : (
              sorted.map((f) => {
                const lead = leads.find((l) => l.id === f.leadId);
                const isOverdue = !f.done && f.date < today;
                const isDueToday = !f.done && f.date === today;

                return (
                  <tr
                    key={f.id}
                    className={`hover:bg-white/[0.02] transition-colors ${
                      f.done ? 'opacity-60' : ''
                    }`}
                  >
                    <td className="p-3">
                      <button
                        type="button"
                        onClick={() => onToggleDone(f.id)}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-colors ${
                          f.done
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : isOverdue
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : isDueToday
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-zinc-800 text-zinc-400 border border-white/5'
                        }`}
                      >
                        <CheckCircle2 className="w-3 h-3" />
                        <span>
                          {f.done
                            ? 'Done'
                            : isOverdue
                            ? 'OVERDUE'
                            : isDueToday
                            ? 'DUE TODAY'
                            : 'UPCOMING'}
                        </span>
                      </button>
                    </td>
                    <td className="p-3 font-semibold">{f.date}</td>
                    <td className="p-3">
                      <div className="font-bold text-zinc-100">
                        {lead?.name || lead?.phone || 'Lead'}
                      </div>
                      {lead?.phone && (
                        <div className="text-[10px] text-zinc-400">
                          {lead.phone}
                        </div>
                      )}
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded-md bg-zinc-900 border border-white/5 text-[10px]">
                        {f.type || 'Call'}
                      </span>
                    </td>
                    <td className="p-3 text-zinc-300 max-w-xs truncate">
                      {f.note || '—'}
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
                              <PhoneCall className="w-3 h-3" />
                              <span>Call</span>
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
