import React, { useState } from 'react';
import { Plus, CheckSquare, Square } from 'lucide-react';
import { Task } from '../../types';
import { todayIso } from '../../utils/storage';

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
  const [note, setNote] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onAddTask({
      title: title.trim(),
      due,
      note: note.trim(),
      done: false,
    });
    setTitle('');
    setNote('');
  };

  const sortedTasks = [...tasks].sort((a, b) => {
    if (a.done !== b.done) return a.done ? 1 : -1;
    return String(a.due || '').localeCompare(String(b.due || ''));
  });

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg sm:text-xl font-bold text-zinc-100">
          Daily Sales & Admin Tasks
        </h2>
        <p className="text-xs text-zinc-400">
          Operational to-do list: callbacks, webinar reminders, data entry, and follow-ups.
        </p>
      </div>

      {/* Task Creation Form */}
      <form
        onSubmit={handleSubmit}
        className="p-3.5 rounded-xl border border-white/10 bg-[#0e1114] grid grid-cols-1 sm:grid-cols-4 gap-2.5 items-end"
      >
        <div className="sm:col-span-2">
          <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">
            Task Description
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Call 10 Backend AI leads, verify bKash receipt…"
            className="w-full h-8 px-2.5 rounded-lg bg-[#080a0c] border border-white/10 text-xs text-zinc-200 outline-none focus:border-emerald-500/50"
          />
        </div>

        <div>
          <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">
            Due Date
          </label>
          <input
            type="date"
            value={due}
            onChange={(e) => setDue(e.target.value)}
            className="w-full h-8 px-2.5 rounded-lg bg-[#080a0c] border border-white/10 text-xs text-zinc-200 outline-none focus:border-emerald-500/50"
          />
        </div>

        <button
          type="submit"
          className="h-8 px-4 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Add Task</span>
        </button>
      </form>

      {/* Tasks List */}
      <div className="rounded-xl border border-white/10 bg-[#0e1114] overflow-x-auto">
        <table className="w-full border-collapse text-left text-xs min-w-[500px]">
          <thead>
            <tr className="border-b border-white/10 bg-[#0c0f12] text-zinc-400 text-[10px] uppercase tracking-wider font-bold">
              <th className="p-3 w-8"></th>
              <th className="p-3">Task</th>
              <th className="p-3">Due Date</th>
              <th className="p-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-zinc-200">
            {sortedTasks.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-8 text-center text-zinc-500">
                  No tasks recorded. Add a new task above!
                </td>
              </tr>
            ) : (
              sortedTasks.map((t) => (
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
                  <td className="p-3 text-zinc-400">{t.due || '—'}</td>
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
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
