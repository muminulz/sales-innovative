import React from 'react';
import { PhoneCall, Calendar, ArrowRight } from 'lucide-react';
import { CrmDatabase, calculateLeadScore, stageLabel, todayIso } from '../../utils/storage';
import { Lead } from '../../types';
import { CrmTab } from './CrmNav';

interface DashboardTabProps {
  db: CrmDatabase;
  onOpenLead: (lead: Lead) => void;
  onWrapUpLead: (lead: Lead) => void;
  onNavigateTab: (tab: CrmTab) => void;
  onCallLead: (lead: Lead) => void;
}

export const DashboardTab: React.FC<DashboardTabProps> = ({
  db,
  onOpenLead,
  onWrapUpLead,
  onNavigateTab,
  onCallLead,
}) => {
  const today = todayIso();
  const todayCalls = db.calls.filter(
    (c) => String(c.at).slice(0, 10) === today
  ).length;

  const overdueFollowups = db.followups.filter(
    (f) => !f.done && f.date && f.date < today
  );
  const dueTodayFollowups = db.followups.filter(
    (f) => !f.done && f.date && f.date === today
  );
  const upcomingFollowups = db.followups
    .filter((f) => !f.done && f.date && f.date > today)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 6);

  const openTasks = db.tasks.filter((t) => !t.done);

  // Score leads and sort by priority score
  const scoredLeads = db.leads
    .map((l) => ({ lead: l, scoreInfo: calculateLeadScore(l) }))
    .sort((a, b) => b.scoreInfo.score - a.scoreInfo.score);

  const priorityQueue = scoredLeads.slice(0, 7);

  const totalCollected = db.leads.reduce((s, l) => s + Number(l.paid || 0), 0);
  const totalDue = db.leads.reduce((s, l) => s + Number(l.due || 0), 0);

  return (
    <div className="space-y-4">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-zinc-100">
            Sales Command Center
          </h2>
          <p className="text-xs text-zinc-400">
            {new Date().toLocaleDateString(undefined, {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}{' '}
            · Complete connected operational workflow.
          </p>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
        <div className="p-3.5 rounded-xl border border-white/10 bg-[#0e1114]">
          <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
            Today's Calls
          </div>
          <div className="text-2xl font-black text-emerald-400 mt-1">
            {todayCalls}
          </div>
          <div className="text-[10px] text-zinc-500 mt-0.5">Every call attempt</div>
        </div>

        <div className="p-3.5 rounded-xl border border-white/10 bg-[#0e1114]">
          <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
            Due Today
          </div>
          <div className="text-2xl font-black text-amber-400 mt-1">
            {dueTodayFollowups.length}
          </div>
          <div className="text-[10px] text-zinc-500 mt-0.5">
            Overdue: {overdueFollowups.length}
          </div>
        </div>

        <div className="p-3.5 rounded-xl border border-white/10 bg-[#0e1114]">
          <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
            Priority Leads
          </div>
          <div className="text-2xl font-black text-rose-400 mt-1">
            {scoredLeads.filter((x) => x.scoreInfo.score >= 40).length}
          </div>
          <div className="text-[10px] text-zinc-500 mt-0.5">Urgent & high</div>
        </div>

        <div className="p-3.5 rounded-xl border border-white/10 bg-[#0e1114]">
          <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
            Open Tasks
          </div>
          <div className="text-2xl font-black text-cyan-400 mt-1">
            {openTasks.length}
          </div>
          <div className="text-[10px] text-zinc-500 mt-0.5">Action items</div>
        </div>

        <div className="p-3.5 rounded-xl border border-white/10 bg-[#0e1114]">
          <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
            Total Leads
          </div>
          <div className="text-2xl font-black text-zinc-200 mt-1">
            {db.leads.length}
          </div>
          <div className="text-[10px] text-zinc-500 mt-0.5">Active pipeline</div>
        </div>

        <div className="p-3.5 rounded-xl border border-white/10 bg-[#0e1114]">
          <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
            Collected
          </div>
          <div className="text-2xl font-black text-emerald-300 mt-1">
            ৳{totalCollected.toLocaleString()}
          </div>
          <div className="text-[10px] text-zinc-500 mt-0.5">
            Due: ৳{totalDue.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Main Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* Priority Lead Work Queue */}
        <div className="p-4 rounded-xl border border-white/10 bg-[#0e1114] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-white/5">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-rose-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-200">
                  Priority Work Queue
                </h3>
              </div>
              <button
                type="button"
                onClick={() => onNavigateTab('leads')}
                className="text-xs font-semibold text-emerald-400 hover:underline flex items-center gap-1"
              >
                <span>View all leads</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="mt-3 space-y-2">
              {priorityQueue.length === 0 ? (
                <div className="py-8 text-center text-xs text-zinc-500">
                  No priority leads right now. Add or import leads to begin!
                </div>
              ) : (
                priorityQueue.map(({ lead, scoreInfo }) => (
                  <div
                    key={lead.id}
                    className="p-2.5 rounded-lg border border-white/5 bg-black/20 flex items-center justify-between gap-3 hover:border-white/15 transition-all"
                  >
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-zinc-200 truncate">
                        {lead.name || lead.phone || 'Unnamed'}
                      </div>
                      <div className="text-[11px] text-zinc-400 truncate">
                        {lead.course || 'No course'} · {stageLabel(lead.stage)}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-none">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold ${
                          scoreInfo.level === 'URGENT'
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : scoreInfo.level === 'HIGH'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-zinc-800 text-zinc-400'
                        }`}
                      >
                        {scoreInfo.level} ({scoreInfo.score})
                      </span>

                      <button
                        type="button"
                        onClick={() => onCallLead(lead)}
                        className="h-7 px-2 rounded-md bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                        title="Call lead"
                      >
                        <PhoneCall className="w-3 h-3" />
                        <span>Call</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => onWrapUpLead(lead)}
                        className="h-7 px-2 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-[10px] font-bold cursor-pointer"
                      >
                        Wrap Up
                      </button>

                      <button
                        type="button"
                        onClick={() => onOpenLead(lead)}
                        className="h-7 px-2 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-[10px] font-bold cursor-pointer"
                      >
                        Open
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Follow-up Radar */}
        <div className="p-4 rounded-xl border border-white/10 bg-[#0e1114]">
          <div className="flex items-center justify-between pb-3 border-b border-white/5">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-200">
                Follow-up Radar
              </h3>
            </div>
            <button
              type="button"
              onClick={() => onNavigateTab('followups')}
              className="text-xs font-semibold text-emerald-400 hover:underline flex items-center gap-1"
            >
              <span>Manage follow-ups</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="mt-3 space-y-2">
            {[...overdueFollowups, ...dueTodayFollowups].length === 0 ? (
              <div className="py-6 text-center text-xs text-zinc-500">
                No follow-ups due or overdue for today.
              </div>
            ) : (
              [...overdueFollowups, ...dueTodayFollowups].slice(0, 5).map((f) => {
                const lead = db.leads.find((l) => l.id === f.leadId);
                const isOverdue = f.date < today;
                return (
                  <div
                    key={f.id}
                    className="p-2.5 rounded-lg border border-white/5 bg-black/20 flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-zinc-200 truncate">
                        {lead?.name || lead?.phone || 'Lead'}
                      </div>
                      <div className="text-[11px] text-zinc-400 truncate">
                        {f.date} · {f.note || f.type || 'Follow-up'}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-none">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold ${
                          isOverdue
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        }`}
                      >
                        {isOverdue ? 'OVERDUE' : 'TODAY'}
                      </span>

                      {lead && (
                        <button
                          type="button"
                          onClick={() => onOpenLead(lead)}
                          className="h-7 px-2 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-[10px] font-bold cursor-pointer"
                        >
                          Open
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}

            {/* Upcoming preview */}
            {upcomingFollowups.length > 0 && (
              <div className="pt-2">
                <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1.5 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  <span>Upcoming scheduled follow-ups</span>
                </div>
                <div className="space-y-1">
                  {upcomingFollowups.slice(0, 3).map((f) => {
                    const lead = db.leads.find((l) => l.id === f.leadId);
                    return (
                      <div
                        key={f.id}
                        className="text-xs text-zinc-400 flex items-center justify-between p-1.5 rounded-md hover:bg-white/5"
                      >
                        <span className="truncate">
                          {lead?.name || lead?.phone || 'Lead'} — {f.note || 'Follow-up'}
                        </span>
                        <span className="text-[10px] text-zinc-500 flex-none ml-2">
                          {f.date}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
