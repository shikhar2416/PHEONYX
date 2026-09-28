import { Coffee, CalendarX } from 'lucide-react';
import { type EngineResult } from '@/lib/engine';
import { formatShort } from '@/lib/dates';

interface BunkBudgetProps {
  result: EngineResult;
}

export default function BunkBudget({ result }: BunkBudgetProps) {
  const { aggregate } = result;
  const bunks = aggregate.bunksAllowed75;
  const safeDate = result.subjects.find((s) => s.safeUntilDate)?.safeUntilDate;

  return (
    <div className="glass-card bg-gradient-to-br from-amber-500/10 to-amber-500/5 border border-amber-500/20 rounded-2xl p-5">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
          <Coffee className="w-5 h-5 text-amber-400" />
        </div>
        <div>
          <h3 className="font-heading font-semibold text-white text-sm">Bunk Budget</h3>
          <p className="text-xs text-slate-400">How many more classes you can safely miss</p>
        </div>
      </div>
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="text-3xl font-bold font-heading text-amber-400 tabular-nums">{bunks}</div>
          <div className="text-xs text-slate-500">classes you can bunk</div>
        </div>
        <div className="text-right">
          {safeDate ? (
            <>
              <div className="flex items-center gap-1.5 text-sm text-white">
                <CalendarX className="w-4 h-4 text-rose-400" />
                {formatShort(safeDate)}
              </div>
              <div className="text-xs text-slate-500 mt-0.5">last safe bunk date</div>
            </>
          ) : (
            <div className="text-sm text-slate-500">No safe bunk date available</div>
          )}
        </div>
      </div>
    </div>
  );
}
