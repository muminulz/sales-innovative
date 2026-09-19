import React, { useRef } from 'react';
import {
  Download,
  Upload,
  FileSpreadsheet,
  Bell,
  Volume2,
  Trash2,
} from 'lucide-react';
import { AppSettings } from '../../types';

interface DataTabProps {
  settings: AppSettings;
  onUpdateSettings: (settings: AppSettings) => void;
  onExportJson: () => void;
  onImportJson: (file: File) => void;
  onExportSalesCsv: () => void;
  onImportSalesCsv: (file: File) => void;
  onTestSound: () => void;
  onEnableNotification: () => void;
  onTestNotification: () => void;
  onEraseAll: () => void;
  leadsCount: number;
}

export const DataTab: React.FC<DataTabProps> = ({
  settings,
  onUpdateSettings,
  onExportJson,
  onImportJson,
  onExportSalesCsv,
  onImportSalesCsv,
  onTestSound,
  onEnableNotification,
  onTestNotification,
  onEraseAll,
  leadsCount,
}) => {
  const jsonFileInputRef = useRef<HTMLInputElement>(null);
  const csvFileInputRef = useRef<HTMLInputElement>(null);

  const handleJsonSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImportJson(file);
      e.target.value = '';
    }
  };

  const handleCsvSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImportSalesCsv(file);
      e.target.value = '';
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg sm:text-xl font-bold text-zinc-100">
          Data Center & System Settings
        </h2>
        <p className="text-xs text-zinc-400">
          Export full backups, import Excel/Google Sheets sales spreadsheets, and configure audio & alert reminders.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Full CRM JSON Backup Card */}
        <div className="p-4 rounded-xl border border-white/10 bg-[#0e1114] space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-200">
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Complete CRM Backup (JSON)</span>
          </div>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Exports every single lead, custom note, call history, scheduled follow-up, payment transaction, task, and activity log.
          </p>
          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={onExportJson}
              className="h-8 px-3 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export JSON</span>
            </button>

            <button
              type="button"
              onClick={() => jsonFileInputRef.current?.click()}
              className="h-8 px-3 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-white/10 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Import JSON</span>
            </button>
            <input
              type="file"
              ref={jsonFileInputRef}
              accept=".json,application/json"
              onChange={handleJsonSelect}
              className="hidden"
            />
          </div>
        </div>

        {/* Sales Sheet CSV Card */}
        <div className="p-4 rounded-xl border border-white/10 bg-[#0e1114] space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-200">
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>Sales Sheet (Google Sheets / Excel)</span>
          </div>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Standard 11 columns: <b>Name, Email, Phone Number, Course Name, Contact Date, Purchase Date, total, Paid Amount, Due Amount, Remark, Sourse</b>.
          </p>
          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={onExportSalesCsv}
              className="h-8 px-3 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>

            <button
              type="button"
              onClick={() => csvFileInputRef.current?.click()}
              className="h-8 px-3 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-white/10 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Import CSV</span>
            </button>
            <input
              type="file"
              ref={csvFileInputRef}
              accept=".csv,.tsv,text/csv,text/tab-separated-values"
              onChange={handleCsvSelect}
              className="hidden"
            />
          </div>
        </div>
      </div>

      {/* Notifications & Reminders */}
      <div className="p-4 rounded-xl border border-white/10 bg-[#0e1114] space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-200">
          <Bell className="w-4 h-4 text-cyan-400" />
          <span>Follow-up Alerts & Audio Settings</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <label className="flex items-center gap-2 text-xs text-zinc-300">
            <input
              type="checkbox"
              checked={settings.sound}
              onChange={(e) =>
                onUpdateSettings({ ...settings, sound: e.target.checked })
              }
              className="rounded bg-zinc-900 border-zinc-700 text-emerald-500"
            />
            <span>Audio bell for reminders</span>
          </label>

          <label className="flex items-center gap-2 text-xs text-zinc-300">
            <input
              type="checkbox"
              checked={settings.notify}
              onChange={(e) =>
                onUpdateSettings({ ...settings, notify: e.target.checked })
              }
              className="rounded bg-zinc-900 border-zinc-700 text-emerald-500"
            />
            <span>Windows / Browser Notification</span>
          </label>

          <div>
            <span className="block text-[10px] text-zinc-500 uppercase font-bold mb-1">
              Alert before follow-up (min)
            </span>
            <input
              type="number"
              min="5"
              max="180"
              value={settings.leadMinutes}
              onChange={(e) =>
                onUpdateSettings({
                  ...settings,
                  leadMinutes: Number(e.target.value) || 30,
                })
              }
              className="w-24 h-7 px-2 rounded-lg bg-[#080a0c] border border-white/10 text-xs text-zinc-200"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 pt-2 border-t border-white/5">
          <button
            type="button"
            onClick={onEnableNotification}
            className="h-8 px-3 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
          >
            <Bell className="w-3.5 h-3.5" />
            <span>Request Notification Permission</span>
          </button>
          <button
            type="button"
            onClick={onTestNotification}
            className="h-8 px-3 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold"
          >
            Test Notification
          </button>
          <button
            type="button"
            onClick={onTestSound}
            className="h-8 px-3 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold flex items-center gap-1.5"
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>Test Sound</span>
          </button>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="p-4 rounded-xl border border-rose-500/20 bg-rose-950/10 space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-rose-300">
          <Trash2 className="w-4 h-4 text-rose-400" />
          <span>Danger Zone</span>
        </div>
        <p className="text-xs text-rose-200/70">
          Permanently deletes all {leadsCount} local leads, calls, tasks, follow-ups, and activity records.
        </p>
        <button
          type="button"
          onClick={onEraseAll}
          className="h-8 px-4 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-bold cursor-pointer"
        >
          Erase Complete Local CRM Database
        </button>
      </div>
    </div>
  );
};
