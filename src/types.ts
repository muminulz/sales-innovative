export type StageId =
  | 'new'
  | 'interested'
  | 'willpay'
  | 'paid'
  | 'meeting_will'
  | 'enrolled'
  | 'meeting_done'
  | 'due';

export interface StageDefinition {
  id: StageId;
  label: string;
}

export interface Lead {
  id: string;
  name: string;
  phone: string;
  email: string;
  course?: string;
  courseMode?: string;
  stage: StageId;
  total: number;
  paid: number;
  due: number;
  value?: number;
  contactDate?: string;
  purchaseDate?: string;
  nextFollowUp?: string;
  followupType?: string;
  source?: string;
  occupation?: string;
  company?: string;
  location?: string;
  education?: string;
  preferredContact?: string;
  whatsapp?: string;
  messenger?: string;
  facebook?: string;
  profile?: string;
  meetingDate?: string;
  assignedTo?: string;
  tags?: string[] | string;
  remark?: string;
  internalNotes?: string;
  notes?: string;
  sourceText?: string;
  workspaceNote?: string;
  lastWorkspaceAt?: string;
  lastContact?: string;
  lastCallClick?: number;
  createdAt: string;
  updatedAt?: string;
}

export interface CallLog {
  id: string;
  leadId: string;
  at: string;
  outcome: string;
  duration?: number;
  course?: string;
  mode?: string;
  notes?: string;
  source?: string;
}

export interface FollowUp {
  id: string;
  leadId: string;
  date: string;
  type?: string;
  note?: string;
  done: boolean;
  createdAt?: string;
}

export interface Payment {
  id: string;
  leadId: string;
  amount: number;
  method: string;
  note?: string;
  date: string;
  at: string;
}

export interface Task {
  id: string;
  title: string;
  due?: string;
  note?: string;
  done: boolean;
}

export interface ActivityEntry {
  id: string;
  type: string;
  text: string;
  leadId?: string;
  at: string;
}

export interface Mentor {
  name: string;
  title: string;
  affiliation: string;
  photo: string;
}

export interface MentorMeeting {
  id: string;
  mentor: string;
  leadId?: string;
  leadName?: string;
  leadPhone?: string;
  dateTime: string;
  duration: string;
  mode: string;
  status: string;
  topic: string;
  location: string;
  note?: string;
  createdAt: string;
}

export interface Course {
  name: string;
  url: string;
  old: number | null;
  price: number | null;
  mode: string;
}

export interface AppSettings {
  sound: boolean;
  notify: boolean;
  leadMinutes: number;
  notifyEnabled: boolean;
}

export interface HistoryItem {
  type: 'call' | 'email';
  value: string;
  name: string;
  timestamp: number;
}

export interface ExtractedContact {
  phone: string;
  name: string;
  email: string;
}
