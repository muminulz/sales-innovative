import React, { useState } from 'react';
import { Plus, CheckSquare, Square, Calendar, Clock } from 'lucide-react';
import { Task } from '../../types';
import { todayIso, nowTimeIso, formatDisplayDateTime } from '../../utils/dateTime';

interface TasksTabProps {
  tasks: Task[];
  onAddTask: (task: Omit<Task, 'id'>) => void;
  onToggleTask: (taskId: string) => void;
}

export const TasksTab: React.FC<TasksTabProps> = ({
  tasks,
  onAddTask,
  onToggleTask,
}) => {
  const [title, setTitle] = useState('');
  const [due, setDue] = useState(todayIso());
  const [dueTime, setDueTime] = useState(nowTimeIso());
  const [note, setNote] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onAddTask({
      title: title.trim(),
      due,
      dueTime,
      note: note.trim(),
      done: false,
    });
    setTitle('');
    setNote('');
  };

  const sortedTasks = [...tasks].sort((a, b) => {
    if (a.done !== b.done) return a.done ? 1 : -1;
    const aKey = `${a.due || ''} ${a.dueTime || ''}`;
    const bKey = `${b.due || ''} ${b.dueTime || ''}`;
    return aKey.localeCompare(bKey);
  });

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg sm:text-xl font-bold text-zinc-100">
          Daily Sales & Admin Tasks
        </h2>
        <p className="text-xs text-zinc-400">
          Operational to-do list with explicit due date and scheduled time for callbacks and reminders.
        </p>
      </div>

      {/* Task Creation Form with Date and Time */}
      <form
        onSubmit={handleSubmit}
        className="p-4 rounded-xl border border-white/10 bg-[#0e1114] grid grid-cols-1 sm:grid-cols-12 gap-3 items-end shadow-sm"
      >
        <div className="sm:col-span-5">
          <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">
            Task Description <span className="text-rose-400">*</span>
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Call 10 Backend AI leads, verify bKash receipt…"
            className="w-full h-9 px-3 rounded-lg bg-[#080a0c] border border-white/10 text-xs text-zinc-200 outline-none focus:border-emerald-500/50"
          />
        </div>

        <div className="sm:col-span-3">
          <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1 flex items-center gap-1">
            <Calendar className="w-3 h-3 text-emerald-400" />
            <span>Due Date</span>
            <span className="text-rose-400">*</span>
          </label>
          <input
            type="date"
            required
            value={due}
            onChange={(e) => setDue(e.target.value)}
            className="w-full h-9 px-2.5 rounded-lg bg-[#080a0c] border border-white/10 text-xs text-zinc-200 outline-none focus:border-emerald-500/50"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1 flex items-center gap-1">
            <Clock className="w-3 h-3 text-emerald-400" />
            <span>Due Time</span>
            <span className="text-rose-400">*</span>
          </label>
          <input
            type="time"
            required
            value={dueTime}
            onChange={(e) => setDueTime(e.target.value)}
            className="w-full h-9 px-2.5 rounded-lg bg-[#080a0c] border border-white/10 text-xs text-zinc-200 outline-none focus:border-emerald-500/50"
          />
        </div>

        <div className="sm:col-span-2">
          <button
            type="submit"
            className="w-full h-9 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-emerald-500/20 active:scale-95 transition-all"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Add Task</span>
          </button>
        </div>
      </form>

      {/* Tasks List */}
      <div className="rounded-xl border border-white/10 bg-[#0e1114] overflow-x-auto">
        <table className="w-full border-collapse text-left text-xs min-w-[550px]">
          <thead>
            <tr className="border-b border-white/10 bg-[#0c0f12] text-zinc-400 text-[10px] uppercase tracking-wider font-bold">
              <th className="p-3 w-8"></th>
              <th className="p-3">Task</th>
              <th className="p-3">Due Date & Time</th>
              <th className="p-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-zinc-200">
            {sortedTasks.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-8 text-center text-zinc-500">
                  No tasks recorded. Add your first sales or admin task above!
                </td>
              </tr>
            ) : (
              sortedTasks.map((t) => {
                const dt = formatDisplayDateTime(t.due, t.dueTime);
                return (
                  <tr
                    key={t.id}
                    onClick={() => onToggleTask(t.id)}
                    className="hover:bg-white/[0.02] cursor-pointer transition-colors"
                  >
                    <td className="p-3 text-center">
                      {t.done ? (
                        <CheckSquare className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <Square className="w-4 h-4 text-zinc-500" />
                      )}
                    </td>
                    <td className={`p-3 font-semibold ${t.done ? 'line-through text-zinc-500' : 'text-zinc-100'}`}>
                      {t.title}
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <span className="text-zinc-200 font-medium flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-zinc-400" />
                          <span>{dt.dateFormatted}</span>
                        </span>
                        {dt.timeFormatted && (
                          <span className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-[10px] font-mono text-emerald-300 flex items-center gap-1">
                            <Clock className="w-2.5 h-2.5" />
                            <span>{dt.timeFormatted}</span>
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          t.done
                            ? 'bg-emerald-950/30 text-emerald-400 border border-emerald-500/20'
                            : 'bg-zinc-800 text-zinc-300'
                        }`}
                      >
                        {t.done ? 'Done' : 'Open'}
                      </span>
                    </td>
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
