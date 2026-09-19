import React, { useState } from 'react';
import { X, PhoneCall } from 'lucide-react';
import { Lead, StageId } from '../../types';
import { STAGES, todayIso } from '../../utils/storage';
import { COURSES } from '../../data/courses';

interface CallModalProps {
  lead: Lead;
  onSaveCall: (callData: {
    outcome: string;
    duration: number;
    notes: string;
    course?: string;
    mode?: string;
    nextStage?: StageId;
    nextFollowUp?: string;
  }) => void;
  onClose: () => void;
}

export const CallModal: React.FC<CallModalProps> = ({
  lead,
  onSaveCall,
  onClose,
}) => {
  const [outcome, setOutcome] = useState('Connected');
  const [duration, setDuration] = useState(5);
  const [course, setCourse] = useState(lead.course || '');
  const [nextStage, setNextStage] = useState<StageId>(lead.stage);
  const [nextFollowUp, setNextFollowUp] = useState(lead.nextFollowUp || '');
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveCall({
      outcome,
      duration,
      notes,
      course,
      nextStage,
      nextFollowUp,
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-lg rounded-2xl bg-[#0d1013] border border-white/15 p-5 shadow-2xl">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10">
          <div>
            <h3 className="text-base font-bold text-zinc-100 flex items-center gap-2">
              <PhoneCall className="w-4 h-4 text-emerald-400" />
              <span>Call Log & Outcome</span>
            </h3>
            <p className="text-xs text-zinc-400">
              {lead.name || 'Lead'} · {lead.phone}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-zinc-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">
                Call Outcome
              </label>
              <select
                value={outcome}
                onChange={(e) => setOutcome(e.target.value)}
                className="w-full h-8 px-2 rounded-lg bg-[#080a0c] border border-white/10 text-xs text-zinc-200"
              >
                <option>Connected</option>
                <option>No answer</option>
                <option>Busy</option>
                <option>Callback requested</option>
                <option>Interested</option>
                <option>Payment discussion</option>
                <option>Not interested</option>
                <option>Wrong number</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">
                Duration (minutes)
              </label>
              <input
                type="number"
                min="0"
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="w-full h-8 px-2.5 rounded-lg bg-[#080a0c] border border-white/10 text-xs text-zinc-200"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">
              Course Discussed
            </label>
            <select
              value={course}
              onChange={(e) => setCourse(e.target.value)}
              className="w-full h-8 px-2 rounded-lg bg-[#080a0c] border border-white/10 text-xs text-zinc-200"
            >
              <option value="">None / Existing ({lead.course || 'Not selected'})</option>
              {COURSES.map((c) => (
                <option key={c.name} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">
                Update Stage
              </label>
              <select
                value={nextStage}
                onChange={(e) => setNextStage(e.target.value as StageId)}
                className="w-full h-8 px-2 rounded-lg bg-[#080a0c] border border-white/10 text-xs text-zinc-200"
              >
                {STAGES.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">
                Next Follow-up Date
              </label>
              <input
                type="date"
                value={nextFollowUp}
                onChange={(e) => setNextFollowUp(e.target.value)}
                className="w-full h-8 px-2 rounded-lg bg-[#080a0c] border border-white/10 text-xs text-zinc-200"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">
              Call Notes / Next Step
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="What did the customer say? What are they looking for?"
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
              Save Call Record
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
