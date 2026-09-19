import React from 'react';
import { DollarSign, FileSpreadsheet, Plus } from 'lucide-react';
import { Lead, Payment } from '../../types';
import { stageLabel } from '../../utils/storage';

interface SalesTabProps {
  leads: Lead[];
  payments: Payment[];
  onOpenLead: (lead: Lead) => void;
  onRecordPayment: (lead?: Lead) => void;
  onExportSales: () => void;
}

export const SalesTab: React.FC<SalesTabProps> = ({
  leads,
  payments,
  onOpenLead,
  onRecordPayment,
  onExportSales,
}) => {
  const totalPaid = leads.reduce((s, l) => s + Number(l.paid || 0), 0);
  const totalDue = leads.reduce((s, l) => s + Number(l.due || 0), 0);
  const totalPipeline = leads.reduce(
    (s, l) => s + Number(l.total || l.value || 0),
    0
  );

  const paymentLeads = leads.filter(
    (l) => Number(l.paid || 0) > 0 || Number(l.due || 0) > 0
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-zinc-100">
            Sales & Payment Tracker
          </h2>
          <p className="text-xs text-zinc-400">
            Payment state is calculated locally and syncs with your Google Sheets/Excel format.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onExportSales}
            className="h-9 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-white/10 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>Export Sales CSV</span>
          </button>
          <button
            type="button"
            onClick={() => onRecordPayment()}
            className="h-9 px-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md shadow-emerald-500/20"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Record Payment</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="p-3.5 rounded-xl border border-white/10 bg-[#0e1114]">
          <div className="text-[10px] font-bold uppercase text-zinc-400">
            Total Collected
          </div>
          <div className="text-2xl font-black text-emerald-400 mt-1">
            ৳{totalPaid.toLocaleString()}
          </div>
        </div>
        <div className="p-3.5 rounded-xl border border-white/10 bg-[#0e1114]">
          <div className="text-[10px] font-bold uppercase text-zinc-400">
            Total Outstanding
          </div>
          <div className="text-2xl font-black text-amber-400 mt-1">
            ৳{totalDue.toLocaleString()}
          </div>
        </div>
        <div className="p-3.5 rounded-xl border border-white/10 bg-[#0e1114]">
          <div className="text-[10px] font-bold uppercase text-zinc-400">
            Total Pipeline Value
          </div>
          <div className="text-2xl font-black text-zinc-200 mt-1">
            ৳{totalPipeline.toLocaleString()}
          </div>
        </div>
        <div className="p-3.5 rounded-xl border border-white/10 bg-[#0e1114]">
          <div className="text-[10px] font-bold uppercase text-zinc-400">
            Total Transactions
          </div>
          <div className="text-2xl font-black text-cyan-400 mt-1">
            {payments.length}
          </div>
        </div>
      </div>

      {/* Leads with Financial Status */}
      <div className="p-4 rounded-xl border border-white/10 bg-[#0e1114]">
        <div className="text-xs font-bold uppercase tracking-wider text-zinc-200 mb-3 flex items-center gap-1.5">
          <DollarSign className="w-4 h-4 text-emerald-400" />
          <span>Student Payment Balances</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs min-w-[650px]">
            <thead>
              <tr className="border-b border-white/10 text-zinc-400 text-[10px] uppercase font-bold">
                <th className="py-2.5 px-3">Lead</th>
                <th className="py-2.5 px-3">Course</th>
                <th className="py-2.5 px-3">Total Value</th>
                <th className="py-2.5 px-3">Paid</th>
                <th className="py-2.5 px-3">Due</th>
                <th className="py-2.5 px-3">Stage</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-zinc-200">
              {paymentLeads.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-6 text-center text-zinc-500">
                    No payment records yet. Record a payment or set values in a lead.
                  </td>
                </tr>
              ) : (
                paymentLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-white/[0.02]">
                    <td className="py-2.5 px-3 font-bold text-zinc-100">
                      {lead.name || lead.phone || 'Unnamed'}
                    </td>
                    <td className="py-2.5 px-3 text-zinc-400 max-w-xs truncate">
                      {lead.course || '—'}
                    </td>
                    <td className="py-2.5 px-3 font-semibold">
                      ৳{Number(lead.total || 0).toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 text-emerald-400 font-bold">
                      ৳{Number(lead.paid || 0).toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 text-amber-400 font-bold">
                      ৳{Number(lead.due || 0).toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] bg-zinc-900 border border-white/10">
                        {stageLabel(lead.stage)}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => onRecordPayment(lead)}
                          className="h-7 px-2 rounded-md bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold cursor-pointer"
                        >
                          + Pay
                        </button>
                        <button
                          type="button"
                          onClick={() => onOpenLead(lead)}
                          className="h-7 px-2.5 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-[10px] font-bold cursor-pointer"
                        >
                          Open
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Transaction History */}
      <div className="p-4 rounded-xl border border-white/10 bg-[#0e1114]">
        <div className="text-xs font-bold uppercase tracking-wider text-zinc-200 mb-3">
          Recent Payment Transactions
        </div>
        <div className="space-y-2">
          {payments.length === 0 ? (
            <div className="text-xs text-zinc-500 text-center py-4">
              No transactions logged yet.
            </div>
          ) : (
            payments.slice(0, 10).map((p) => {
              const lead = leads.find((l) => l.id === p.leadId);
              return (
                <div
                  key={p.id}
                  className="p-2.5 rounded-lg border border-white/5 bg-black/20 flex items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <span className="font-bold text-zinc-200">
                      {lead?.name || 'Customer'}
                    </span>
                    <span className="text-zinc-400 ml-2">
                      via {p.method} {p.note ? `(${p.note})` : ''}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[11px] text-zinc-500">{p.date}</span>
                    <span className="font-bold text-emerald-400">
                      +৳{Number(p.amount || 0).toLocaleString()}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
