import React, { useState } from 'react';
import {
  X,
  PhoneCall,
  Save,
  Trash2,
  DollarSign,
  Calendar,
  Clock,
  Users,
} from 'lucide-react';
import { Lead } from '../../types';
import { STAGES } from '../../utils/storage';
import { COURSES } from '../../data/courses';

interface LeadEditModalProps {
  lead: Lead;
  onSave: (updated: Lead) => void;
  onClose: () => void;
  onDelete: (lead: Lead) => void;
  onCall: (lead: Lead) => void;
  onFollow: (lead: Lead) => void;
  onPay: (lead: Lead) => void;
  onScheduleMeeting?: (lead: Lead) => void;
  timelineEvents: { at: string; type: string; text: string }[];
}

export const LeadEditModal: React.FC<LeadEditModalProps> = ({
  lead,
  onSave,
  onClose,
  onDelete,
  onCall,
  onFollow,
  onPay,
  onScheduleMeeting,
  timelineEvents,
}) => {
  const [formData, setFormData] = useState<Lead>({ ...lead });
  const [courseSearch, setCourseSearch] = useState(lead.course || '');
  const [showCourseList, setShowCourseList] = useState(false);

  const handleChange = (
    field: keyof Lead,
    value: string | number | undefined
  ) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };
      if (field === 'total' || field === 'paid') {
        const total = Number(field === 'total' ? value : updated.total) || 0;
        const paid = Number(field === 'paid' ? value : updated.paid) || 0;
        updated.due = Math.max(0, total - paid);
      }
      return updated;
    });
  };

  const selectCourse = (name: string, mode: string) => {
    setCourseSearch(name);
    setFormData((prev) => ({ ...prev, course: name, courseMode: mode }));
    setShowCourseList(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const filteredCourses = COURSES.filter(
    (c) =>
      !courseSearch ||
      c.name.toLowerCase().includes(courseSearch.toLowerCase()) ||
      c.mode.toLowerCase().includes(courseSearch.toLowerCase())
  ).slice(0, 10);

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="w-full max-w-4xl max-h-[92vh] flex flex-col rounded-2xl bg-[#0d1013] border border-white/15 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10 bg-[#111418]">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-zinc-100">
              {formData.name || 'Lead Details'}
            </h3>
            <p className="text-xs text-zinc-400">
              {formData.phone || 'No phone'} · {formData.email || 'No email'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onDelete(formData)}
              className="h-8 px-2.5 rounded-lg bg-rose-950/30 hover:bg-rose-950/50 border border-rose-500/30 text-rose-400 text-xs font-semibold flex items-center gap-1 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1 text-zinc-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Action quick buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 p-3 bg-black/20 border-b border-white/5">
          <button
            type="button"
            onClick={() => onCall(formData)}
            className="h-8 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>Call Lead</span>
          </button>
          <button
            type="button"
            onClick={() => onFollow(formData)}
            className="h-8 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-white/10 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Set Follow-up</span>
          </button>
          {onScheduleMeeting && (
            <button
              type="button"
              onClick={() => onScheduleMeeting(formData)}
              className="h-8 rounded-lg bg-emerald-950/40 hover:bg-emerald-900/50 text-emerald-300 border border-emerald-500/30 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Users className="w-3.5 h-3.5" />
              <span>Mentor Meeting</span>
            </button>
          )}
          <button
            type="button"
            onClick={() => onPay(formData)}
            className="h-8 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-white/10 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>Record Payment</span>
          </button>
          <button
            type="button"
            onClick={() => setShowCourseList(true)}
            className="h-8 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-white/10 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>Assign Course</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 overflow-y-auto space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">
                Name
              </label>
              <input
                type="text"
                value={formData.name || ''}
                onChange={(e) => handleChange('name', e.target.value)}
                className="w-full h-8 px-2.5 rounded-lg bg-[#080a0c] border border-white/10 text-xs text-zinc-100 focus:border-emerald-500/50"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">
                Phone
              </label>
              <input
                type="text"
                value={formData.phone || ''}
                onChange={(e) => handleChange('phone', e.target.value)}
                className="w-full h-8 px-2.5 rounded-lg bg-[#080a0c] border border-white/10 text-xs text-zinc-100 focus:border-emerald-500/50"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">
                Email
              </label>
              <input
                type="email"
                value={formData.email || ''}
                onChange={(e) => handleChange('email', e.target.value)}
                className="w-full h-8 px-2.5 rounded-lg bg-[#080a0c] border border-white/10 text-xs text-zinc-100 focus:border-emerald-500/50"
              />
            </div>

            {/* Course with dropdown search */}
            <div className="md:col-span-3 relative">
              <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">
                Course Selection
              </label>
              <input
                type="text"
                value={courseSearch}
                onFocus={() => setShowCourseList(true)}
                onChange={(e) => {
                  setCourseSearch(e.target.value);
                  setShowCourseList(true);
                }}
                placeholder="Search Computer Vision, Python, Backend AI, Thesis, ML…"
                className="w-full h-8 px-2.5 rounded-lg bg-[#080a0c] border border-white/10 text-xs text-zinc-100 focus:border-emerald-500/50"
              />

              {showCourseList && (
                <div className="absolute top-full left-0 right-0 z-30 mt-1 max-h-48 overflow-y-auto rounded-xl bg-[#0d1013] border border-white/15 shadow-2xl p-1">
                  {filteredCourses.map((c) => (
                    <button
                      key={c.name}
                      type="button"
                      onClick={() => selectCourse(c.name, c.mode)}
                      className="w-full p-2 text-left rounded-lg hover:bg-white/10 text-xs text-zinc-200 flex items-center justify-between"
                    >
                      <span className="truncate">{c.name}</span>
                      <span className="text-[10px] text-zinc-400 flex-none ml-2">
                        {c.mode} · {c.price ? `৳${c.price.toLocaleString()}` : 'Free'}
                      </span>
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setShowCourseList(false)}
                    className="w-full py-1 text-center text-[10px] text-zinc-500 hover:text-zinc-300"
                  >
                    Close catalog list
                  </button>
                </div>
              )}
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">
                Pipeline Stage
              </label>
              <select
                value={formData.stage}
                onChange={(e) => handleChange('stage', e.target.value as any)}
                className="w-full h-8 px-2 rounded-lg bg-[#080a0c] border border-white/10 text-xs text-zinc-100 focus:border-emerald-500/50"
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
                Total / Value (৳)
              </label>
              <input
                type="number"
                value={formData.total || 0}
                onChange={(e) => handleChange('total', Number(e.target.value))}
                className="w-full h-8 px-2.5 rounded-lg bg-[#080a0c] border border-white/10 text-xs text-zinc-100 focus:border-emerald-500/50"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">
                Paid Amount (৳)
              </label>
              <input
                type="number"
                value={formData.paid || 0}
                onChange={(e) => handleChange('paid', Number(e.target.value))}
                className="w-full h-8 px-2.5 rounded-lg bg-[#080a0c] border border-white/10 text-xs text-zinc-100 focus:border-emerald-500/50"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">
                Due Amount (৳)
              </label>
              <input
                type="number"
                value={formData.due || 0}
                readOnly
                className="w-full h-8 px-2.5 rounded-lg bg-[#080a0c]/60 border border-white/5 text-xs text-amber-300"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">
                Next Follow-up
              </label>
              <input
                type="date"
                value={formData.nextFollowUp || ''}
                onChange={(e) => handleChange('nextFollowUp', e.target.value)}
                className="w-full h-8 px-2.5 rounded-lg bg-[#080a0c] border border-white/10 text-xs text-zinc-100 focus:border-emerald-500/50"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">
                Lead Source
              </label>
              <input
                type="text"
                value={formData.source || ''}
                onChange={(e) => handleChange('source', e.target.value)}
                placeholder="Facebook, WhatsApp, Front page, Referral…"
                className="w-full h-8 px-2.5 rounded-lg bg-[#080a0c] border border-white/10 text-xs text-zinc-100 focus:border-emerald-500/50"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">
                Occupation
              </label>
              <input
                type="text"
                value={formData.occupation || ''}
                onChange={(e) => handleChange('occupation', e.target.value)}
                className="w-full h-8 px-2.5 rounded-lg bg-[#080a0c] border border-white/10 text-xs text-zinc-100 focus:border-emerald-500/50"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">
                Company / Institution
              </label>
              <input
                type="text"
                value={formData.company || ''}
                onChange={(e) => handleChange('company', e.target.value)}
                className="w-full h-8 px-2.5 rounded-lg bg-[#080a0c] border border-white/10 text-xs text-zinc-100 focus:border-emerald-500/50"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">
                Location
              </label>
              <input
                type="text"
                value={formData.location || ''}
                onChange={(e) => handleChange('location', e.target.value)}
                className="w-full h-8 px-2.5 rounded-lg bg-[#080a0c] border border-white/10 text-xs text-zinc-100 focus:border-emerald-500/50"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">
                WhatsApp Number
              </label>
              <input
                type="text"
                value={formData.whatsapp || ''}
                onChange={(e) => handleChange('whatsapp', e.target.value)}
                className="w-full h-8 px-2.5 rounded-lg bg-[#080a0c] border border-white/10 text-xs text-zinc-100 focus:border-emerald-500/50"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">
                Assigned To
              </label>
              <input
                type="text"
                value={formData.assignedTo || ''}
                onChange={(e) => handleChange('assignedTo', e.target.value)}
                className="w-full h-8 px-2.5 rounded-lg bg-[#080a0c] border border-white/10 text-xs text-zinc-100 focus:border-emerald-500/50"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">
                Contact Date
              </label>
              <input
                type="date"
                value={formData.contactDate || ''}
                onChange={(e) => handleChange('contactDate', e.target.value)}
                className="w-full h-8 px-2.5 rounded-lg bg-[#080a0c] border border-white/10 text-xs text-zinc-100 focus:border-emerald-500/50"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">
              Sales Remark
            </label>
            <input
              type="text"
              value={formData.remark || ''}
              onChange={(e) => handleChange('remark', e.target.value)}
              placeholder="Will pay on 1st, interested in thesis program, etc."
              className="w-full h-8 px-2.5 rounded-lg bg-[#080a0c] border border-white/10 text-xs text-zinc-100 focus:border-emerald-500/50"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">
              Notes & Conversation History
            </label>
            <textarea
              value={formData.notes || ''}
              onChange={(e) => handleChange('notes', e.target.value)}
              rows={3}
              placeholder="Notes, key questions, background…"
              className="w-full p-2.5 rounded-lg bg-[#080a0c] border border-white/10 text-xs text-zinc-100 focus:border-emerald-500/50 resize-y"
            />
          </div>

          {/* Lead Activity Timeline */}
          {timelineEvents.length > 0 && (
            <div className="pt-2">
              <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-2 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>Lead Touchpoint Timeline</span>
              </label>
              <div className="space-y-1.5 max-h-36 overflow-y-auto p-2 rounded-xl bg-black/20 border border-white/5">
                {timelineEvents.map((evt, i) => (
                  <div key={i} className="text-[11px] text-zinc-300 flex items-start gap-2">
                    <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 flex-none">
                      {evt.type}
                    </span>
                    <span className="flex-1">{evt.text}</span>
                    <span className="text-[9px] text-zinc-500 flex-none">
                      {new Date(evt.at).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Footer Save Button */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="h-9 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="h-9 px-5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md shadow-emerald-500/20"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Lead</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
