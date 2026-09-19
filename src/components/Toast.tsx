import React from 'react';
import { X, AlertCircle } from 'lucide-react';

interface ToastProps {
  message: string | null;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, onClose }) => {
  if (!message) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 max-w-sm px-4 py-3 rounded-xl bg-zinc-900/95 border border-white/15 text-zinc-100 shadow-2xl backdrop-blur-xl flex items-center gap-3 text-xs font-semibold animate-in fade-in slide-in-from-bottom-3 duration-200">
      <AlertCircle className="w-4 h-4 text-emerald-400 flex-none" />
      <span className="flex-1">{message}</span>
      <button
        type="button"
        onClick={onClose}
        className="p-1 text-zinc-400 hover:text-white"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
