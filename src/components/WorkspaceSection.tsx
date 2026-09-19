import React, { useState, useEffect, useMemo } from 'react';
import {
  ScanText,
  Clipboard,
  Eraser,
  Phone,
  PhoneCall,
  MessageCircle,
  UserRound,
  Mail,
  Send,
  Copy,
  Calendar,
  Clock,
  DollarSign,
  BookOpen,
  Users,
  CheckCircle2,
  ChevronDown,
  Sparkles,
  Save,
  X,
  ExternalLink,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { Lead, ExtractedContact, MentorMeeting, StageId } from '../types';
import { COURSES } from '../data/courses';
import { MENTORS } from '../data/mentors';
import { STAGES, stageLabel, todayIso } from '../utils/storage';
import { TeacherSearchSelect } from './common/TeacherSearchSelect';

export type WorkspaceViewMode = 'all' | 'raw' | 'details' | 'call' | 'followup' | 'payment';

interface WorkspaceSectionProps {
  text: string;
  onChangeText: (val: string) => void;
  extracted: ExtractedContact;
  onPaste: () => void;
  onClear: () => void;
  onCopyPhone: () => void;
  onCopyName: () => void;
  onCopyEmail: () => void;
  onCall: (phone?: string, name?: string) => void;
  onWhatsApp: (phone?: string) => void;
  onGmail: (email?: string, name?: string) => void;
  onCopyAll: () => void;

  // Integrated in-place operations
  activeLead: Lead | null;
  onClearActiveLead: () => void;
  onSaveLead: (lead: Lead) => void;
  onLogCall: (callData: { outcome: string; duration: number; notes: string; leadId: string }) => void;
  onScheduleMeeting: (meeting: Omit<MentorMeeting, 'id' | 'createdAt'>) => void;
  onRecordPayment: (payment: { amount: number; method: string; trxId?: string; note?: string; leadId: string }) => void;
  viewMode: WorkspaceViewMode;
  onViewModeChange: (mode: WorkspaceViewMode) => void;
}

export const WorkspaceSection: React.FC<WorkspaceSectionProps> = ({
  text,
  onChangeText,
  extracted,
  onPaste,
  onClear,
  onCopyPhone,
  onCopyName,
  onCopyEmail,
  onCall,
  onWhatsApp,
  onGmail,
  onCopyAll,
  activeLead,
  onClearActiveLead,
  onSaveLead,
  onLogCall,
  onScheduleMeeting,
  onRecordPayment,
  viewMode,
  onViewModeChange,
}) => {
  // Local editable draft state for the lead
  const [draftName, setDraftName] = useState('');
  const [draftPhone, setDraftPhone] = useState('');
  const [draftEmail, setDraftEmail] = useState('');
  const [draftStage, setDraftStage] = useState<StageId>('new');
  const [draftCourse, setDraftCourse] = useState('');
  const [draftCourseMode, setDraftCourseMode] = useState('Online');
  const [draftTotal, setDraftTotal] = useState<number>(0);
  const [draftPaid, setDraftPaid] = useState<number>(0);
  const [draftSource, setDraftSource] = useState('Workspace Extract');
  const [draftNotes, setDraftNotes] = useState('');
  const [draftNextFollowUp, setDraftNextFollowUp] = useState('');

  // Call Wrap-up state
  const [callOutcome, setCallOutcome] = useState('Connected / Interested');
  const [callDuration, setCallDuration] = useState('2m');
  const [callNotes, setCallNotes] = useState('');

  // Mentor Meeting state
  const [mentorName, setMentorName] = useState<string>(MENTORS[0]?.name || '');
  const [meetingDate, setMeetingDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    d.setMinutes(0);
    const offset = d.getTimezoneOffset() * 60000;
    return new Date(d.getTime() - offset).toISOString().slice(0, 16);
  });
  const [meetingMode, setMeetingMode] = useState('Online (Google Meet)');
  const [meetingTopic, setMeetingTopic] = useState('1-on-1 Mentorship & Course Guidance');
  const [meetingLink, setMeetingLink] = useState('https://meet.google.com/new');

  // Payment form state
  const [payAmount, setPayAmount] = useState<number>(0);
  const [payMethod, setPayMethod] = useState('bKash');
  const [payTrxId, setPayTrxId] = useState('');
  const [payNote, setPayNote] = useState('');

  // Course search filter in select
  const [courseSearch, setCourseSearch] = useState('');

  // Keep draft in sync with activeLead or extracted contact
  useEffect(() => {
    if (activeLead) {
      setDraftName(activeLead.name || '');
      setDraftPhone(activeLead.phone || '');
      setDraftEmail(activeLead.email || '');
      setDraftStage(activeLead.stage || 'new');
      setDraftCourse(activeLead.course || '');
      setDraftCourseMode(activeLead.courseMode || 'Online');
      setDraftTotal(Number(activeLead.total || activeLead.value || 0));
      setDraftPaid(Number(activeLead.paid || 0));
      setDraftSource(activeLead.source || 'CRM Record');
      setDraftNotes(activeLead.notes || activeLead.remark || '');
      setDraftNextFollowUp(activeLead.nextFollowUp || '');
      setMeetingTopic(`1-on-1 Session with ${activeLead.name || 'Lead'}`);
    } else {
      // Use extracted values if no active lead
      if (extracted.name) setDraftName(extracted.name);
      if (extracted.phone) setDraftPhone(extracted.phone);
      if (extracted.email) setDraftEmail(extracted.email);
      if (extracted.name) {
        setMeetingTopic(`1-on-1 Guidance with ${extracted.name}`);
      }
    }
  }, [activeLead, extracted.name, extracted.phone, extracted.email]);

  // Derived calculations
  const effectivePhone = draftPhone || extracted.phone;
  const effectiveName = draftName || extracted.name;
  const effectiveEmail = draftEmail || extracted.email;
  const hasPhone = Boolean(effectivePhone);
  const hasName = Boolean(effectiveName);
  const hasEmail = Boolean(effectiveEmail);
  const calculatedDue = Math.max(0, Number(draftTotal || 0) - Number(draftPaid || 0));

  // Determine if a lead is currently active / being edited
  const editingLeadName =
    activeLead?.name ||
    activeLead?.phone ||
    (text.trim() && effectiveName ? effectiveName : null);

  const handleRemoveEditing = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (onClearActiveLead) {
      onClearActiveLead();
    }
    if (onClear) {
      onClear();
    }
    setDraftName('');
    setDraftPhone('');
    setDraftEmail('');
    setDraftCourse('');
    setDraftNotes('');
    setDraftTotal(0);
    setDraftPaid(0);
  };

  // Filtered courses for selector
  const filteredCourses = useMemo(() => {
    if (!courseSearch) return COURSES;
    const q = courseSearch.toLowerCase();
    return COURSES.filter((c) => c.name.toLowerCase().includes(q));
  }, [courseSearch]);

  // Handle course assignment
  const handleSelectCourse = (courseName: string) => {
    setDraftCourse(courseName);
    const match = COURSES.find((c) => c.name === courseName);
    if (match) {
      if (match.mode) setDraftCourseMode(match.mode);
      if (match.price) {
        setDraftTotal(match.price);
      }
    }
  };

  // Construct complete Lead payload
  const buildCurrentLead = (): Lead => {
    const id = activeLead?.id || `lead-${Date.now()}`;
    return {
      id,
      name: draftName || extracted.name || 'New Lead',
      phone: draftPhone || extracted.phone || '',
      email: draftEmail || extracted.email || '',
      course: draftCourse || undefined,
      courseMode: draftCourseMode || 'Online',
      stage: draftStage,
      total: Number(draftTotal || 0),
      paid: Number(draftPaid || 0),
      due: calculatedDue,
      value: Number(draftTotal || 0),
      source: draftSource || 'Lead Workspace',
      notes: draftNotes || undefined,
      nextFollowUp: draftNextFollowUp || undefined,
      sourceText: text || activeLead?.sourceText || undefined,
      createdAt: activeLead?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  };

  // Save Lead action
  const handleSaveCurrentLead = () => {
    const lead = buildCurrentLead();
    onSaveLead(lead);
  };

  // Call & Log action
  const handleExecuteCall = () => {
    const phone = effectivePhone;
    if (!phone) return;
    onCall(phone, effectiveName);
    onViewModeChange('call');
  };

  const handleSaveCallRecord = () => {
    const lead = buildCurrentLead();
    onSaveLead(lead);
    const durationSeconds =
      callDuration === '30s'
        ? 30
        : callDuration === '1m'
        ? 60
        : callDuration === '2m'
        ? 120
        : callDuration === '3m'
        ? 180
        : callDuration === '5m'
        ? 300
        : 600;

    onLogCall({
      leadId: lead.id,
      outcome: callOutcome,
      duration: durationSeconds,
      notes: callNotes || `Call logged via workspace with outcome: ${callOutcome}`,
    });
    setCallNotes('');
  };

  // Book Meeting action
  const handleBookMeeting = () => {
    const lead = buildCurrentLead();
    onSaveLead(lead);
    onScheduleMeeting({
      mentor: mentorName,
      leadId: lead.id,
      leadName: lead.name,
      leadPhone: lead.phone,
      dateTime: meetingDate,
      duration: '30 minutes',
      mode: meetingMode,
      status: 'Planned',
      topic: meetingTopic || `1-on-1 with ${mentorName}`,
      location: meetingLink || 'Google Meet',
      note: `Booked directly in Lead Workspace`,
    });
  };

  // Record Payment action
  const handleRecordPayment = () => {
    const lead = buildCurrentLead();
    const amount = Number(payAmount) || calculatedDue;
    if (amount <= 0) return;

    // Update draft paid and due
    const nextPaid = Number(draftPaid || 0) + amount;
    const nextDue = Math.max(0, Number(draftTotal || 0) - nextPaid);
    setDraftPaid(nextPaid);

    const updatedLead: Lead = {
      ...lead,
      paid: nextPaid,
      due: nextDue,
      stage: nextDue === 0 ? 'paid' : 'due',
    };
    onSaveLead(updatedLead);

    onRecordPayment({
      leadId: lead.id,
      amount,
      method: payMethod,
      trxId: payTrxId,
      note: payNote,
    });
    setPayAmount(0);
    setPayTrxId('');
    setPayNote('');
  };

  return (
    <div className="space-y-3 mb-5">
      {/* Top Workspace Card with Integrated Tabs */}
      <div className="rounded-2xl border border-white/10 bg-[#090b0a] shadow-2xl overflow-hidden transition-all">
        {/* Workspace Toolbar Header */}
        <div className="px-3 sm:px-4 py-3 bg-[#0d100e] border-b border-white/10 flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-2 text-xs font-bold text-zinc-100 tracking-wide uppercase">
              <ScanText className="w-4 h-4 text-emerald-400" />
              <span>Lead Workspace</span>
            </div>

            {editingLeadName ? (
              <button
                type="button"
                onClick={handleRemoveEditing}
                title="Click to remove editing"
                className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/15 hover:bg-rose-500/15 text-emerald-300 hover:text-rose-300 border border-emerald-500/30 hover:border-rose-500/30 transition-all cursor-pointer group shadow-sm active:scale-95"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 group-hover:bg-rose-400 animate-pulse shrink-0" />
                <span>Editing: {editingLeadName}</span>
                <X className="w-3 h-3 ml-0.5 text-emerald-400/80 group-hover:text-rose-300 transition-colors shrink-0" />
              </button>
            ) : (
              <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-wider">
                Auto Extract Active
              </span>
            )}
          </div>

          {/* View Switcher Pills */}
          <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/5 overflow-x-auto max-w-full">
            <button
              type="button"
              onClick={() => onViewModeChange('all')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                viewMode === 'all'
                  ? 'bg-emerald-500 text-black shadow-md shadow-emerald-500/20'
                  : 'text-zinc-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Sparkles className="w-3 h-3" />
              <span>All View</span>
            </button>

            <button
              type="button"
              onClick={() => onViewModeChange('raw')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                viewMode === 'raw'
                  ? 'bg-zinc-200 text-black shadow-sm font-bold'
                  : 'text-zinc-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Clipboard className="w-3 h-3" />
              <span>Raw Text</span>
            </button>

            <button
              type="button"
              onClick={() => onViewModeChange('details')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                viewMode === 'details'
                  ? 'bg-zinc-200 text-black shadow-sm font-bold'
                  : 'text-zinc-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <UserRound className="w-3 h-3" />
              <span>Lead Details</span>
            </button>

            <button
              type="button"
              onClick={() => onViewModeChange('call')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                viewMode === 'call'
                  ? 'bg-emerald-500 text-black shadow-md font-bold'
                  : 'text-zinc-400 hover:text-emerald-400 hover:bg-white/5'
              }`}
            >
              <PhoneCall className="w-3 h-3" />
              <span>Call Log</span>
            </button>

            <button
              type="button"
              onClick={() => onViewModeChange('followup')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                viewMode === 'followup'
                  ? 'bg-zinc-200 text-black shadow-sm font-bold'
                  : 'text-zinc-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Calendar className="w-3 h-3" />
              <span>Meeting & Follow-up</span>
            </button>

            <button
              type="button"
              onClick={() => onViewModeChange('payment')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                viewMode === 'payment'
                  ? 'bg-zinc-200 text-black shadow-sm font-bold'
                  : 'text-zinc-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <DollarSign className="w-3 h-3" />
              <span>Payment</span>
            </button>
          </div>

          {/* Header Quick Buttons */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={onPaste}
              className="h-8 px-2.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-white/10 text-[11px] font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
              title="Paste from clipboard"
            >
              <Clipboard className="w-3.5 h-3.5 text-emerald-400" />
              <span>Paste</span>
            </button>

            <button
              type="button"
              onClick={onClear}
              className="h-8 px-2.5 rounded-lg bg-zinc-900 hover:bg-rose-950/40 text-zinc-400 hover:text-rose-300 border border-white/10 hover:border-rose-500/30 text-[11px] font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
              title="Clear workspace"
            >
              <Eraser className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>

            <button
              type="button"
              onClick={handleSaveCurrentLead}
              className="h-8 px-3 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-500/20 cursor-pointer transition-all"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Lead</span>
            </button>
          </div>
        </div>

        {/* SECTION 1: Raw Text & Detected Contact Cards (Visible in 'all' and 'raw' modes) */}
        {(viewMode === 'all' || viewMode === 'raw') && (
          <div className="p-3 sm:p-4 border-b border-white/10 bg-[#070908]">
            {/* Lead Raw Input Textarea */}
            <div className="relative mb-3">
              <textarea
                value={text}
                onChange={(e) => onChangeText(e.target.value)}
                placeholder="Paste lead message, WhatsApp conversation, phone number, email, or student notes here… Phone, name and email are automatically extracted."
                spellCheck={false}
                className="w-full h-24 sm:h-28 p-3 rounded-xl bg-[#0d100e] text-zinc-100 placeholder:text-zinc-600 border border-white/10 focus:border-emerald-500/40 outline-none resize-none font-medium text-xs sm:text-sm leading-relaxed transition-all"
              />
            </div>

            {/* 3 Extracted Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 mb-2">
              {/* Phone Card */}
              <div className="p-3 rounded-xl border border-emerald-500/25 bg-gradient-to-br from-[#0e1612] to-[#090b0a] shadow-lg hover:border-emerald-500/40 transition-all">
                <div className="flex items-center justify-between text-[9px] font-extrabold uppercase tracking-widest text-emerald-400/90 mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-md bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                      <Phone className="w-2.5 h-2.5" />
                    </span>
                    <span>Phone Number</span>
                  </div>
                  {effectivePhone && (
                    <span className="text-[9px] font-semibold text-emerald-400/60">DETECTED</span>
                  )}
                </div>

                <div
                  className={`min-h-[34px] flex items-center text-lg sm:text-xl font-bold tracking-tight break-all ${
                    hasPhone
                      ? 'bg-gradient-to-r from-white via-emerald-200 to-emerald-400 bg-clip-text text-transparent'
                      : 'text-zinc-600 text-sm font-normal'
                  }`}
                >
                  {effectivePhone || '—'}
                </div>

                <div className="flex flex-wrap gap-1.5 mt-2">
                  <button
                    type="button"
                    disabled={!hasPhone}
                    onClick={onCopyPhone}
                    className="h-7 px-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 disabled:opacity-30 disabled:pointer-events-none text-zinc-300 hover:text-white border border-white/10 text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Copy className="w-3 h-3" />
                    <span>Copy</span>
                  </button>

                  <button
                    type="button"
                    disabled={!hasPhone}
                    onClick={handleExecuteCall}
                    className="h-7 px-2.5 rounded-lg bg-gradient-to-b from-emerald-400 to-emerald-600 hover:brightness-110 disabled:opacity-30 disabled:pointer-events-none text-black font-extrabold text-[10px] flex items-center gap-1 cursor-pointer shadow-sm shadow-emerald-500/20 transition-all"
                  >
                    <PhoneCall className="w-3 h-3 stroke-[2.5]" />
                    <span>Call</span>
                  </button>

                  <button
                    type="button"
                    disabled={!hasPhone}
                    onClick={() => onWhatsApp(effectivePhone)}
                    className="h-7 px-2 rounded-lg bg-emerald-950/40 hover:bg-emerald-900/50 disabled:opacity-30 disabled:pointer-events-none text-emerald-300 border border-emerald-500/20 text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <MessageCircle className="w-3 h-3" />
                    <span>WhatsApp</span>
                  </button>
                </div>
              </div>

              {/* Full Name Card */}
              <div className="p-3 rounded-xl border border-white/10 bg-[#0a0c0b] shadow-lg hover:border-white/20 transition-all">
                <div className="flex items-center justify-between text-[9px] font-extrabold uppercase tracking-widest text-zinc-400 mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-md bg-white/5 border border-white/10 flex items-center justify-center text-zinc-300">
                      <UserRound className="w-2.5 h-2.5" />
                    </span>
                    <span>Full Name</span>
                  </div>
                  {effectiveName && (
                    <span className="text-[9px] font-semibold text-zinc-500">DETECTED</span>
                  )}
                </div>

                <div
                  className={`min-h-[34px] flex items-center text-base sm:text-lg font-semibold break-words ${
                    hasName ? 'text-zinc-100' : 'text-zinc-600 text-sm font-normal'
                  }`}
                >
                  {effectiveName || '—'}
                </div>

                <div className="flex gap-1.5 mt-2">
                  <button
                    type="button"
                    disabled={!hasName}
                    onClick={onCopyName}
                    className="h-7 px-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 disabled:opacity-30 disabled:pointer-events-none text-zinc-300 hover:text-white border border-white/10 text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Copy className="w-3 h-3" />
                    <span>Copy</span>
                  </button>
                </div>
              </div>

              {/* Email Card */}
              <div className="p-3 rounded-xl border border-white/10 bg-[#0a0c0b] shadow-lg hover:border-white/20 transition-all">
                <div className="flex items-center justify-between text-[9px] font-extrabold uppercase tracking-widest text-zinc-400 mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-md bg-white/5 border border-white/10 flex items-center justify-center text-zinc-300">
                      <Mail className="w-2.5 h-2.5" />
                    </span>
                    <span>Email Address</span>
                  </div>
                  {effectiveEmail && (
                    <span className="text-[9px] font-semibold text-zinc-500">DETECTED</span>
                  )}
                </div>

                <div
                  className={`min-h-[34px] flex items-center text-xs sm:text-sm font-semibold break-all ${
                    hasEmail ? 'text-zinc-100' : 'text-zinc-600 text-sm font-normal'
                  }`}
                >
                  {effectiveEmail || '—'}
                </div>

                <div className="flex flex-wrap gap-1.5 mt-2">
                  <button
                    type="button"
                    disabled={!hasEmail}
                    onClick={onCopyEmail}
                    className="h-7 px-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 disabled:opacity-30 disabled:pointer-events-none text-zinc-300 hover:text-white border border-white/10 text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Copy className="w-3 h-3" />
                    <span>Copy</span>
                  </button>

                  <button
                    type="button"
                    disabled={!hasEmail}
                    onClick={() => onGmail(effectiveEmail, effectiveName)}
                    className="h-7 px-2 rounded-lg bg-rose-950/30 hover:bg-rose-900/40 disabled:opacity-30 disabled:pointer-events-none text-rose-300 border border-rose-500/20 text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Send className="w-3 h-3" />
                    <span>Gmail</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Copy Bundle full-width button */}
            <div className="pt-1">
              <button
                type="button"
                onClick={onCopyAll}
                className="w-full h-8 rounded-lg bg-[#0e1210] hover:bg-[#151c17] border border-white/10 hover:border-emerald-500/30 text-zinc-300 hover:text-emerald-300 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all shadow-sm"
              >
                <Copy className="w-3 h-3 text-emerald-400" />
                <span>Copy contact bundle (TAB-separated for Google Sheets / Excel)</span>
              </button>
            </div>
          </div>
        )}

        {/* SECTION 2: Integrated All-in-One Operations Panels ("In Here With All View") */}
        <div className="p-3 sm:p-5 space-y-4 bg-[#0a0d0b]">
          {/* Section A: Contact Details, Course & Financials */}
          {(viewMode === 'all' || viewMode === 'details') && (
            <div className="p-4 rounded-xl border border-white/10 bg-[#0d100e]">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400">
                  <UserRound className="w-4 h-4" />
                  <span>1. Lead Identification & Commercials</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-zinc-400">Due Balance:</span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-black ${
                      calculatedDue === 0 && Number(draftPaid) > 0
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    }`}
                  >
                    ৳{calculatedDue.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* Full Name */}
                <div>
                  <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">
                    Student / Lead Name
                  </label>
                  <input
                    type="text"
                    value={draftName}
                    onChange={(e) => setDraftName(e.target.value)}
                    placeholder="Enter student name"
                    className="w-full h-9 px-3 rounded-lg bg-black/40 border border-white/10 focus:border-emerald-500/50 text-zinc-100 text-xs outline-none"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={draftPhone}
                    onChange={(e) => setDraftPhone(e.target.value)}
                    placeholder="+88017..."
                    className="w-full h-9 px-3 rounded-lg bg-black/40 border border-white/10 focus:border-emerald-500/50 text-zinc-100 text-xs font-mono outline-none"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={draftEmail}
                    onChange={(e) => setDraftEmail(e.target.value)}
                    placeholder="student@example.com"
                    className="w-full h-9 px-3 rounded-lg bg-black/40 border border-white/10 focus:border-emerald-500/50 text-zinc-100 text-xs outline-none"
                  />
                </div>

                {/* Course Selection */}
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1 flex items-center justify-between">
                    <span>Enrolled / Target Course (34 Available)</span>
                    {draftCourse && (
                      <span className="text-emerald-400 font-bold">{draftCourseMode}</span>
                    )}
                  </label>
                  <select
                    value={draftCourse}
                    onChange={(e) => handleSelectCourse(e.target.value)}
                    className="w-full h-9 px-3 rounded-lg bg-black/40 border border-white/10 focus:border-emerald-500/50 text-zinc-100 text-xs outline-none cursor-pointer"
                  >
                    <option value="">Select a Course…</option>
                    {filteredCourses.map((c, idx) => (
                      <option key={`${c.name}-${idx}`} value={c.name}>
                        {c.name} {c.price ? `— ৳${c.price.toLocaleString()}` : ''} ({c.mode})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Stage */}
                <div>
                  <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">
                    Pipeline Stage
                  </label>
                  <select
                    value={draftStage}
                    onChange={(e) => setDraftStage(e.target.value as StageId)}
                    className="w-full h-9 px-3 rounded-lg bg-black/40 border border-white/10 focus:border-emerald-500/50 text-zinc-100 text-xs outline-none cursor-pointer"
                  >
                    {STAGES.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Commercials: Total, Paid, Due */}
                <div>
                  <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">
                    Total Course Fee (৳)
                  </label>
                  <input
                    type="number"
                    value={draftTotal || ''}
                    onChange={(e) => setDraftTotal(Number(e.target.value))}
                    placeholder="0"
                    className="w-full h-9 px-3 rounded-lg bg-black/40 border border-white/10 focus:border-emerald-500/50 text-zinc-100 text-xs font-mono outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">
                    Paid Amount (৳)
                  </label>
                  <input
                    type="number"
                    value={draftPaid || ''}
                    onChange={(e) => setDraftPaid(Number(e.target.value))}
                    placeholder="0"
                    className="w-full h-9 px-3 rounded-lg bg-black/40 border border-white/10 focus:border-emerald-500/50 text-emerald-400 text-xs font-mono font-bold outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">
                    Due Balance (Auto)
                  </label>
                  <div className="h-9 px-3 rounded-lg bg-black/60 border border-white/5 flex items-center justify-between text-xs font-mono">
                    <span className="text-zinc-400">Remaining:</span>
                    <span
                      className={`font-bold ${
                        calculatedDue === 0 ? 'text-emerald-400' : 'text-amber-400'
                      }`}
                    >
                      ৳{calculatedDue.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Notes & Source */}
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">
                    Internal Notes / Remarks
                  </label>
                  <input
                    type="text"
                    value={draftNotes}
                    onChange={(e) => setDraftNotes(e.target.value)}
                    placeholder="Lead notes, background, discussion topics…"
                    className="w-full h-9 px-3 rounded-lg bg-black/40 border border-white/10 focus:border-emerald-500/50 text-zinc-100 text-xs outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">
                    Lead Source
                  </label>
                  <input
                    type="text"
                    value={draftSource}
                    onChange={(e) => setDraftSource(e.target.value)}
                    placeholder="Facebook / Referral / Direct"
                    className="w-full h-9 px-3 rounded-lg bg-black/40 border border-white/10 focus:border-emerald-500/50 text-zinc-100 text-xs outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Section B: Call Wrap-Up & Dialer (Visible in 'all' and 'call' modes) */}
          {(viewMode === 'all' || viewMode === 'call') && (
            <div className="p-4 rounded-xl border border-white/10 bg-[#0d100e]">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400">
                  <PhoneCall className="w-4 h-4" />
                  <span>2. Call Wrap-Up & Call Logging</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    disabled={!hasPhone}
                    onClick={handleExecuteCall}
                    className="h-7 px-3 rounded-lg bg-emerald-500 hover:bg-emerald-400 disabled:opacity-30 disabled:pointer-events-none text-black font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm shadow-emerald-500/20"
                  >
                    <PhoneCall className="w-3 h-3" />
                    <span>Dial {effectivePhone || 'Lead'}</span>
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                {/* Outcome Pill Selectors */}
                <div>
                  <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1.5">
                    Call Outcome / Result
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      'Connected / Interested',
                      'Callback Requested',
                      'Meeting Scheduled',
                      'Will Pay Later',
                      'Busy / No Answer',
                      'Not Interested',
                      'Wrong Number',
                    ].map((outcome) => {
                      const isSelected = callOutcome === outcome;
                      return (
                        <button
                          key={outcome}
                          type="button"
                          onClick={() => setCallOutcome(outcome)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 font-bold'
                              : 'bg-black/30 text-zinc-400 border-white/5 hover:border-white/20 hover:text-zinc-200'
                          }`}
                        >
                          {outcome}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Duration & Call Notes */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">
                      Call Duration
                    </label>
                    <div className="flex gap-1">
                      {['30s', '1m', '2m', '5m', '10m'].map((dur) => (
                        <button
                          key={dur}
                          type="button"
                          onClick={() => setCallDuration(dur)}
                          className={`flex-1 h-8 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                            callDuration === dur
                              ? 'bg-zinc-200 text-black'
                              : 'bg-black/40 text-zinc-400 hover:text-white border border-white/10'
                          }`}
                        >
                          {dur}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">
                      Call Discussion Notes
                    </label>
                    <input
                      type="text"
                      value={callNotes}
                      onChange={(e) => setCallNotes(e.target.value)}
                      placeholder="Discussed syllabus, agreed to attend demo session, etc."
                      className="w-full h-8 px-3 rounded-lg bg-black/40 border border-white/10 focus:border-emerald-500/50 text-zinc-100 text-xs outline-none"
                    />
                  </div>

                  <div className="flex items-end">
                    <button
                      type="button"
                      onClick={handleSaveCallRecord}
                      className="w-full h-8 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-sm shadow-emerald-500/20 transition-all"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Log Call Record</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Section C: Follow-up & Mentor 1-on-1 Meeting (Visible in 'all' and 'followup' modes) */}
          {(viewMode === 'all' || viewMode === 'followup') && (
            <div className="p-4 rounded-xl border border-white/10 bg-[#0d100e]">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400">
                  <Calendar className="w-4 h-4" />
                  <span>3. Follow-up & Faculty Mentor 1-on-1 Session</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* Select Mentor / Teacher (Searchable) */}
                <TeacherSearchSelect
                  value={mentorName}
                  onChange={(name) => setMentorName(name)}
                  label="Teacher / Mentor Search"
                  required
                />

                {/* Meeting Date & Time */}
                <div>
                  <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">
                    Meeting Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    value={meetingDate}
                    onChange={(e) => setMeetingDate(e.target.value)}
                    className="w-full h-9 px-3 rounded-lg bg-black/40 border border-white/10 focus:border-emerald-500/50 text-zinc-100 text-xs outline-none"
                  />
                </div>

                {/* Meeting Mode */}
                <div>
                  <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">
                    Meeting Format
                  </label>
                  <select
                    value={meetingMode}
                    onChange={(e) => setMeetingMode(e.target.value)}
                    className="w-full h-9 px-3 rounded-lg bg-black/40 border border-white/10 focus:border-emerald-500/50 text-zinc-100 text-xs outline-none cursor-pointer"
                  >
                    <option value="Online (Google Meet)">Online (Google Meet)</option>
                    <option value="Online (Zoom)">Online (Zoom)</option>
                    <option value="Offline Campus">Offline Campus</option>
                    <option value="Phone Consultation">Phone Consultation</option>
                  </select>
                </div>

                {/* Topic / Purpose */}
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">
                    Session Agenda / Topic
                  </label>
                  <input
                    type="text"
                    value={meetingTopic}
                    onChange={(e) => setMeetingTopic(e.target.value)}
                    placeholder="1-on-1 Guidance on Career & Course Structure"
                    className="w-full h-9 px-3 rounded-lg bg-black/40 border border-white/10 focus:border-emerald-500/50 text-zinc-100 text-xs outline-none"
                  />
                </div>

                {/* Action button */}
                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={handleBookMeeting}
                    className="w-full h-9 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-emerald-500/20 transition-all"
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>Schedule Mentor Meeting</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Section D: Payment Recording (Visible in 'all' and 'payment' modes) */}
          {(viewMode === 'all' || viewMode === 'payment') && (
            <div className="p-4 rounded-xl border border-white/10 bg-[#0d100e]">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400">
                  <DollarSign className="w-4 h-4" />
                  <span>4. Record Payment & Settle Balance</span>
                </div>
                <div className="text-xs text-zinc-400">
                  <span>Current Due: </span>
                  <span className="text-amber-400 font-bold font-mono">
                    ৳{calculatedDue.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                {/* Amount */}
                <div>
                  <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1 flex items-center justify-between">
                    <span>Amount (৳)</span>
                    {calculatedDue > 0 && (
                      <button
                        type="button"
                        onClick={() => setPayAmount(calculatedDue)}
                        className="text-[10px] font-bold text-emerald-400 hover:underline cursor-pointer"
                      >
                        Full Due (৳{calculatedDue})
                      </button>
                    )}
                  </label>
                  <input
                    type="number"
                    value={payAmount || ''}
                    onChange={(e) => setPayAmount(Number(e.target.value))}
                    placeholder={calculatedDue ? String(calculatedDue) : '500'}
                    className="w-full h-9 px-3 rounded-lg bg-black/40 border border-white/10 focus:border-emerald-500/50 text-emerald-400 text-xs font-mono font-bold outline-none"
                  />
                </div>

                {/* Method */}
                <div>
                  <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">
                    Payment Method
                  </label>
                  <select
                    value={payMethod}
                    onChange={(e) => setPayMethod(e.target.value)}
                    className="w-full h-9 px-3 rounded-lg bg-black/40 border border-white/10 focus:border-emerald-500/50 text-zinc-100 text-xs outline-none cursor-pointer"
                  >
                    <option value="bKash">bKash (Merchant / Personal)</option>
                    <option value="Nagad">Nagad</option>
                    <option value="Rocket">Rocket</option>
                    <option value="Bank Transfer">Bank Transfer / Card</option>
                    <option value="Cash">Cash Deposit</option>
                  </select>
                </div>

                {/* TrxID */}
                <div>
                  <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">
                    TrxID / Reference
                  </label>
                  <input
                    type="text"
                    value={payTrxId}
                    onChange={(e) => setPayTrxId(e.target.value)}
                    placeholder="e.g. BL92XK01"
                    className="w-full h-9 px-3 rounded-lg bg-black/40 border border-white/10 focus:border-emerald-500/50 text-zinc-100 text-xs font-mono outline-none"
                  />
                </div>

                {/* Record Button */}
                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={handleRecordPayment}
                    className="w-full h-9 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-emerald-500/20 transition-all"
                  >
                    <DollarSign className="w-3.5 h-3.5" />
                    <span>Record Payment</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Master Bottom Action Bar */}
          <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-white/10">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSaveCurrentLead}
                className="h-9 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/25 cursor-pointer transition-all"
              >
                <Save className="w-4 h-4" />
                <span>Save Lead to CRM</span>
              </button>

              <button
                type="button"
                disabled={!hasPhone}
                onClick={handleExecuteCall}
                className="h-9 px-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 disabled:opacity-30 disabled:pointer-events-none text-zinc-200 hover:text-white border border-white/10 font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <PhoneCall className="w-3.5 h-3.5 text-emerald-400" />
                <span>Call Now</span>
              </button>

              <button
                type="button"
                disabled={!hasPhone}
                onClick={() => onWhatsApp(effectivePhone)}
                className="h-9 px-3 rounded-xl bg-zinc-900 hover:bg-emerald-950/40 disabled:opacity-30 disabled:pointer-events-none text-emerald-300 border border-emerald-500/20 font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>WhatsApp</span>
              </button>

              <button
                type="button"
                disabled={!hasEmail}
                onClick={() => onGmail(effectiveEmail, effectiveName)}
                className="h-9 px-3 rounded-xl bg-zinc-900 hover:bg-rose-950/30 disabled:opacity-30 disabled:pointer-events-none text-rose-300 border border-rose-500/20 font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Gmail</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClearActiveLead}
                className="h-9 px-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-white/10 font-semibold text-xs flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <X className="w-3.5 h-3.5" />
                <span>Clear / New Lead</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
