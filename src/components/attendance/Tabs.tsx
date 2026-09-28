import { LayoutDashboard, BookOpen, Coffee, CalendarDays } from 'lucide-react';

export type TabId = 'overview' | 'subjects' | 'leaves' | 'timetable';

interface TabsProps {
  active: TabId;
  onChange: (tab: TabId) => void;
}

const tabs: { id: TabId; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'subjects', label: 'Subject-wise', icon: BookOpen },
  { id: 'leaves', label: 'Leave Tracker', icon: Coffee },
  { id: 'timetable', label: 'Timetable', icon: CalendarDays },
];

export default function Tabs({ active, onChange }: TabsProps) {
  return (
    <div className="flex gap-1 p-1 rounded-xl bg-white/5 border border-white/10 overflow-x-auto">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
            active === tab.id
              ? 'bg-gradient-to-r from-emerald-400 to-cyan-400 text-base-900 shadow-lg shadow-emerald-500/20'
              : 'text-slate-300 hover:text-white hover:bg-white/5'
          }`}
        >
          <tab.icon className="w-4 h-4" />
          {tab.label}
        </button>
      ))}
    </div>
  );
}
