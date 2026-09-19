import React, { useState } from 'react';
import {
  Calendar,
  Plus,
  Video,
  MapPin,
  Clock,
  User,
  PhoneCall,
  Search,
  CheckCircle2,
  AlertCircle,
  Trash2,
  ExternalLink,
  ChevronDown,
} from 'lucide-react';
import { MENTORS } from '../../data/mentors';
import { Mentor, MentorMeeting, Lead } from '../../types';

interface MentorsTabProps {
  meetings: MentorMeeting[];
  leads: Lead[];
  initialLeadId?: string;
  onScheduleMeeting: (meeting: Omit<MentorMeeting, 'id' | 'createdAt'>) => void;
  onUpdateMeetingStatus?: (id: string, status: string) => void;
  onDeleteMeeting?: (id: string) => void;
  onOpenLead?: (lead: Lead) => void;
  onCallLead?: (lead: Lead) => void;
}

export const MentorsTab: React.FC<MentorsTabProps> = ({
  meetings,
  leads,
  initialLeadId,
  onScheduleMeeting,
  onUpdateMeetingStatus,
  onDeleteMeeting,
  onOpenLead,
  onCallLead,
}) => {
  // Modal state
  const [isSchedulerOpen, setIsSchedulerOpen] = useState(Boolean(initialLeadId));
  const [selectedMentorName, setSelectedMentorName] = useState<string>(MENTORS[0]?.name || '');
  const [selectedLeadId, setSelectedLeadId] = useState<string>(initialLeadId || '');
  const [meetingDate, setMeetingDate] = useState(() => {
    const now = new Date();
    now.setDate(now.getDate() + 1);
    now.setMinutes(0);
    const tzOffset = now.getTimezoneOffset() * 60000;
    return new Date(now.getTime() - tzOffset).toISOString().slice(0, 16);
  });
  const [duration, setDuration] = useState('30 minutes');
  const [mode, setMode] = useState('Online');
  const [status, setStatus] = useState('Planned');
  const [topic, setTopic] = useState(() => {
    if (initialLeadId) {
      const lead = leads.find((l) => l.id === initialLeadId);
      return lead ? `1-on-1 Guidance with ${lead.name || 'Lead'}` : '1-on-1 Mentorship Session';
    }
    return '1-on-1 Mentorship Session';
  });
  const [location, setLocation] = useState('Google Meet');
  const [note, setNote] = useState('');

  // Filtering state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMentor, setFilterMentor] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // Helper to open scheduler for a specific mentor or from top button
  const openNewMeetingModal = (preselectedMentor?: Mentor) => {
    const mentorToUse = preselectedMentor ? preselectedMentor.name : (selectedMentorName || MENTORS[0]?.name || '');
    setSelectedMentorName(mentorToUse);
    setTopic(`1-on-1 Mentorship Session with ${mentorToUse}`);
    setLocation('Google Meet');

    // Default to upcoming hour tomorrow
    const now = new Date();
    now.setDate(now.getDate() + 1);
    now.setMinutes(0);
    const tzOffset = now.getTimezoneOffset() * 60000;
    const localISOTime = new Date(now.getTime() - tzOffset).toISOString().slice(0, 16);
    setMeetingDate(localISOTime);

    setIsSchedulerOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMentorName || !meetingDate) return;

    const matchedLead = leads.find((l) => l.id === selectedLeadId);

    onScheduleMeeting({
      mentor: selectedMentorName,
      leadId: matchedLead ? matchedLead.id : undefined,
      leadName: matchedLead ? matchedLead.name : undefined,
      leadPhone: matchedLead ? matchedLead.phone : undefined,
      dateTime: meetingDate,
      duration,
      mode,
      status,
      topic: topic.trim() || `Mentorship with ${selectedMentorName}`,
      location: location.trim(),
      note: note.trim(),
    });

    setIsSchedulerOpen(false);
  };

  // Filter meetings
  const filteredMeetings = meetings
    .filter((m) => {
      const q = searchQuery.toLowerCase();
      const matchesQuery =
        !q ||
        m.mentor.toLowerCase().includes(q) ||
        (m.leadName && m.leadName.toLowerCase().includes(q)) ||
        (m.leadPhone && m.leadPhone.includes(q)) ||
        m.topic.toLowerCase().includes(q);

      const matchesMentor = !filterMentor || m.mentor === filterMentor;
      const matchesStatus = !filterStatus || m.status === filterStatus;

      return matchesQuery && matchesMentor && matchesStatus;
    })
    .sort((a, b) => a.dateTime.localeCompare(b.dateTime));

  return (
    <div className="space-y-5">
      {/* Header with Title & Add Meeting button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-2 border-b border-white/10">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-zinc-100 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-emerald-400" />
            <span>Mentors & 1-on-1 Lead Meetings</span>
          </h2>
          <p className="text-xs text-zinc-400">
            Schedule and coordinate 1-on-1 mentorship sessions pairing students & leads with industry experts.
          </p>
        </div>

        <button
          type="button"
          onClick={() => openNewMeetingModal()}
          className="h-9 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold flex items-center gap-2 cursor-pointer shadow-lg shadow-emerald-500/20 transition-all"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Add Meeting (Lead + Mentor)</span>
        </button>
      </div>

      {/* Scheduled Meetings Section */}
      <div className="p-4 sm:p-5 rounded-2xl border border-white/10 bg-[#0e1114] space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-200">
              Scheduled Sessions
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950/40 text-emerald-400 border border-emerald-500/20">
              {filteredMeetings.length} of {meetings.length}
            </span>
          </div>

          {/* Filter Bar */}
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-48">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search lead, mentor, topic…"
                className="w-full h-8 pl-8 pr-2 rounded-lg bg-zinc-900 border border-white/10 text-xs text-zinc-200 outline-none focus:border-emerald-500/40"
              />
            </div>

            <select
              value={filterMentor}
              onChange={(e) => setFilterMentor(e.target.value)}
              className="h-8 px-2 rounded-lg bg-zinc-900 border border-white/10 text-xs text-zinc-200 outline-none"
            >
              <option value="">All Mentors</option>
              {MENTORS.map((m) => (
                <option key={m.name} value={m.name}>
                  {m.name}
                </option>
              ))}
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="h-8 px-2 rounded-lg bg-zinc-900 border border-white/10 text-xs text-zinc-200 outline-none"
            >
              <option value="">All Statuses</option>
              <option value="Planned">Planned</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Meeting Cards List */}
        <div className="space-y-2.5">
          {filteredMeetings.length === 0 ? (
            <div className="py-8 px-4 rounded-xl border border-dashed border-white/10 text-center bg-black/20">
              <Calendar className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
              <p className="text-xs font-semibold text-zinc-400">
                No meetings found matching your filter.
              </p>
              <p className="text-[11px] text-zinc-500 mt-1">
                Click "+ Add Meeting" above to pair a student or lead with an industry mentor.
              </p>
            </div>
          ) : (
            filteredMeetings.map((m) => {
              const d = new Date(m.dateTime);
              const isValidDate = !isNaN(d.getTime());
              const formattedDate = isValidDate
                ? d.toLocaleDateString(undefined, {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })
                : m.dateTime;
              const formattedTime = isValidDate
                ? d.toLocaleTimeString(undefined, {
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                : '';

              const mentorData = MENTORS.find((item) => item.name === m.mentor);
              const linkedLead = leads.find((l) => l.id === m.leadId);

              return (
                <div
                  key={m.id}
                  className="p-3.5 rounded-xl border border-white/10 bg-[#121519] hover:border-white/20 transition-all flex flex-col md:flex-row md:items-center justify-between gap-3.5"
                >
                  {/* Left: Date & Participants */}
                  <div className="space-y-2 flex-1 min-w-0">
                    {/* Time & status badge */}
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>
                          {formattedDate} {formattedTime && `• ${formattedTime}`}
                        </span>
                      </span>

                      <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-zinc-800 text-zinc-300">
                        {m.duration}
                      </span>

                      <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-zinc-800 text-zinc-300">
                        {m.mode}
                      </span>

                      {/* Status Dropdown / Badge */}
                      <div className="relative inline-flex items-center">
                        <select
                          value={m.status}
                          onChange={(e) =>
                            onUpdateMeetingStatus?.(m.id, e.target.value)
                          }
                          className={`h-6 px-2 pr-6 rounded-md text-[10px] font-bold uppercase tracking-wider appearance-none cursor-pointer border ${
                            m.status === 'Confirmed'
                              ? 'bg-emerald-950/40 text-emerald-300 border-emerald-500/30'
                              : m.status === 'Completed'
                              ? 'bg-blue-950/40 text-blue-300 border-blue-500/30'
                              : m.status === 'Cancelled'
                              ? 'bg-rose-950/40 text-rose-300 border-rose-500/30'
                              : 'bg-amber-950/40 text-amber-300 border-amber-500/30'
                          }`}
                        >
                          <option value="Planned">Planned</option>
                          <option value="Confirmed">Confirmed</option>
                          <option value="Completed">Completed</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                        <ChevronDown className="w-3 h-3 absolute right-1.5 pointer-events-none opacity-60" />
                      </div>
                    </div>

                    {/* Topic */}
                    <div className="text-sm font-bold text-zinc-100 flex items-center gap-2">
                      <span>{m.topic}</span>
                    </div>

                    {/* Mentors and Lead Details */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
                      {/* Mentor block */}
                      <div className="flex items-center gap-2 p-2 rounded-lg bg-black/30 border border-white/5">
                        <div className="w-7 h-7 rounded-lg bg-zinc-800 border border-white/10 overflow-hidden flex items-center justify-center flex-none">
                          {mentorData?.photo ? (
                            <img
                              src={mentorData.photo}
                              alt={m.mentor}
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-xs font-bold text-zinc-300">
                              {m.mentor.charAt(0)}
                            </span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="text-[10px] uppercase font-bold text-zinc-400">
                            Mentor
                          </div>
                          <div className="text-xs font-semibold text-zinc-200 truncate">
                            {m.mentor}
                          </div>
                        </div>
                      </div>

                      {/* Lead block */}
                      <div className="flex items-center justify-between p-2 rounded-lg bg-black/30 border border-white/5">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center flex-none">
                            <User className="w-3.5 h-3.5" />
                          </div>
                          <div className="min-w-0">
                            <div className="text-[10px] uppercase font-bold text-zinc-400">
                              Student / Lead
                            </div>
                            <div className="text-xs font-semibold text-zinc-200 truncate">
                              {m.leadName || (linkedLead ? linkedLead.name : 'General / Unlinked')}
                            </div>
                          </div>
                        </div>

                        {/* Quick lead actions */}
                        <div className="flex items-center gap-1 flex-none ml-2">
                          {(m.leadPhone || linkedLead?.phone) && onCallLead && (
                            <button
                              type="button"
                              onClick={() => {
                                const phone = m.leadPhone || linkedLead?.phone;
                                if (phone) {
                                  onCallLead(
                                    linkedLead || {
                                      id: m.leadId || '',
                                      name: m.leadName || '',
                                      phone,
                                      email: '',
                                      stage: 'interested',
                                      total: 0,
                                      paid: 0,
                                      due: 0,
                                      createdAt: '',
                                    }
                                  );
                                }
                              }}
                              title="Call Lead"
                              className="p-1.5 rounded-md bg-zinc-800 hover:bg-emerald-500/20 text-zinc-300 hover:text-emerald-400 transition-colors"
                            >
                              <PhoneCall className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {linkedLead && onOpenLead && (
                            <button
                              type="button"
                              onClick={() => onOpenLead(linkedLead)}
                              title="Open Lead Card"
                              className="p-1.5 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Location and Notes */}
                    {(m.location || m.note) && (
                      <div className="text-[11px] text-zinc-400 flex flex-wrap items-center gap-x-4 gap-y-1 pt-0.5">
                        {m.location && (
                          <div className="flex items-center gap-1 text-zinc-300">
                            <MapPin className="w-3 h-3 text-emerald-400 flex-none" />
                            {m.location.startsWith('http') ? (
                              <a
                                href={m.location}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-emerald-400 underline hover:text-emerald-300 truncate max-w-xs"
                              >
                                {m.location}
                              </a>
                            ) : (
                              <span>{m.location}</span>
                            )}
                          </div>
                        )}
                        {m.note && (
                          <div className="text-zinc-400 italic">
                            Note: {m.note}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Right Actions */}
                  <div className="flex md:flex-col items-center md:items-end justify-end gap-1.5 pt-2 md:pt-0 border-t md:border-t-0 border-white/5">
                    {onDeleteMeeting && (
                      <button
                        type="button"
                        onClick={() => onDeleteMeeting(m.id)}
                        className="h-7 px-2.5 rounded-lg bg-zinc-900 hover:bg-rose-950/40 text-zinc-400 hover:text-rose-400 border border-white/5 hover:border-rose-500/30 text-[11px] font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Delete</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Mentor Directory Cards Grid */}
      <div>
        <div className="mb-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-200">
            Mentor Faculty ({MENTORS.length} Experts)
          </h3>
          <p className="text-xs text-zinc-400">
            Click "Set Meeting" on any mentor to schedule a 1-on-1 session for a student.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {MENTORS.map((mentor) => (
            <div
              key={mentor.name}
              className="p-3.5 rounded-xl border border-white/10 bg-[#0e1114] hover:border-white/20 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-3 mb-2.5">
                  <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-white/10 overflow-hidden flex items-center justify-center flex-none">
                    {mentor.photo ? (
                      <img
                        src={mentor.photo}
                        alt={mentor.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-base font-bold text-zinc-400">
                        {mentor.name.charAt(0)}
                      </span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-zinc-100 truncate">
                      {mentor.name}
                    </h4>
                    <div className="text-[10px] text-emerald-400 truncate font-semibold">
                      {mentor.affiliation}
                    </div>
                  </div>
                </div>

                <p className="text-[11px] text-zinc-400 line-clamp-3 mb-3 leading-relaxed">
                  {mentor.title}
                </p>
              </div>

              <button
                type="button"
                onClick={() => openNewMeetingModal(mentor)}
                className="w-full h-8 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Schedule with {mentor.name.split(' ')[0]}</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Schedule Meeting Modal (Select Both Lead & Mentor) */}
      {isSchedulerOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="w-full max-w-xl rounded-2xl bg-[#0d1013] border border-white/15 p-5 sm:p-6 shadow-2xl my-auto">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/10">
              <div>
                <h3 className="text-base font-bold text-zinc-100 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-emerald-400" />
                  <span>Schedule Mentorship Meeting</span>
                </h3>
                <p className="text-xs text-zinc-400">
                  Select both the Lead / Student and Mentor to arrange 1-on-1 guidance.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsSchedulerOpen(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              {/* Dual Selection: Lead & Mentor */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-xl bg-black/30 border border-white/10">
                {/* 1. SELECT MENTOR */}
                <div>
                  <label className="block text-[10px] font-bold uppercase text-emerald-400 mb-1 flex items-center gap-1">
                    <span>1. Select Mentor</span>
                    <span className="text-rose-400">*</span>
                  </label>
                  <select
                    required
                    value={selectedMentorName}
                    onChange={(e) => setSelectedMentorName(e.target.value)}
                    className="w-full h-9 px-2.5 rounded-lg bg-[#080a0c] border border-white/10 text-xs text-zinc-200 font-semibold outline-none focus:border-emerald-500/50"
                  >
                    {MENTORS.map((m) => (
                      <option key={m.name} value={m.name}>
                        {m.name} ({m.affiliation})
                      </option>
                    ))}
                  </select>
                </div>

                {/* 2. SELECT LEAD */}
                <div>
                  <label className="block text-[10px] font-bold uppercase text-emerald-400 mb-1 flex items-center gap-1">
                    <span>2. Select Lead / Student</span>
                  </label>
                  <select
                    value={selectedLeadId}
                    onChange={(e) => setSelectedLeadId(e.target.value)}
                    className="w-full h-9 px-2.5 rounded-lg bg-[#080a0c] border border-white/10 text-xs text-zinc-200 font-semibold outline-none focus:border-emerald-500/50"
                  >
                    <option value="">None / General Session</option>
                    {leads.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.name || 'Lead'} — {l.phone} {l.course ? `(${l.course})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Date, Duration, Mode, Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">
                    Date & Time <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={meetingDate}
                    onChange={(e) => setMeetingDate(e.target.value)}
                    className="w-full h-8 px-2.5 rounded-lg bg-[#080a0c] border border-white/10 text-xs text-zinc-200 outline-none focus:border-emerald-500/50"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">
                    Duration
                  </label>
                  <select
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="w-full h-8 px-2.5 rounded-lg bg-[#080a0c] border border-white/10 text-xs text-zinc-200 outline-none"
                  >
                    <option>15 minutes</option>
                    <option>30 minutes</option>
                    <option>45 minutes</option>
                    <option>60 minutes</option>
                    <option>90 minutes</option>
                    <option>2 hours</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">
                    Mode
                  </label>
                  <select
                    value={mode}
                    onChange={(e) => setMode(e.target.value)}
                    className="w-full h-8 px-2.5 rounded-lg bg-[#080a0c] border border-white/10 text-xs text-zinc-200 outline-none"
                  >
                    <option>Online (Google Meet / Zoom)</option>
                    <option>Offline / In-person</option>
                    <option>Phone Consultation</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">
                    Meeting Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full h-8 px-2.5 rounded-lg bg-[#080a0c] border border-white/10 text-xs text-zinc-200 outline-none"
                  >
                    <option value="Planned">Planned</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              {/* Topic */}
              <div>
                <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">
                  Topic / Purpose <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g. CV evaluation, Thesis paper review, Backend AI career roadmap…"
                  className="w-full h-8 px-2.5 rounded-lg bg-[#080a0c] border border-white/10 text-xs text-zinc-200 outline-none focus:border-emerald-500/50"
                />
              </div>

              {/* Location or Meet Link */}
              <div>
                <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">
                  Location / Meet Link
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. https://meet.google.com/xyz-abcd-efg or Lab 402"
                  className="w-full h-8 px-2.5 rounded-lg bg-[#080a0c] border border-white/10 text-xs text-zinc-200 outline-none focus:border-emerald-500/50"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">
                  Preparation Notes / Questions
                </label>
                <textarea
                  rows={2}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Student background, specific questions, project links…"
                  className="w-full p-2.5 rounded-lg bg-[#080a0c] border border-white/10 text-xs text-zinc-200 outline-none focus:border-emerald-500/50"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsSchedulerOpen(false)}
                  className="h-8 px-3 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-8 px-5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold transition-all shadow-md shadow-emerald-500/20"
                >
                  Confirm & Schedule Meeting
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
