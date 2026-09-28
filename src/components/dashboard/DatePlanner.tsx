import { CalendarClock, Zap } from 'lucide-react';
import { SEMESTER } from '@/data/timetables';
import { todayISO, addDays, formatShort, clampToSemester } from '@/lib/dates';

interface DatePlannerProps {
  planDate: string;
  onChange: (iso: string) => void;
}

export default function DatePlanner({ planDate, onChange }: DatePlannerProps) {
  const today = todayISO();
  const presets = [
    { label: '+1 Week', date: addDays(today, 7) },
    { label: '+1 Month', date: addDays(today, 30) },
    { label: 'Mid-sem', date: '2026-10-14' },
    { label: 'Semester end', date: SEMESTER.end },
  ];

  return (
    <div className="space-y-5">
      <div className="text-center">
        <h2 className="text-2xl sm:text-3xl font-bold font-heading text-white mb-2">
          Choose a planning date
        </h2>
        <p className="text-slate-400 text-sm">
          Pick any future date to see how many classes remain until then.
        </p>
      </div>

      <div className="max-w-md mx-auto space-y-4">
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
          <CalendarClock className="w-4 h-4 text-cyan-400" />
          <span className="text-sm text-cyan-200">Today: {formatShort(today)}</span>
        </div>

        <div>
          <label className="text-xs font-medium text-slate-400 mb-2 block">Planning date</label>
          <input
            type="date"
            value={planDate}
            min={today}
            max={SEMESTER.end}
            onChange={(e) => {
              const v = e.target.value;
              if (v) onChange(clampToSemester(v));
            }}
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:border-emerald-400/50 focus:bg-white/10 transition-colors [color-scheme:dark]"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {presets.map((p) => (
            <button
              key={p.label}
              onClick={() => onChange(clampToSemester(p.date))}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                planDate === p.date
                  ? 'bg-emerald-400/20 text-emerald-300 border border-emerald-400/30'
                  : 'bg-white/5 text-slate-300 border border-white/10 hover:bg-white/10'
              }`}
            >
              <Zap className="w-3 h-3" />
              {p.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
