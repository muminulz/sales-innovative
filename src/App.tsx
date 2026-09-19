import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Header } from './components/Header';
import { WorkspaceSection, WorkspaceViewMode } from './components/WorkspaceSection';
import { QuickToolsDrawer } from './components/QuickToolsDrawer';
import { ActivitySection } from './components/ActivitySection';
import { Toast } from './components/Toast';
import { CrmNav, CrmTab } from './components/crm/CrmNav';
import { DashboardTab } from './components/crm/DashboardTab';
import { LeadsTab } from './components/crm/LeadsTab';
import { FollowupsTab } from './components/crm/FollowupsTab';
import { CallsTab } from './components/crm/CallsTab';
import { SalesTab } from './components/crm/SalesTab';
import { CoursesTab } from './components/crm/CoursesTab';
import { MentorsTab } from './components/crm/MentorsTab';
import { ReportsTab } from './components/crm/ReportsTab';
import { TasksTab } from './components/crm/TasksTab';
import { DataTab } from './components/crm/DataTab';
import { ActivityTab } from './components/crm/ActivityTab';
import { DeleteConfirmModal } from './components/crm/DeleteConfirmModal';
import {
  CrmDatabase,
  blankDb,
  loadCrmDb,
  saveCrmDb,
  loadCallHistory,
  saveCallHistory,
  loadMentorMeetings,
  saveMentorMeetings,
  uid,
  todayIso,
  playAudioFeedback,
  downloadBlob,
  csvEscape,
  parseCsv,
} from './utils/storage';
import { extractContact } from './utils/extractor';
import { ExtractedContact, HistoryItem, Lead, MentorMeeting, StageId } from './types';

export default function App() {
  // --- STATE: Workspace ---
  const [rawText, setRawText] = useState('');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // --- STATE: CRM ---
  const [db, setDb] = useState<CrmDatabase>(blankDb);
  const [currentTab, setCurrentTab] = useState<CrmTab>('dashboard');
  const [mentorMeetings, setMentorMeetings] = useState<MentorMeeting[]>([]);
  const [selectedLeadForMeeting, setSelectedLeadForMeeting] = useState<string | undefined>(undefined);

  // --- WORKSPACE & CRM IN-PLACE STATE ---
  const [workspaceViewMode, setWorkspaceViewMode] = useState<WorkspaceViewMode>('all');
  const [activeWorkspaceLead, setActiveWorkspaceLead] = useState<Lead | null>(null);
  const workspaceRef = useRef<HTMLDivElement>(null);
  const crmSectionRef = useRef<HTMLDivElement>(null);

  const [deleteModalConfig, setDeleteModalConfig] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    action: () => void;
  } | null>(null);

  // Auto extracted contact from raw text
  const extracted: ExtractedContact = useMemo(() => {
    return extractContact(rawText);
  }, [rawText]);

  // Load persistence on mount
  useEffect(() => {
    const loadedDb = loadCrmDb();
    setDb(loadedDb);
    setHistory(loadCallHistory());
    setMentorMeetings(loadMentorMeetings());
  }, []);

  // Sync CRM DB to localStorage on changes
  const updateDb = (updater: (prev: CrmDatabase) => CrmDatabase) => {
    setDb((prev) => {
      const next = updater(prev);
      saveCrmDb(next);
      return next;
    });
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
  };

  const logActivity = (type: string, text: string, leadId?: string) => {
    updateDb((prev) => ({
      ...prev,
      activity: [
        {
          id: uid(),
          type,
          text,
          leadId,
          at: new Date().toISOString(),
        },
        ...prev.activity.slice(0, 499),
      ],
    }));
  };

  // ----------------------------------------------------
  // WORKSPACE ACTION HANDLERS
  // ----------------------------------------------------
  const handlePaste = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.readText) {
        const text = await navigator.clipboard.readText();
        if (text) {
          setRawText(text);
          showToast('Pasted & extracted contact details');
          return;
        }
      }
      showToast('Use Ctrl+V to paste');
    } catch {
      showToast('Use Ctrl+V to paste');
    }
  };

  const handleClear = () => {
    setRawText('');
    setActiveWorkspaceLead(null);
    setWorkspaceViewMode('all');
    showToast('Workspace cleared');
  };

  const copyToClipboard = (text: string, msg: string) => {
    if (!text) {
      showToast('Nothing to copy');
      return;
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => showToast(msg)).catch(() => fallbackCopy(text, msg));
    } else {
      fallbackCopy(text, msg);
    }
  };

  const fallbackCopy = (text: string, msg: string) => {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand('copy');
      showToast(msg);
    } catch {
      showToast('Could not copy');
    }
    document.body.removeChild(ta);
  };

  const addCallHistoryEntry = (type: 'call' | 'email', value: string, name: string) => {
    setHistory((prev) => {
      const entry: HistoryItem = { type, value, name: name || '', timestamp: Date.now() };
      const updated = [entry, ...prev.slice(0, 299)];
      saveCallHistory(updated);
      return updated;
    });
  };

  const makeCallToNumber = (phone: string, name?: string) => {
    if (!phone) {
      showToast('No phone number found');
      return;
    }
    const cleanDigits = phone.replace(/\D/g, '');
    addCallHistoryEntry('call', phone, name || '');
    if (db.settings.sound) playAudioFeedback();

    // Auto record or update lead in CRM
    const existing = db.leads.find(
      (l) => l.phone && l.phone.replace(/\D/g, '') === cleanDigits
    );
    let leadTarget: Lead;

    if (existing) {
      leadTarget = existing;
      setActiveWorkspaceLead(existing);
      updateDb((prev) => ({
        ...prev,
        calls: [
          {
            id: uid(),
            leadId: existing.id,
            at: new Date().toISOString(),
            outcome: 'Attempted',
            notes: 'Dialed via workspace action',
          },
          ...prev.calls,
        ],
        leads: prev.leads.map((l) =>
          l.id === existing.id ? { ...l, lastContact: todayIso() } : l
        ),
      }));
    } else {
      leadTarget = {
        id: uid(),
        name: name || extracted.name || 'New Lead',
        phone,
        email: extracted.email || '',
        stage: 'interested',
        total: 0,
        paid: 0,
        due: 0,
        contactDate: todayIso(),
        lastContact: todayIso(),
        source: 'Quick Call',
        createdAt: new Date().toISOString(),
      };
      setActiveWorkspaceLead(leadTarget);
      updateDb((prev) => ({
        ...prev,
        leads: [leadTarget, ...prev.leads],
        calls: [
          {
            id: uid(),
            leadId: leadTarget.id,
            at: new Date().toISOString(),
            outcome: 'Attempted',
            notes: 'Dialed via workspace action',
          },
          ...prev.calls,
        ],
      }));
    }

    setWorkspaceViewMode('call');
    logActivity('call', `Dialed: ${phone} (${name || 'lead'})`, leadTarget.id);
    showToast(`Calling ${phone}…`);
    window.location.href = `tel:${phone}`;
    scrollToWorkspace();
  };

  const openWhatsAppToNumber = (phone: string) => {
    let clean = phone.replace(/\D/g, '');
    if (clean.length < 6) {
      showToast('Invalid WhatsApp number');
      return;
    }
    const url = `https://api.whatsapp.com/send/?phone=${clean}&text&type=phone_number&app_absent=0`;
    window.open(url, '_blank', 'noopener,noreferrer');
    showToast('Opening WhatsApp…');
  };

  const openGmailToEmail = (email: string, name?: string) => {
    if (!email) {
      showToast('No email address found');
      return;
    }
    addCallHistoryEntry('email', email, name || '');
    const url = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(email)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    showToast('Opening Gmail…');
  };

  const copyContactBundle = () => {
    const parts: string[] = [];
    if (extracted.name) parts.push(extracted.name);
    if (extracted.email) parts.push(extracted.email);
    if (extracted.phone) parts.push(extracted.phone);
    if (parts.length === 0) {
      showToast('No contact details extracted to copy');
      return;
    }
    // TAB separator pastes into columns in Excel / Google Sheets
    const bundleText = parts.join('\t');
    copyToClipboard(bundleText, 'All contact details copied (TAB-separated)');
  };

  const saveExtractedLeadToCrm = () => {
    if (activeWorkspaceLead) {
      handleSaveLeadFromWorkspace(activeWorkspaceLead);
      return;
    }

    if (!extracted.name && !extracted.phone && !extracted.email) {
      showToast('Extract a lead first');
      return;
    }

    const cleanDigits = extracted.phone.replace(/\D/g, '');
    const cleanEmail = extracted.email.trim().toLowerCase();

    let target: Lead;
    const existing = db.leads.find(
      (l) =>
        (cleanDigits && l.phone.replace(/\D/g, '') === cleanDigits) ||
        (cleanEmail && l.email.toLowerCase() === cleanEmail)
    );

    if (existing) {
      target = {
        ...existing,
        name: extracted.name || existing.name,
        phone: extracted.phone || existing.phone,
        email: extracted.email || existing.email,
        sourceText: rawText || existing.sourceText,
        notes: existing.notes ? existing.notes + (rawText ? `\n[Workspace] ${rawText}` : '') : rawText,
        updatedAt: new Date().toISOString(),
      };
      updateDb((prev) => ({
        ...prev,
        leads: prev.leads.map((l) => (l.id === existing.id ? target : l)),
      }));
      showToast(`Lead updated in CRM: ${target.name || target.phone}`);
    } else {
      target = {
        id: uid(),
        name: extracted.name || 'Unnamed Lead',
        phone: extracted.phone,
        email: extracted.email,
        stage: 'new',
        total: 0,
        paid: 0,
        due: 0,
        contactDate: todayIso(),
        source: 'Lead Workspace',
        sourceText: rawText,
        notes: rawText,
        createdAt: new Date().toISOString(),
      };
      updateDb((prev) => ({
        ...prev,
        leads: [target, ...prev.leads],
      }));
      showToast(`Lead saved to CRM: ${target.name || target.phone}`);
    }

    setActiveWorkspaceLead(target);
    logActivity('lead', `Saved lead from workspace: ${target.name || target.phone}`, target.id);
  };

  const scrollToCrm = () => {
    crmSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const scrollToWorkspace = () => {
    workspaceRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // ----------------------------------------------------
  // IN-PLACE WORKSPACE OPERATIONS (NO POPUPS)
  // ----------------------------------------------------
  const handleOpenLeadInWorkspace = (lead: Lead, mode: WorkspaceViewMode = 'all') => {
    setActiveWorkspaceLead(lead);
    setWorkspaceViewMode(mode);
    scrollToWorkspace();
    showToast(`Loaded lead: ${lead.name || lead.phone}`);
  };

  const handleCallLeadInWorkspace = (lead: Lead) => {
    setActiveWorkspaceLead(lead);
    setWorkspaceViewMode('call');
    makeCallToNumber(lead.phone, lead.name);
    scrollToWorkspace();
  };

  const handleFollowLeadInWorkspace = (lead: Lead) => {
    setActiveWorkspaceLead(lead);
    setWorkspaceViewMode('followup');
    scrollToWorkspace();
  };

  const handlePayLeadInWorkspace = (lead?: Lead) => {
    if (lead) setActiveWorkspaceLead(lead);
    setWorkspaceViewMode('payment');
    scrollToWorkspace();
  };

  const handleNewLeadInWorkspace = () => {
    setActiveWorkspaceLead(null);
    setRawText('');
    setWorkspaceViewMode('all');
    scrollToWorkspace();
    showToast('Ready for new lead');
  };

  const handleSaveLeadFromWorkspace = (leadToSave: Lead) => {
    updateDb((prev) => {
      const idx = prev.leads.findIndex((l) => l.id === leadToSave.id);
      if (idx >= 0) {
        const next = [...prev.leads];
        next[idx] = leadToSave;
        return { ...prev, leads: next };
      } else {
        return { ...prev, leads: [leadToSave, ...prev.leads] };
      }
    });
    setActiveWorkspaceLead(leadToSave);
    logActivity('lead', `Saved lead: ${leadToSave.name || leadToSave.phone}`, leadToSave.id);
    showToast(`Lead saved: ${leadToSave.name || leadToSave.phone}`);
  };

  const handleLogCallRecord = (callData: { outcome: string; duration: number; notes: string; leadId: string }) => {
    const newCall = {
      id: uid(),
      leadId: callData.leadId,
      at: new Date().toISOString(),
      outcome: callData.outcome,
      duration: callData.duration,
      notes: callData.notes,
    };
    updateDb((prev) => ({
      ...prev,
      calls: [newCall, ...prev.calls],
      leads: prev.leads.map((l) =>
        l.id === callData.leadId
          ? {
              ...l,
              lastContact: todayIso(),
              notes: l.notes
                ? `${l.notes}\n[Call ${todayIso()}] ${callData.outcome}: ${callData.notes}`
                : `[Call ${todayIso()}] ${callData.outcome}: ${callData.notes}`,
            }
          : l
      ),
    }));
    logActivity('call', `Logged call: ${callData.outcome} (${callData.duration}s)`, callData.leadId);
    showToast(`Call record logged: ${callData.outcome}`);
  };

  const handleRecordPaymentFromWorkspace = (paymentData: {
    amount: number;
    method: string;
    trxId?: string;
    note?: string;
    leadId: string;
  }) => {
    const newPayment = {
      id: uid(),
      leadId: paymentData.leadId,
      amount: paymentData.amount,
      method: paymentData.method,
      trxId: paymentData.trxId,
      note: paymentData.note,
      date: todayIso(),
      at: new Date().toISOString(),
    };
    updateDb((prev) => {
      const target = prev.leads.find((l) => l.id === paymentData.leadId);
      const newPaid = Number(target?.paid || 0) + paymentData.amount;
      const total = Number(target?.total || target?.value || newPaid);
      const newDue = Math.max(0, total - newPaid);

      const updatedLeads = prev.leads.map((l) => {
        if (l.id !== paymentData.leadId) return l;
        return {
          ...l,
          paid: newPaid,
          total: total,
          due: newDue,
          stage: newDue === 0 ? ('paid' as const) : ('due' as const),
        };
      });

      return {
        ...prev,
        payments: [newPayment, ...prev.payments],
        leads: updatedLeads,
      };
    });

    logActivity('payment', `Payment recorded: ৳${paymentData.amount.toLocaleString()} via ${paymentData.method}`, paymentData.leadId);
    showToast(`Payment recorded: ৳${paymentData.amount.toLocaleString()}`);
  };

  const handleDeleteLeadConfirm = (lead: Lead) => {
    setDeleteModalConfig({
      isOpen: true,
      title: 'Delete Lead Permanently?',
      description: `This will permanently delete "${lead.name || lead.phone}" and its associated calls, follow-ups, and logs.`,
      action: () => {
        updateDb((prev) => ({
          ...prev,
          leads: prev.leads.filter((l) => l.id !== lead.id),
          calls: prev.calls.filter((c) => c.leadId !== lead.id),
          followups: prev.followups.filter((f) => f.leadId !== lead.id),
          payments: prev.payments.filter((p) => p.leadId !== lead.id),
        }));
        if (activeWorkspaceLead?.id === lead.id) {
          setActiveWorkspaceLead(null);
          setRawText('');
          setWorkspaceViewMode('all');
        }
        setDeleteModalConfig(null);
        showToast('Lead permanently deleted');
      },
    });
  };

  const handleDeleteSelectedLeads = (selectedIds: string[]) => {
    setDeleteModalConfig({
      isOpen: true,
      title: `Delete ${selectedIds.length} Selected Leads?`,
      description: `This will permanently remove ${selectedIds.length} checked leads from your local CRM database.`,
      action: () => {
        updateDb((prev) => ({
          ...prev,
          leads: prev.leads.filter((l) => !selectedIds.includes(l.id)),
          calls: prev.calls.filter((c) => !selectedIds.includes(c.leadId)),
          followups: prev.followups.filter((f) => !selectedIds.includes(f.leadId)),
          payments: prev.payments.filter((p) => !selectedIds.includes(p.leadId)),
        }));
        if (activeWorkspaceLead && selectedIds.includes(activeWorkspaceLead.id)) {
          setActiveWorkspaceLead(null);
          setRawText('');
          setWorkspaceViewMode('all');
        }
        setDeleteModalConfig(null);
        showToast(`${selectedIds.length} leads deleted`);
      },
    });
  };

  // ----------------------------------------------------
  // DATA CENTER (IMPORT / EXPORT)
  // ----------------------------------------------------
  const handleExportJson = () => {
    const backup = {
      ...db,
      mentorMeetings,
      exportedAt: new Date().toISOString(),
    };
    downloadBlob(
      `sales-crm-backup-${todayIso()}.json`,
      JSON.stringify(backup, null, 2),
      'application/json'
    );
    showToast('Full CRM backup exported');
  };

  const handleImportJson = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result as string);
        if (!parsed || !Array.isArray(parsed.leads)) {
          throw new Error('Invalid CRM JSON schema');
        }
        setDb({
          ...blankDb(),
          ...parsed,
          settings: { ...blankDb().settings, ...(parsed.settings || {}) },
        });
        saveCrmDb(parsed);
        if (Array.isArray(parsed.mentorMeetings)) {
          setMentorMeetings(parsed.mentorMeetings);
          saveMentorMeetings(parsed.mentorMeetings);
        }
        showToast(`CRM imported successfully (${parsed.leads.length} leads)`);
      } catch (err: any) {
        showToast(`Import failed: ${err.message}`);
      }
    };
    reader.readAsText(file);
  };

  const handleExportSalesCsv = () => {
    const headers = [
      'Name',
      'Email',
      'Phone Number',
      'Course Name',
      'Contact Date',
      'Purchase Date',
      'total',
      'Paid Amount',
      'Due Amount',
      'Remark',
      'Sourse',
    ];
    const rows = db.leads.map((l) => [
      l.name,
      l.email,
      l.phone,
      l.course || '',
      l.contactDate || '',
      l.purchaseDate || '',
      l.total || l.value || 0,
      l.paid || 0,
      l.due || 0,
      l.remark || l.notes || '',
      l.source || '',
    ]);

    const csvContent =
      '\ufeff' +
      headers.map(csvEscape).join(',') +
      '\n' +
      rows.map((r) => r.map(csvEscape).join(',')).join('\n');

    downloadBlob(`sales-sheet-${todayIso()}.csv`, csvContent, 'text/csv;charset=utf-8');
    showToast('Sales CSV exported');
  };

  const handleImportSalesCsv = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const text = reader.result as string;
        const rows = parseCsv(text);
        if (rows.length < 2) throw new Error('No data rows found');
        const headers = rows[0].map((h) => h.trim().toLowerCase());
        const colIdx = (name: string) => headers.indexOf(name.toLowerCase());
        const getVal = (r: string[], name: string) => {
          const i = colIdx(name);
          return i >= 0 ? r[i]?.trim() || '' : '';
        };

        let importedCount = 0;
        updateDb((prev) => {
          const nextLeads = [...prev.leads];

          rows.slice(1).forEach((r) => {
            const name = getVal(r, 'Name');
            const phone = getVal(r, 'Phone Number');
            const email = getVal(r, 'Email');
            if (!name && !phone && !email) return;

            const total = Number(getVal(r, 'total').replace(/[^0-9.-]/g, '')) || 0;
            const paid = Number(getVal(r, 'Paid Amount').replace(/[^0-9.-]/g, '')) || 0;
            const due = Number(getVal(r, 'Due Amount').replace(/[^0-9.-]/g, '')) || Math.max(0, total - paid);

            const data: Lead = {
              id: uid(),
              name,
              phone,
              email,
              course: getVal(r, 'Course Name'),
              contactDate: getVal(r, 'Contact Date'),
              purchaseDate: getVal(r, 'Purchase Date'),
              total,
              paid,
              due,
              value: total,
              remark: getVal(r, 'Remark'),
              source: getVal(r, 'Sourse') || getVal(r, 'Source') || 'Imported Sales Sheet',
              stage: due === 0 && paid > 0 ? 'paid' : paid > 0 ? 'due' : 'new',
              createdAt: new Date().toISOString(),
            };

            // Deduplicate by clean phone or email
            const cleanDigits = phone.replace(/\D/g, '');
            const matchIdx = nextLeads.findIndex(
              (l) =>
                (cleanDigits && l.phone.replace(/\D/g, '') === cleanDigits) ||
                (email && l.email.toLowerCase() === email.toLowerCase())
            );

            if (matchIdx >= 0) {
              nextLeads[matchIdx] = { ...nextLeads[matchIdx], ...data, id: nextLeads[matchIdx].id };
            } else {
              nextLeads.unshift(data);
            }
            importedCount++;
          });

          return { ...prev, leads: nextLeads };
        });

        showToast(`${importedCount} rows imported from sales sheet`);
        setCurrentTab('leads');
      } catch (err: any) {
        showToast(`Import error: ${err.message}`);
      }
    };
    reader.readAsText(file);
  };

  const handleEraseCompleteDb = () => {
    setDeleteModalConfig({
      isOpen: true,
      title: 'Erase Entire CRM Database?',
      description: 'This will wipe out every lead, follow-up, call attempt, transaction, and audit entry in local storage. Make sure you exported a backup!',
      action: () => {
        const fresh = blankDb();
        setDb(fresh);
        saveCrmDb(fresh);
        setHistory([]);
        saveCallHistory([]);
        setMentorMeetings([]);
        saveMentorMeetings([]);
        setDeleteModalConfig(null);
        showToast('All CRM data has been reset');
      },
    });
  };

  const handleScheduleMentorMeeting = (meetingData: Omit<MentorMeeting, 'id' | 'createdAt'>) => {
    const newMeeting: MentorMeeting = {
      ...meetingData,
      id: uid(),
      createdAt: new Date().toISOString(),
    };
    setMentorMeetings((prev) => {
      const updated = [newMeeting, ...prev];
      saveMentorMeetings(updated);
      return updated;
    });

    if (newMeeting.leadId) {
      updateDb((prev) => ({
        ...prev,
        leads: prev.leads.map((l) =>
          l.id === newMeeting.leadId
            ? {
                ...l,
                nextFollowUp: newMeeting.dateTime.slice(0, 10),
                notes: l.notes
                  ? `${l.notes}\n[Meeting ${newMeeting.dateTime.slice(0, 10)}] with ${newMeeting.mentor}: ${newMeeting.topic}`
                  : `[Meeting ${newMeeting.dateTime.slice(0, 10)}] with ${newMeeting.mentor}: ${newMeeting.topic}`,
              }
            : l
        ),
      }));
    }

    logActivity(
      'mentor',
      `Scheduled meeting with ${newMeeting.mentor} for ${newMeeting.leadName || 'student'}: ${newMeeting.topic}`,
      newMeeting.leadId
    );
    showToast(`Meeting scheduled with ${newMeeting.mentor}`);
    setSelectedLeadForMeeting(undefined);
  };

  const handleUpdateMeetingStatus = (id: string, newStatus: string) => {
    setMentorMeetings((prev) => {
      const updated = prev.map((m) => (m.id === id ? { ...m, status: newStatus } : m));
      saveMentorMeetings(updated);
      return updated;
    });
    showToast(`Meeting status: ${newStatus}`);
  };

  const handleDeleteMeeting = (id: string) => {
    setMentorMeetings((prev) => {
      const updated = prev.filter((m) => m.id !== id);
      saveMentorMeetings(updated);
      return updated;
    });
    showToast('Meeting deleted');
  };

  const handleAddFollowup = (data: {
    leadId: string;
    date: string;
    time?: string;
    type: string;
    note: string;
  }) => {
    const newFollowup = {
      id: uid(),
      leadId: data.leadId,
      date: data.date,
      time: data.time,
      type: data.type,
      note: data.note,
      done: false,
      createdAt: new Date().toISOString(),
    };
    updateDb((prev) => ({
      ...prev,
      followups: [newFollowup, ...prev.followups],
      leads: prev.leads.map((l) =>
        l.id === data.leadId
          ? {
              ...l,
              nextFollowUp: data.date,
              nextFollowUpTime: data.time,
              followupType: data.type,
            }
          : l
      ),
    }));
    logActivity(
      'followup',
      `Scheduled follow-up (${data.type}) on ${data.date} ${data.time || ''}: ${data.note || 'No note'}`,
      data.leadId
    );
    showToast('Follow-up scheduled with date & time');
  };

  return (
    <div className="min-h-screen bg-[#050607] text-[#f4f5f6] pb-16 font-sans">
      <div className="max-w-[1140px] mx-auto px-3 sm:px-5 pt-3 sm:pt-4">
        {/* Top App Header with Clear button on top replacing reset */}
        <Header
          hasPhone={Boolean(extracted.phone)}
          hasEmail={Boolean(extracted.email)}
          onMakeCall={() => makeCallToNumber(extracted.phone, extracted.name)}
          onCopyAll={copyContactBundle}
          onSaveLead={saveExtractedLeadToCrm}
          onClear={handleClear}
          onReset={handleClear}
          onScrollToCrm={scrollToCrm}
        />

        {/* Lead Workspace Input & Extracted Cards */}
        <div ref={workspaceRef}>
          <WorkspaceSection
            text={rawText}
            onChangeText={setRawText}
            extracted={extracted}
            onPaste={handlePaste}
            onClear={handleClear}
            onCopyPhone={() => copyToClipboard(extracted.phone, 'Phone copied')}
            onCopyName={() => copyToClipboard(extracted.name, 'Name copied')}
            onCopyEmail={() => copyToClipboard(extracted.email, 'Email copied')}
            onCall={(phone, name) => makeCallToNumber(phone || extracted.phone, name || extracted.name)}
            onWhatsApp={(phone) => openWhatsAppToNumber(phone || extracted.phone)}
            onGmail={(email, name) => openGmailToEmail(email || extracted.email, name || extracted.name)}
            onCopyAll={copyContactBundle}
            activeLead={activeWorkspaceLead}
            onClearActiveLead={() => {
              setActiveWorkspaceLead(null);
              setRawText('');
              setWorkspaceViewMode('all');
            }}
            onSaveLead={handleSaveLeadFromWorkspace}
            onLogCall={handleLogCallRecord}
            onScheduleMeeting={handleScheduleMentorMeeting}
            onRecordPayment={handleRecordPaymentFromWorkspace}
            viewMode={workspaceViewMode}
            onViewModeChange={setWorkspaceViewMode}
          />
        </div>

        {/* Call & Activity History */}
        <ActivitySection
          history={history}
          onCallValue={(p, n) => makeCallToNumber(p, n)}
          onEmailValue={(e, n) => openGmailToEmail(e, n)}
          onClearHistory={() => {
            setHistory([]);
            saveCallHistory([]);
            showToast('History cleared');
          }}
        />

        {/* Integrated Sales Command Center (CRM) */}
        <div
          ref={crmSectionRef}
          className="rounded-2xl border border-white/10 bg-[#090b0d] shadow-2xl overflow-hidden mt-6 scroll-mt-6"
        >
          {/* CRM Top Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 border-b border-white/10 bg-[#121519]">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-zinc-100 text-zinc-950 font-black flex items-center justify-center text-sm shadow-md">
                S
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-sm font-bold text-zinc-100">
                    CallRM — Sales Command Center
                  </h1>
                  <span className="px-1.5 py-0.2 text-[9px] font-bold uppercase rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/25">
                    Innovative Zihad
                  </span>
                </div>
                <p className="text-[10px] text-zinc-400">
                  Connected lead workspace, dialer, follow-ups, mentor scheduling & catalog.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={saveExtractedLeadToCrm}
                className="h-8 px-3 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <span>Save Workspace Lead</span>
              </button>
              <button
                type="button"
                onClick={handleNewLeadInWorkspace}
                className="h-8 px-3 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold"
              >
                + New Lead
              </button>
            </div>
          </div>

          {/* CRM Tab Bar */}
          <CrmNav
            currentTab={currentTab}
            onSelectTab={setCurrentTab}
            counts={{
              leads: db.leads.length,
              followups: db.followups.filter((f) => !f.done).length,
              calls: db.calls.filter((c) => String(c.at).slice(0, 10) === todayIso()).length,
              sales: db.leads.filter((l) => Number(l.paid || 0) > 0).length,
              meetings: mentorMeetings.length,
            }}
          />

          {/* CRM Active View */}
          <div className="p-4 sm:p-5 bg-[#090b0d]">
            {currentTab === 'dashboard' && (
              <DashboardTab
                db={db}
                onOpenLead={(lead) => handleOpenLeadInWorkspace(lead, 'all')}
                onWrapUpLead={(lead) => handleOpenLeadInWorkspace(lead, 'call')}
                onNavigateTab={(tab) => setCurrentTab(tab)}
                onCallLead={(lead) => handleCallLeadInWorkspace(lead)}
              />
            )}

            {currentTab === 'leads' && (
              <LeadsTab
                leads={db.leads}
                onOpenLead={(lead) => handleOpenLeadInWorkspace(lead, 'all')}
                onCallLead={(lead) => handleCallLeadInWorkspace(lead)}
                onFollowLead={(lead) => handleFollowLeadInWorkspace(lead)}
                onDeleteLead={(lead) => handleDeleteLeadConfirm(lead)}
                onDeleteSelected={handleDeleteSelectedLeads}
                onNewLead={handleNewLeadInWorkspace}
              />
            )}

            {currentTab === 'followups' && (
              <FollowupsTab
                followups={db.followups}
                leads={db.leads}
                onOpenLead={(lead) => handleOpenLeadInWorkspace(lead, 'followup')}
                onCallLead={(lead) => handleCallLeadInWorkspace(lead)}
                onToggleDone={(fId) => {
                  updateDb((prev) => ({
                    ...prev,
                    followups: prev.followups.map((f) =>
                      f.id === fId ? { ...f, done: !f.done } : f
                    ),
                  }));
                  showToast('Follow-up status updated');
                }}
                onNewFollowup={() => {
                  if (db.leads[0]) {
                    handleFollowLeadInWorkspace(db.leads[0]);
                  } else {
                    handleNewLeadInWorkspace();
                  }
                }}
                onAddFollowup={handleAddFollowup}
              />
            )}

            {currentTab === 'calls' && (
              <CallsTab
                calls={db.calls}
                leads={db.leads}
                onOpenLead={(lead) => handleOpenLeadInWorkspace(lead, 'call')}
                onCallLead={(lead) => handleCallLeadInWorkspace(lead)}
                onCallWorkspace={() => {
                  if (extracted.phone) {
                    makeCallToNumber(extracted.phone, extracted.name);
                  } else {
                    showToast('No phone number in lead workspace');
                  }
                }}
              />
            )}

            {currentTab === 'sales' && (
              <SalesTab
                leads={db.leads}
                payments={db.payments}
                onOpenLead={(lead) => handleOpenLeadInWorkspace(lead, 'details')}
                onRecordPayment={(lead) => handlePayLeadInWorkspace(lead)}
                onExportSales={handleExportSalesCsv}
              />
            )}

            {currentTab === 'courses' && (
              <CoursesTab
                onSelectCourseForLead={(courseName, mode) => {
                  if (db.leads[0]) {
                    const target = db.leads[0];
                    updateDb((prev) => ({
                      ...prev,
                      leads: prev.leads.map((l) =>
                        l.id === target.id ? { ...l, course: courseName, courseMode: mode } : l
                      ),
                    }));
                    showToast(`Assigned "${courseName}" to ${target.name || target.phone}`);
                  } else {
                    showToast(`Selected "${courseName}"`);
                  }
                }}
              />
            )}

            {currentTab === 'mentors' && (
              <MentorsTab
                meetings={mentorMeetings}
                leads={db.leads}
                initialLeadId={selectedLeadForMeeting}
                onScheduleMeeting={handleScheduleMentorMeeting}
                onUpdateMeetingStatus={handleUpdateMeetingStatus}
                onDeleteMeeting={handleDeleteMeeting}
                onOpenLead={(lead) => handleOpenLeadInWorkspace(lead, 'followup')}
                onCallLead={(lead) => handleCallLeadInWorkspace(lead)}
              />
            )}

            {currentTab === 'reports' && <ReportsTab db={db} />}

            {currentTab === 'tasks' && (
              <TasksTab
                tasks={db.tasks}
                onAddTask={(newTask) => {
                  updateDb((prev) => ({
                    ...prev,
                    tasks: [{ id: uid(), ...newTask }, ...prev.tasks],
                  }));
                  showToast('Task added');
                }}
                onToggleTask={(tId) => {
                  updateDb((prev) => ({
                    ...prev,
                    tasks: prev.tasks.map((t) =>
                      t.id === tId ? { ...t, done: !t.done } : t
                    ),
                  }));
                }}
              />
            )}

            {currentTab === 'data' && (
              <DataTab
                settings={db.settings}
                onUpdateSettings={(s) => {
                  updateDb((prev) => ({ ...prev, settings: s }));
                  showToast('Settings saved');
                }}
                onExportJson={handleExportJson}
                onImportJson={handleImportJson}
                onExportSalesCsv={handleExportSalesCsv}
                onImportSalesCsv={handleImportSalesCsv}
                onTestSound={playAudioFeedback}
                onEnableNotification={() => {
                  if ('Notification' in window) {
                    Notification.requestPermission().then((p) => {
                      updateDb((prev) => ({
                        ...prev,
                        settings: { ...prev.settings, notify: p === 'granted' },
                      }));
                      showToast(p === 'granted' ? 'Notification permission granted' : `Permission: ${p}`);
                    });
                  } else {
                    showToast('Notifications not supported in this browser');
                  }
                }}
                onTestNotification={() => {
                  if ('Notification' in window && Notification.permission === 'granted') {
                    new Notification('Sales CRM Alert', {
                      body: 'Test notification working properly.',
                    });
                    showToast('Notification sent');
                  } else {
                    showToast('Enable notification permission first');
                  }
                }}
                onEraseAll={handleEraseCompleteDb}
                leadsCount={db.leads.length}
              />
            )}

            {currentTab === 'activity' && (
              <ActivityTab
                activity={db.activity}
                onClearActivity={() => {
                  updateDb((prev) => ({ ...prev, activity: [] }));
                  showToast('Activity log cleared');
                }}
              />
            )}
          </div>
        </div>

        {/* Floating Quick Operations Launcher */}
        <QuickToolsDrawer />

        {/* Toast notifications */}
        <Toast message={toastMessage} onClose={() => setToastMessage(null)} />

        {/* Delete Confirmation Dialog */}
        {deleteModalConfig && deleteModalConfig.isOpen && (
          <DeleteConfirmModal
            title={deleteModalConfig.title}
            description={deleteModalConfig.description}
            onConfirm={deleteModalConfig.action}
            onClose={() => setDeleteModalConfig(null)}
          />
        )}
      </div>
    </div>
  );
}
