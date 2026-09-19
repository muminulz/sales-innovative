import React, { useState } from 'react';
import { CheckCircle2, PhoneCall, Plus, Calendar, Clock, X } from 'lucide-react';
import { FollowUp, Lead } from '../../types';
import { todayIso, nowTimeIso, formatDisplayDateTime } from '../../utils/dateTime';

interface FollowupsTabProps {
  followups: FollowUp[];
  leads: Lead[];
  onOpenLead: (lead: Lead) => void;
  onCallLead: (lead: Lead) => void;
  onToggleDone: (followupId: string) => void;
  onNewFollowup: () => void;
  onAddFollowup?: (data: { leadId: string; date: string; time?: string; type: string; note: string }) => void;
}

export const FollowupsTab: React.FC<FollowupsTabProps> = ({
  followups,
  leads,
  onOpenLead,
  onCallLead,
  onToggleDone,
  onNewFollowup,
  onAddFollowup,
}) => {
  const today = todayIso();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLeadId, setSelectedLeadId] = useState(leads[0]?.id || '');
  const [followupDate, setFollowupDate] = useState(todayIso());
  const [followupTime, setFollowupTime] = useState(nowTimeIso());
  const [followupType, setFollowupType] = useState('Call');
  const [followupNote, setFollowupNote] = useState('');

  const sorted = [...followups].sort((a, b) => {
    if (a.done !== b.done) return a.done ? 1 : -1;
    const aKey = `${a.date || ''} ${a.time || ''}`;
    const bKey = `${b.date || ''} ${b.time || ''}`;
    return aKey.localeCompare(bKey);
  });

  const handleOpenAddModal = () => {
    if (leads.length > 0) {
      if (!selectedLeadId) setSelectedLeadId(leads[0].id);
      setIsModalOpen(true);
    } else {
      onNewFollowup();
    }
  };

  const handleSaveModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLeadId) return;

    if (onAddFollowup) {
      onAddFollowup({
        leadId: selectedLeadId,
        date: followupDate,
        time: followupTime,
        type: followupType,
        note: followupNote.trim(),
      });
      setIsModalOpen(false);
      setFollowupNote('');
    } else {
      onNewFollowup();
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-zinc-100">
            Follow-up Queue
          </h2>
          <p className="text-xs text-zinc-400">
            Keep commitments visible: every follow-up requires both scheduled date and time.
          </p>
        </div>
        <button
          type="button"
          onClick={handleOpenAddModal}
          className="h-9 px-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md shadow-emerald-500/20 active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Add Follow-up</span>
        </button>
      </div>

      {/* Add Follow-up Modal with Date and Time */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-[#0e1114] border border-white/15 p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2 text-zinc-100 font-bold text-sm">
                <Calendar className="w-4 h-4 text-emerald-400" />
                <span>Schedule New Follow-up</span>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveModal} className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">
                  Select Lead <span className="text-rose-400">*</span>
                </label>
                <select
                  required
                  value={selectedLeadId}
                  onChange={(e) => setSelectedLeadId(e.target.value)}
                  className="w-full h-9 px-3 rounded-lg bg-[#080a0c] border border-white/10 text-xs text-zinc-200 outline-none focus:border-emerald-500/50"
                >
                  {leads.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.name || 'Lead'} — {l.phone} {l.course ? `(${l.course})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1 flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-emerald-400" />
                    <span>Date</span>
                    <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={followupDate}
                    onChange={(e) => setFollowupDate(e.target.value)}
                    className="w-full h-9 px-2.5 rounded-lg bg-[#080a0c] border border-white/10 text-xs text-zinc-200 outline-none focus:border-emerald-500/50"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-emerald-400" />
                    <span>Time</span>
                    <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="time"
                    required
                    value={followupTime}
                    onChange={(e) => setFollowupTime(e.target.value)}
                    className="w-full h-9 px-2.5 rounded-lg bg-[#080a0c] border border-white/10 text-xs text-zinc-200 outline-none focus:border-emerald-500/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">
                  Follow-up Type
                </label>
                <select
                  value={followupType}
                  onChange={(e) => setFollowupType(e.target.value)}
                  className="w-full h-9 px-3 rounded-lg bg-[#080a0c] border border-white/10 text-xs text-zinc-200 outline-none"
                >
                  <option value="Call">Phone Call</option>
                  <option value="WhatsApp">WhatsApp Message</option>
                  <option value="Email">Email</option>
                  <option value="Meeting">Meeting Follow-up</option>
                  <option value="Payment">Payment Follow-up</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">
                  Discussion / Reminder Note
                </label>
                <input
                  type="text"
                  value={followupNote}
                  onChange={(e) => setFollowupNote(e.target.value)}
                  placeholder="e.g. Call regarding installment decision or demo class link"
                  className="w-full h-9 px-3 rounded-lg bg-[#080a0c] border border-white/10 text-xs text-zinc-200 outline-none focus:border-emerald-500/50"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="h-9 px-3 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-9 px-4 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold shadow-md shadow-emerald-500/20"
                >
                  Save Follow-up
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="rounded-xl border border-white/10 bg-[#0e1114] overflow-x-auto">
        <table className="w-full border-collapse text-left text-xs min-w-[650px]">
          <thead>
            <tr className="border-b border-white/10 bg-[#0c0f12] text-zinc-400 text-[10px] uppercase tracking-wider font-bold">
              <th className="p-3">Status</th>
              <th className="p-3">Date & Time</th>
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
                const dt = formatDisplayDateTime(f.date, f.time);
                const cleanDate = f.date.includes('T') ? f.date.split('T')[0] : f.date;
                const isOverdue = !f.done && cleanDate < today;
                const isDueToday = !f.done && cleanDate === today;

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
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <span className="text-zinc-100 font-semibold flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-zinc-400" />
                          <span>{dt.dateFormatted}</span>
                        </span>
                        {dt.timeFormatted && (
                          <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-mono text-emerald-300 flex items-center gap-1">
                            <Clock className="w-2.5 h-2.5 text-emerald-400" />
                            <span>{dt.timeFormatted}</span>
                          </span>
                        )}
                      </div>
                    </td>
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
