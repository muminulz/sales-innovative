import React from 'react';
import { CrmDatabase, STAGES, stageLabel } from '../../utils/storage';

interface ReportsTabProps {
  db: CrmDatabase;
}

export const ReportsTab: React.FC<ReportsTabProps> = ({ db }) => {
  const totalValue = db.leads.reduce((s, l) => s + Number(l.total || 0), 0);
  const paidValue = db.leads.reduce((s, l) => s + Number(l.paid || 0), 0);
  const dueValue = db.leads.reduce((s, l) => s + Number(l.due || 0), 0);

  const totalCalls = db.calls.length;
  const connectedCalls = db.calls.filter((c) => c.outcome === 'Connected').length;
  const connectionRate = totalCalls > 0 ? Math.round((connectedCalls / totalCalls) * 100) : 0;

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg sm:text-xl font-bold text-zinc-100">
          Sales Intelligence & Reports
        </h2>
        <p className="text-xs text-zinc-400">
          Factual metrics derived directly from local records.
        </p>
      </div>

      {/* Main KPI Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="p-3.5 rounded-xl border border-white/10 bg-[#0e1114]">
          <div className="text-[10px] font-bold uppercase text-zinc-400">
            Pipeline Value
          </div>
          <div className="text-2xl font-black text-zinc-100 mt-1">
            ৳{totalValue.toLocaleString()}
          </div>
        </div>
        <div className="p-3.5 rounded-xl border border-white/10 bg-[#0e1114]">
          <div className="text-[10px] font-bold uppercase text-zinc-400">
            Collected Cash
          </div>
          <div className="text-2xl font-black text-emerald-400 mt-1">
            ৳{paidValue.toLocaleString()}
          </div>
        </div>
        <div className="p-3.5 rounded-xl border border-white/10 bg-[#0e1114]">
          <div className="text-[10px] font-bold uppercase text-zinc-400">
            Outstanding Due
          </div>
          <div className="text-2xl font-black text-amber-400 mt-1">
            ৳{dueValue.toLocaleString()}
          </div>
        </div>
        <div className="p-3.5 rounded-xl border border-white/10 bg-[#0e1114]">
          <div className="text-[10px] font-bold uppercase text-zinc-400">
            Call Connection Rate
          </div>
          <div className="text-2xl font-black text-cyan-400 mt-1">
            {connectionRate}%
          </div>
        </div>
      </div>

      {/* Pipeline Breakdown By Stage */}
      <div className="p-4 rounded-xl border border-white/10 bg-[#0e1114]">
        <div className="text-xs font-bold uppercase tracking-wider text-zinc-200 mb-3">
          Pipeline Distribution by Stage ({db.leads.length} leads)
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {STAGES.map((s) => {
            const count = db.leads.filter((l) => l.stage === s.id).length;
            const pct = db.leads.length > 0 ? Math.round((count / db.leads.length) * 100) : 0;
            return (
              <div
                key={s.id}
                className="p-3 rounded-lg border border-white/5 bg-black/20"
              >
                <div className="text-[11px] font-semibold text-zinc-400">
                  {s.label}
                </div>
                <div className="text-xl font-bold text-zinc-100 mt-1">
                  {count}
                  <span className="text-xs font-normal text-zinc-500 ml-1.5">
                    ({pct}%)
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Touchpoint Health */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="p-4 rounded-xl border border-white/10 bg-[#0e1114]">
          <div className="text-xs font-bold uppercase tracking-wider text-zinc-200 mb-2">
            Call Center Analytics
          </div>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Total call attempts: <b className="text-zinc-200">{totalCalls}</b><br />
            Successfully connected: <b className="text-emerald-400">{connectedCalls}</b><br />
            Other outcomes (No answer / Busy): <b className="text-zinc-300">{totalCalls - connectedCalls}</b>
          </p>
        </div>

        <div className="p-4 rounded-xl border border-white/10 bg-[#0e1114]">
          <div className="text-xs font-bold uppercase tracking-wider text-zinc-200 mb-2">
            Follow-up Health
          </div>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Total follow-ups: <b className="text-zinc-200">{db.followups.length}</b><br />
            Pending: <b className="text-amber-400">{db.followups.filter((f) => !f.done).length}</b><br />
            Completed: <b className="text-emerald-400">{db.followups.filter((f) => f.done).length}</b>
          </p>
        </div>
      </div>
    </div>
  );
};
