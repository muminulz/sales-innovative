import {
  AppSettings,
  CallLog,
  FollowUp,
  HistoryItem,
  Lead,
  MentorMeeting,
  Payment,
  StageDefinition,
  StageId,
  Task,
  ActivityEntry,
} from '../types';

export const CRM_STORAGE_KEY = 'cleanSalesCRM_v13';
export const HISTORY_STORAGE_KEY = 'calldock_history';
export const MENTOR_MEETINGS_KEY = 'salesCRM_mentorMeetings_v1';

export const STAGES: StageDefinition[] = [
  { id: 'new', label: 'নতুন' },
  { id: 'interested', label: 'আগ্রহী শিক্ষার্থী 1' },
  { id: 'willpay', label: 'টাকা দিবে' },
  { id: 'paid', label: 'টাকা দিয়েছে' },
  { id: 'meeting_will', label: 'মিটিং করবে 1' },
  { id: 'enrolled', label: 'Enroll/Approved 3' },
  { id: 'meeting_done', label: 'মিটিং করেছে' },
  { id: 'due', label: 'বকেয়া আছে 1' },
];

export const STAGE_MAP: Record<string, StageId> = {
  new: 'new',
  contacted: 'interested',
  followup: 'interested',
  hot: 'willpay',
  closing: 'willpay',
  won: 'paid',
  lost: 'new',
};

export function normalizeStage(s: string): StageId {
  const found = STAGES.some((x) => x.id === s);
  if (found) return s as StageId;
  return STAGE_MAP[s] || 'new';
}

export function stageLabel(s: string): string {
  const item = STAGES.find((x) => x.id === s);
  return item ? item.label : s || 'নতুন';
}

export function todayIso(): string {
  const d = new Date();
  const offset = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - offset).toISOString().slice(0, 10);
}

export function uid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

export interface CrmDatabase {
  version: number;
  leads: Lead[];
  followups: FollowUp[];
  calls: CallLog[];
  payments: Payment[];
  tasks: Task[];
  activity: ActivityEntry[];
  settings: AppSettings;
  meta: {
    createdAt?: string;
    updatedAt?: string;
  };
}

export function blankDb(): CrmDatabase {
  return {
    version: 15,
    leads: [],
    followups: [],
    calls: [],
    payments: [],
    tasks: [],
    activity: [],
    settings: {
      sound: true,
      notify: true,
      leadMinutes: 30,
      notifyEnabled: false,
    },
    meta: {
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  };
}

export function loadCrmDb(): CrmDatabase {
  try {
    const raw = localStorage.getItem(CRM_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        const base = blankDb();
        const db: CrmDatabase = {
          ...base,
          ...parsed,
          leads: Array.isArray(parsed.leads) ? parsed.leads : [],
          followups: Array.isArray(parsed.followups) ? parsed.followups : [],
          calls: Array.isArray(parsed.calls) ? parsed.calls : [],
          payments: Array.isArray(parsed.payments) ? parsed.payments : [],
          tasks: Array.isArray(parsed.tasks) ? parsed.tasks : [],
          activity: Array.isArray(parsed.activity) ? parsed.activity : [],
          settings: { ...base.settings, ...(parsed.settings || {}) },
        };

        // Normalize leads
        db.leads.forEach((l) => {
          l.stage = normalizeStage(l.stage);
          l.paid = Number(l.paid || 0);
          l.total = Number(l.total || l.value || 0);
          l.due = Number.isFinite(Number(l.due))
            ? Number(l.due)
            : Math.max(0, l.total - l.paid);
          l.value = l.total;
        });

        return db;
      }
    }
  } catch (e) {
    console.error('Failed to load CRM data', e);
  }

  // If completely empty, provide an initial welcoming lead
  const initial = blankDb();
  initial.leads = [
    {
      id: uid(),
      name: 'Rahim Ahmed',
      phone: '+8801712345678',
      email: 'rahim.ahmed@example.com',
      course: 'Backend AI Development Bootcamp (Online)',
      courseMode: 'Online',
      stage: 'interested',
      total: 18000,
      paid: 5000,
      due: 13000,
      value: 18000,
      contactDate: todayIso(),
      nextFollowUp: todayIso(),
      followupType: 'Call',
      source: 'Facebook Campaign',
      notes: 'Interested in backend AI and FastAPI. Requested curriculum details.',
      createdAt: new Date().toISOString(),
    },
  ];
  initial.followups = [
    {
      id: uid(),
      leadId: initial.leads[0].id,
      date: todayIso(),
      type: 'Call',
      note: 'Call regarding installment payment for Backend AI Bootcamp',
      done: false,
      createdAt: new Date().toISOString(),
    },
  ];
  initial.tasks = [
    {
      id: uid(),
      title: 'Review today’s leads and follow-ups',
      due: todayIso(),
      note: 'Check priority queue and make scheduled calls',
      done: false,
    },
  ];
  initial.activity = [
    {
      id: uid(),
      type: 'system',
      text: 'Workspace initialized with sample pipeline record',
      at: new Date().toISOString(),
    },
  ];
  saveCrmDb(initial);
  return initial;
}

export function saveCrmDb(db: CrmDatabase): void {
  db.meta = { ...(db.meta || {}), updatedAt: new Date().toISOString() };
  try {
    localStorage.setItem(CRM_STORAGE_KEY, JSON.stringify(db));
  } catch (e) {
    console.error('LocalStorage error', e);
  }
}

export function loadCallHistory(): HistoryItem[] {
  try {
    const raw = localStorage.getItem(HISTORY_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.error('Failed to load call history', e);
  }
  return [];
}

export function saveCallHistory(items: HistoryItem[]): void {
  try {
    localStorage.setItem(
      HISTORY_STORAGE_KEY,
      JSON.stringify(items.slice(0, 300))
    );
  } catch (e) {
    console.error('Failed to save call history', e);
  }
}

export function loadMentorMeetings(): MentorMeeting[] {
  try {
    const raw = localStorage.getItem(MENTOR_MEETINGS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.error('Failed to load mentor meetings', e);
  }
  return [];
}

export function saveMentorMeetings(meetings: MentorMeeting[]): void {
  try {
    localStorage.setItem(MENTOR_MEETINGS_KEY, JSON.stringify(meetings));
  } catch (e) {
    console.error('Failed to save mentor meetings', e);
  }
}

export function calculateLeadScore(l: Lead): {
  score: number;
  level: 'URGENT' | 'HIGH' | 'MEDIUM' | 'LOW';
  reasons: string[];
} {
  let score = 0;
  const reasons: string[] = [];
  const today = todayIso();

  if (['willpay', 'meeting_will'].includes(l.stage)) {
    score += 40;
    reasons.push('Closing intent');
  } else if (l.stage === 'due') {
    score += 45;
    reasons.push('Payment due');
  } else if (l.stage === 'interested') {
    score += 25;
    reasons.push('Interested');
  } else if (l.stage === 'enrolled') {
    score += 20;
    reasons.push('Enrollment review');
  }

  if (l.nextFollowUp) {
    if (l.nextFollowUp < today) {
      score += 45;
      reasons.push('Overdue follow-up');
    } else if (l.nextFollowUp === today) {
      score += 25;
      reasons.push('Due today');
    }
  }

  if (Number(l.due || 0) > 0) {
    score += 15;
    reasons.push('Outstanding balance');
  }

  if (Number(l.total || l.value || 0) >= 10000) {
    score += 10;
    reasons.push('High value');
  }

  if (!l.lastContact) {
    score += 10;
    reasons.push('Never contacted');
  }

  if (l.stage === 'paid' && Number(l.due || 0) === 0) {
    score = 0;
  }

  const level =
    score >= 65 ? 'URGENT' : score >= 40 ? 'HIGH' : score >= 20 ? 'MEDIUM' : 'LOW';

  return { score, level, reasons };
}

export function playAudioFeedback(): void {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    gain.gain.setValueAtTime(0.06, ctx.currentTime);
    osc.start();
    osc.stop(ctx.currentTime + 0.22);
  } catch (e) {
    console.warn('Audio feedback prevented by browser policy', e);
  }
}

export function downloadBlob(filename: string, content: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    URL.revokeObjectURL(url);
    a.remove();
  }, 500);
}

export function csvEscape(value: unknown): string {
  const str = String(value ?? '');
  return '"' + str.replace(/"/g, '""') + '"';
}

export function parseCsv(text: string): string[][] {
  const cleaned = text.replace(/^\ufeff/, '');
  const rows: string[][] = [];
  const firstLine = cleaned.split(/\r?\n/)[0] || '';
  const separator = firstLine.includes('\t') ? '\t' : ',';

  let row: string[] = [];
  let cell = '';
  let inQuotes = false;

  for (let i = 0; i < cleaned.length; i++) {
    const char = cleaned[i];
    const nextChar = cleaned[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        cell += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === separator && !inQuotes) {
      row.push(cell);
      cell = '';
    } else if ((char === '\n' || char === '\r') && !inQuotes) {
      if (char === '\r' && nextChar === '\n') {
        i++;
      }
      row.push(cell);
      if (row.some((c) => c.trim())) {
        rows.push(row);
      }
      row = [];
      cell = '';
    } else {
      cell += char;
    }
  }

  if (cell || row.length) {
    row.push(cell);
    if (row.some((c) => c.trim())) {
      rows.push(row);
    }
  }

  return rows;
}
