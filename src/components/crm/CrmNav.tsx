import React from 'react';

export type CrmTab =
  | 'dashboard'
  | 'leads'
  | 'followups'
  | 'calls'
  | 'sales'
  | 'courses'
  | 'mentors'
  | 'reports'
  | 'tasks'
  | 'data'
  | 'activity';

interface CrmNavProps {
  currentTab: CrmTab;
  onSelectTab: (tab: CrmTab) => void;
  counts: {
    leads: number;
    followups: number;
    calls: number;
    sales: number;
    meetings?: number;
  };
}

export const CrmNav: React.FC<CrmNavProps> = ({
  currentTab,
  onSelectTab,
  counts,
}) => {
  const tabs: { id: CrmTab; label: string; count?: number }[] = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'leads', label: 'Leads', count: counts.leads },
    { id: 'followups', label: 'Follow-ups', count: counts.followups },
    { id: 'calls', label: 'Calls', count: counts.calls },
    { id: 'sales', label: 'Sales & Payments', count: counts.sales },
    { id: 'courses', label: 'Courses' },
    { id: 'mentors', label: 'Mentors & Meetings', count: counts.meetings },
    { id: 'reports', label: 'Reports' },
    { id: 'tasks', label: 'Tasks' },
    { id: 'data', label: 'Data & Settings' },
    { id: 'activity', label: 'Activity' },
  ];

  return (
    <div className="flex items-center gap-1.5 p-2 overflow-x-auto border-b border-white/10 bg-[#0c0f12] scrollbar-none">
      {tabs.map((tab) => {
        const isActive = currentTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onSelectTab(tab.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
              isActive
                ? 'bg-zinc-100 text-zinc-950 font-bold shadow-sm'
                : 'text-zinc-400 hover:text-zinc-100 hover:bg-white/5 border border-transparent'
            }`}
          >
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                  isActive
                    ? 'bg-zinc-300 text-zinc-900'
                    : 'bg-zinc-800 text-zinc-400'
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
