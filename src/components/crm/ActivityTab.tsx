import React from 'react';
import { Trash2 } from 'lucide-react';
import { ActivityEntry } from '../../types';

interface ActivityTabProps {
  activity: ActivityEntry[];
  onClearActivity: () => void;
}

export const ActivityTab: React.FC<ActivityTabProps> = ({
  activity,
  onClearActivity,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-zinc-100">
            System Activity & Audit Log
          </h2>
          <p className="text-xs text-zinc-400">
            Timestamped local record of every action, lead update, call, and payment.
          </p>
        </div>
        {activity.length > 0 && (
          <button
            type="button"
            onClick={onClearActivity}
            className="h-8 px-3 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5 text-zinc-400" />
            <span>Clear Log</span>
          </button>
        )}
      </div>

      <div className="rounded-xl border border-white/10 bg-[#0e1114] overflow-x-auto">
        <table className="w-full border-collapse text-left text-xs min-w-[600px]">
          <thead>
            <tr className="border-b border-white/10 bg-[#0c0f12] text-zinc-400 text-[10px] uppercase tracking-wider font-bold">
              <th className="p-3">Time</th>
              <th className="p-3">Category</th>
              <th className="p-3">Activity Description</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-zinc-200">
            {activity.length === 0 ? (
              <tr>
                <td colSpan={3} className="p-8 text-center text-zinc-500">
                  No activity logged yet.
                </td>
              </tr>
            ) : (
              activity.map((item) => {
                const d = new Date(item.at);
                return (
                  <tr key={item.id} className="hover:bg-white/[0.02]">
                    <td className="p-3 whitespace-nowrap text-zinc-400">
                      {d.toLocaleDateString()} {d.toLocaleTimeString()}
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-zinc-900 border border-white/10 text-zinc-300">
                        {item.type}
                      </span>
                    </td>
                    <td className="p-3 text-zinc-200">{item.text}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
