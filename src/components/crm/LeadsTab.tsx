import React, { useState } from 'react';
import { Search, PhoneCall, Plus, Trash2 } from 'lucide-react';
import { Lead } from '../../types';
import { STAGES, stageLabel } from '../../utils/storage';

interface LeadsTabProps {
  leads: Lead[];
  onOpenLead: (lead: Lead) => void;
  onCallLead: (lead: Lead) => void;
  onFollowLead: (lead: Lead) => void;
  onDeleteLead: (lead: Lead) => void;
  onDeleteSelected: (leadIds: string[]) => void;
  onNewLead: () => void;
}

export const LeadsTab: React.FC<LeadsTabProps> = ({
  leads,
  onOpenLead,
  onCallLead,
  onFollowLead,
  onDeleteLead,
  onDeleteSelected,
  onNewLead,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [stageFilter, setStageFilter] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const filtered = leads.filter((l) => {
    const q = searchTerm.toLowerCase();
    const matchesQuery =
      !q ||
      [
        l.name,
        l.phone,
        l.email,
        l.course,
        l.notes,
        l.sourceText,
        l.company,
        l.location,
        l.remark,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(q);

    const matchesStage = !stageFilter || l.stage === stageFilter;
    return matchesQuery && matchesStage;
  });

  const toggleSelectLead = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-3">
      {/* Title & Top Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-zinc-100">
            Lead Workspace
          </h2>
          <p className="text-xs text-zinc-400">
            Search, edit, follow up, assign courses, or delete records.
          </p>
        </div>
        <button
          type="button"
          onClick={onNewLead}
          className="h-9 px-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md shadow-emerald-500/20"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>New Lead</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-wrap items-center gap-2 p-2.5 rounded-xl bg-[#0e1114] border border-white/10">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search name, phone, email, course, note, company…"
            className="w-full h-8 pl-9 pr-3 rounded-lg bg-zinc-900 border border-white/10 text-xs text-zinc-200 outline-none focus:border-emerald-500/40"
          />
        </div>

        <select
          value={stageFilter}
          onChange={(e) => setStageFilter(e.target.value)}
          className="h-8 px-2.5 rounded-lg bg-zinc-900 border border-white/10 text-xs text-zinc-200 outline-none focus:border-emerald-500/40"
        >
          <option value="">All stages ({leads.length})</option>
          {STAGES.map((s) => (
            <option key={s.id} value={s.id}>
              {s.label}
            </option>
          ))}
        </select>

        <span className="text-xs text-zinc-500 ml-auto">
          {filtered.length} shown / {leads.length} total
        </span>

        {selectedIds.length > 0 && (
          <button
            type="button"
            onClick={() => onDeleteSelected(selectedIds)}
            className="h-8 px-3 rounded-lg bg-rose-950/40 hover:bg-rose-900/50 border border-rose-500/30 text-rose-300 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete selected ({selectedIds.length})</span>
          </button>
        )}
      </div>

      {/* Leads Table */}
      <div className="rounded-xl border border-white/10 bg-[#0e1114] overflow-x-auto">
        <table className="w-full border-collapse text-left text-xs min-w-[760px]">
          <thead>
            <tr className="border-b border-white/10 bg-[#0c0f12] text-zinc-400 text-[10px] uppercase tracking-wider font-bold">
              <th className="p-3 w-8"></th>
              <th className="p-3">Lead</th>
              <th className="p-3">Contact</th>
              <th className="p-3">Course</th>
              <th className="p-3">Stage</th>
              <th className="p-3">Paid / Total</th>
              <th className="p-3">Next Follow-up</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-zinc-200">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-8 text-center text-zinc-500">
                  No matching leads found.
                </td>
              </tr>
            ) : (
              filtered.map((lead) => {
                const isSelected = selectedIds.includes(lead.id);
                return (
                  <tr
                    key={lead.id}
                    className="hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="p-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelectLead(lead.id)}
                        className="rounded border-zinc-700 bg-zinc-900 text-emerald-500 focus:ring-0 cursor-pointer"
                      />
                    </td>
                    <td className="p-3">
                      <div className="font-bold text-zinc-100">
                        {lead.name || 'Unnamed'}
                      </div>
                      {(lead.company || lead.location) && (
                        <div className="text-[10px] text-zinc-500">
                          {lead.company || lead.location}
                        </div>
                      )}
                    </td>
                    <td className="p-3">
                      <div>{lead.phone || '—'}</div>
                      {lead.email && (
                        <div className="text-[10px] text-zinc-400 truncate max-w-[150px]">
                          {lead.email}
                        </div>
                      )}
                    </td>
                    <td className="p-3 max-w-[200px] truncate">
                      {lead.course || (
                        <span className="text-zinc-500">Not selected</span>
                      )}
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold border border-white/10 bg-zinc-900 text-zinc-300">
                        {stageLabel(lead.stage)}
                      </span>
                    </td>
                    <td className="p-3 font-semibold">
                      ৳{Number(lead.paid || 0).toLocaleString()} / ৳
                      {Number(lead.total || 0).toLocaleString()}
                    </td>
                    <td className="p-3 text-zinc-400">
                      {lead.nextFollowUp || '—'}
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => onOpenLead(lead)}
                          className="h-7 px-2.5 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-[10px] font-bold cursor-pointer"
                        >
                          Open
                        </button>
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
                          onClick={() => onFollowLead(lead)}
                          className="h-7 px-2 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[10px] font-bold cursor-pointer"
                        >
                          Follow
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteLead(lead)}
                          className="h-7 px-2 rounded-md bg-rose-950/20 hover:bg-rose-950/40 text-rose-400 border border-rose-500/20 text-[10px] font-bold cursor-pointer"
                        >
                          Delete
                        </button>
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
