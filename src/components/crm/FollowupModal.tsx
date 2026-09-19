import React, { useState } from 'react';
import { X, Calendar } from 'lucide-react';
import { Lead } from '../../types';
import { todayIso } from '../../utils/storage';

interface FollowupModalProps {
  lead: Lead;
  onSaveFollowup: (data: { date: string; type: string; note: string }) => void;
  onClose: () => void;
}

export const FollowupModal: React.FC<FollowupModalProps> = ({
  lead,
  onSaveFollowup,
  onClose,
}) => {
  const [date, setDate] = useState(lead.nextFollowUp || todayIso());
  const [type, setType] = useState('Call');
  const [note, setNote] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!date) return;
    onSaveFollowup({ date, type, note });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl bg-[#0d1013] border border-white/15 p-5 shadow-2xl">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-bold text-zinc-100">Schedule Follow-up</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-zinc-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-zinc-400 mb-3">
          For: <b className="text-zinc-200">{lead.name || lead.phone}</b>
        </p>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">
                Date
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full h-8 px-2 rounded-lg bg-[#080a0c] border border-white/10 text-xs text-zinc-200"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">
                Touchpoint Type
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full h-8 px-2 rounded-lg bg-[#080a0c] border border-white/10 text-xs text-zinc-200"
              >
                <option>Call</option>
                <option>WhatsApp</option>
                <option>Messenger</option>
                <option>Email</option>
                <option>Meeting</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">
              Plan / Action Note
            </label>
            <textarea
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="What is the objective of this follow-up?"
              className="w-full p-2.5 rounded-lg bg-[#080a0c] border border-white/10 text-xs text-zinc-200"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="h-8 px-3 rounded-lg bg-zinc-800 text-zinc-300 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="h-8 px-4 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold"
            >
              Save Follow-up
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
