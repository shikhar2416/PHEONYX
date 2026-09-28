import { useState } from 'react';
import { CalendarRange, CheckCircle, AlertCircle, XCircle } from 'lucide-react';
import { evaluateLeaveRange } from '@/lib/leaves';
import { todayISO } from '@/lib/dates';
import { SEMESTER } from '@/data/timetables';
import { useStudent } from '@/context/StudentContext';
import Button from '@/components/ui/Button';

export default function LeaveRangePlanner() {
  const { inputs, sectionKey } = useStudent();
  const today = todayISO();
  const [fromDate, setFromDate] = useState(today);
  const [toDate, setToDate] = useState(today);
  const [result, setResult] = useState<ReturnType<typeof evaluateLeaveRange> | null>(null);

  const handleEvaluate = () => {
    const res = evaluateLeaveRange(inputs, sectionKey, today, fromDate, toDate);
    setResult(res);
  };

  const verdictConfig = {
    APPROVED: { icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/30', label: 'APPROVED' },
    RISKY: { icon: AlertCircle, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/30', label: 'RISKY' },
    DENIED: { icon: XCircle, color: 'text-rose-400', bg: 'bg-rose-500/10 border-rose-500/30', label: 'DENIED' },
  };

  return (
    <div className="glass-card bg-white/5 border border-white/10 rounded-2xl p-5">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-cyan-500/15 flex items-center justify-center">
          <CalendarRange className="w-5 h-5 text-cyan-400" />
        </div>
        <div>
          <h3 className="font-heading font-semibold text-white text-sm">Day-Off Planner</h3>
          <p className="text-xs text-slate-400">Can I take leave from one date to another?</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="flex-1">
          <label className="text-xs text-slate-400 mb-1 block">From</label>
          <input
            type="date"
            value={fromDate}
            min={today}
            max={SEMESTER.end}
            onChange={(e) => setFromDate(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm [color-scheme:dark] focus:border-emerald-400/50"
          />
        </div>
        <div className="flex-1">
          <label className="text-xs text-slate-400 mb-1 block">To</label>
          <input
            type="date"
            value={toDate}
            min={fromDate}
            max={SEMESTER.end}
            onChange={(e) => setToDate(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm [color-scheme:dark] focus:border-emerald-400/50"
          />
        </div>
        <div className="flex items-end">
          <Button size="sm" onClick={handleEvaluate} className="w-full sm:w-auto">
            Check
          </Button>
        </div>
      </div>

      {result && (
        <div className="space-y-3">
          <div className={`flex items-center gap-2 px-4 py-3 rounded-xl border ${verdictConfig[result.verdict].bg}`}>
            {(() => {
              const VIcon = verdictConfig[result.verdict].icon;
              return <VIcon className={`w-5 h-5 ${verdictConfig[result.verdict].color}`} />;
            })()}
            <span className={`font-bold font-heading ${verdictConfig[result.verdict].color}`}>
              {verdictConfig[result.verdict].label}
            </span>
            <span className="text-xs text-slate-400 ml-2">
              {result.verdict === 'APPROVED' && 'You can safely take this leave period.'}
              {result.verdict === 'RISKY' && 'Taking this leave will put you at risk in some subjects.'}
              {result.verdict === 'DENIED' && 'This leave period would push you below 75% in some subjects.'}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-2 px-2 text-slate-400">Subject</th>
                  <th className="text-right py-2 px-2 text-slate-400">Current %</th>
                  <th className="text-right py-2 px-2 text-slate-400">Projected %</th>
                  <th className="text-center py-2 px-2 text-slate-400">Status</th>
                </tr>
              </thead>
              <tbody>
                {result.impacts.map((imp) => (
                  <tr key={imp.code} className="border-b border-white/5">
                    <td className="py-2 px-2 text-white font-mono">{imp.code}</td>
                    <td className="py-2 px-2 text-right text-slate-300 tabular-nums">{imp.currentPct}%</td>
                    <td className="py-2 px-2 text-right tabular-nums">
                      <span className={imp.projectedPct < 75 ? 'text-rose-400' : imp.projectedPct < 90 ? 'text-amber-400' : 'text-emerald-400'}>
                        {imp.projectedPct}%
                      </span>
                    </td>
                    <td className="py-2 px-2 text-center">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                        imp.status === 'SAFE' ? 'bg-emerald-500/15 text-emerald-400' :
                        imp.status === 'AT_RISK' ? 'bg-amber-500/15 text-amber-400' :
                        'bg-rose-500/15 text-rose-400'
                      }`}>
                        {imp.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
