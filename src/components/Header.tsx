import React from 'react';
import { PhoneCall, Copy, Save, Eraser, ArrowDown } from 'lucide-react';

interface HeaderProps {
  hasPhone: boolean;
  hasEmail: boolean;
  onMakeCall: () => void;
  onCopyAll: () => void;
  onSaveLead: () => void;
  onClear?: () => void;
  onReset?: () => void;
  onScrollToCrm: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  hasPhone,
  onMakeCall,
  onCopyAll,
  onSaveLead,
  onClear,
  onReset,
  onScrollToCrm,
}) => {
  const handleClear = onClear || onReset || (() => {});

  return (
    <header className="h-[60px] mb-5 px-3 py-2 border border-white/10 rounded-2xl bg-[#090b0a]/85 backdrop-blur-xl shadow-xl flex items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMakeCall}
          className={`h-10 min-w-[104px] px-4 rounded-xl border border-emerald-400/30 flex items-center justify-center gap-2 font-bold text-xs transition-all shadow-lg ${
            hasPhone
              ? 'bg-gradient-to-b from-emerald-400 to-emerald-600 text-black hover:brightness-110 active:scale-95 cursor-pointer shadow-emerald-500/20'
              : 'bg-emerald-950/40 text-emerald-300/40 border-emerald-900/30 cursor-not-allowed'
          }`}
          title={hasPhone ? 'Call extracted number' : 'Extract phone number first'}
        >
          <PhoneCall className="w-4 h-4 stroke-[2.5]" />
          <span>Call</span>
        </button>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-2">
        <button
          type="button"
          onClick={onCopyAll}
          className="h-9 px-2.5 sm:px-3 rounded-lg text-[11px] font-semibold text-zinc-300 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/10 transition-colors flex items-center gap-1.5 cursor-pointer"
          title="Copy contact bundle"
        >
          <Copy className="w-3.5 h-3.5 text-zinc-400" />
          <span className="hidden sm:inline">Copy bundle</span>
        </button>

        <button
          type="button"
          onClick={onSaveLead}
          className="h-9 px-2.5 sm:px-3 rounded-lg text-[11px] font-semibold text-emerald-300 hover:text-emerald-200 bg-emerald-950/30 hover:bg-emerald-900/40 border border-emerald-500/20 hover:border-emerald-500/35 transition-colors flex items-center gap-1.5 cursor-pointer"
          title="Save extracted lead to CRM"
        >
          <Save className="w-3.5 h-3.5 text-emerald-400" />
          <span>Save Lead +</span>
        </button>

        <button
          type="button"
          onClick={onScrollToCrm}
          className="h-9 px-2.5 sm:px-3 rounded-lg text-[11px] font-semibold text-zinc-300 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/10 transition-colors flex items-center gap-1.5 cursor-pointer"
          title="Jump down to Sales CRM"
        >
          <ArrowDown className="w-3.5 h-3.5 text-zinc-400" />
          <span className="hidden sm:inline">CRM</span>
        </button>

        <span className="w-px h-5 bg-white/10 mx-0.5" />

        {/* Clear on top replaces Reset button */}
        <button
          type="button"
          onClick={handleClear}
          className="h-9 px-3 rounded-lg text-xs font-semibold text-rose-300 hover:text-rose-200 bg-rose-950/40 hover:bg-rose-900/50 border border-rose-500/30 hover:border-rose-500/50 transition-all flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95"
          title="Clear workspace text, active lead & form"
        >
          <Eraser className="w-3.5 h-3.5 text-rose-400" />
          <span>Clear</span>
        </button>
      </div>
    </header>
  );
};
