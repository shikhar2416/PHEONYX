import { Coffee } from 'lucide-react';
import { getLeaveBudget } from '@/lib/leaves';
import { useStudent } from '@/context/StudentContext';
import { todayISO } from '@/lib/dates';

export default function LeaveBudget() {
  const { inputs, sectionKey, plannedLeaves } = useStudent();
  const today = todayISO();
  const budget = getLeaveBudget(inputs, sectionKey, today, plannedLeaves);
  const totalAvailable = budget.reduce((sum, b) => sum + b.available, 0);

  return (
    <div className="glass-card bg-gradient-to-br from-amber-500/10 to-amber-500/5 border border-amber-500/20 rounded-2xl p-5">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
          <Coffee className="w-5 h-5 text-amber-400" />
        </div>
        <div>
          <h3 className="font-heading font-semibold text-white text-sm">Leave Budget</h3>
          <p className="text-xs text-slate-400">How many more classes you can safely miss</p>
        </div>
      </div>
      <div className="text-3xl font-bold font-heading text-amber-400 tabular-nums mb-4">
        {totalAvailable}
        <span className="text-sm text-slate-500 ml-2">total leaves left</span>
      </div>
      <div className="space-y-2.5">
        {budget.map((b) => {
          const pct = b.total > 0 ? (b.used / b.total) * 100 : 0;
          return (
            <div key={b.code} className="flex items-center gap-3">
              <span className="text-xs text-slate-400 w-32 truncate font-mono">{b.code}</span>
              <div className="flex-1 h-2 rounded-full bg-white/5 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${b.available > 0 ? 'bg-amber-400' : 'bg-rose-500'}`}
                  style={{ width: `${Math.min(pct, 100)}%` }}
                />
              </div>
              <span className={`text-xs tabular-nums w-16 text-right ${b.available > 0 ? 'text-amber-400' : 'text-rose-400'}`}>
                {b.available} left
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
