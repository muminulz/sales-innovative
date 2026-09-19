import React, { useState } from 'react';
import { X, DollarSign } from 'lucide-react';
import { Lead } from '../../types';

interface PaymentModalProps {
  lead?: Lead;
  leads: Lead[];
  onSavePayment: (data: {
    leadId: string;
    amount: number;
    method: string;
    note: string;
  }) => void;
  onClose: () => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  lead,
  leads,
  onSavePayment,
  onClose,
}) => {
  const [selectedLeadId, setSelectedLeadId] = useState(lead ? lead.id : leads[0]?.id || '');
  const [amount, setAmount] = useState(lead ? lead.due || lead.total || 5000 : 5000);
  const [method, setMethod] = useState('bKash');
  const [note, setNote] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLeadId || amount <= 0) return;
    onSavePayment({
      leadId: selectedLeadId,
      amount: Number(amount),
      method,
      note,
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl bg-[#0d1013] border border-white/15 p-5 shadow-2xl">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-bold text-zinc-100">Record Payment</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-zinc-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">
              Select Lead / Student
            </label>
            <select
              value={selectedLeadId}
              onChange={(e) => setSelectedLeadId(e.target.value)}
              className="w-full h-8 px-2 rounded-lg bg-[#080a0c] border border-white/10 text-xs text-zinc-200"
            >
              {leads.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name || l.phone} ({l.course || 'No course'}) — Due: ৳{Number(l.due || 0).toLocaleString()}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">
                Amount (৳)
              </label>
              <input
                type="number"
                min="1"
                required
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full h-8 px-2.5 rounded-lg bg-[#080a0c] border border-white/10 text-xs text-zinc-200"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">
                Payment Method
              </label>
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value)}
                className="w-full h-8 px-2 rounded-lg bg-[#080a0c] border border-white/10 text-xs text-zinc-200"
              >
                <option>bKash</option>
                <option>Nagad</option>
                <option>Bank Transfer</option>
                <option>Cash</option>
                <option>Card / POS</option>
                <option>Other</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">
              Reference / TrxID / Note
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. TrxID 9K2L1P or Batch 12 first installment"
              className="w-full h-8 px-2.5 rounded-lg bg-[#080a0c] border border-white/10 text-xs text-zinc-200"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="h-8 px-3 rounded-lg bg-zinc-800 text-zinc-300 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="h-8 px-4 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold"
            >
              Confirm Payment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
