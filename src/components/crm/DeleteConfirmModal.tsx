import React, { useState } from 'react';
import { AlertTriangle } from 'lucide-react';

interface DeleteConfirmModalProps {
  title: string;
  description: string;
  onConfirm: () => void;
  onClose: () => void;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  title,
  description,
  onConfirm,
  onClose,
}) => {
  const [typedConfirm, setTypedConfirm] = useState('');

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl bg-[#0e1012] border border-rose-500/30 p-5 shadow-2xl space-y-3">
        <div className="flex items-center gap-2 text-rose-400">
          <AlertTriangle className="w-5 h-5" />
          <h3 className="text-base font-bold text-zinc-100">{title}</h3>
        </div>

        <p className="text-xs text-zinc-300 leading-relaxed">{description}</p>

        <div className="pt-1">
          <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">
            Type <span className="text-rose-400 font-black">DELETE</span> to confirm
          </label>
          <input
            type="text"
            value={typedConfirm}
            onChange={(e) => setTypedConfirm(e.target.value)}
            placeholder="DELETE"
            className="w-full h-8 px-2.5 rounded-lg bg-[#080a0c] border border-rose-500/30 text-xs text-zinc-100 outline-none focus:border-rose-400"
          />
        </div>

        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="h-8 px-3 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={typedConfirm !== 'DELETE'}
            onClick={onConfirm}
            className="h-8 px-4 rounded-lg bg-rose-600 hover:bg-rose-500 disabled:opacity-30 disabled:pointer-events-none text-white text-xs font-bold transition-colors"
          >
            Confirm Delete
          </button>
        </div>
      </div>
    </div>
  );
};
