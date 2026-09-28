import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { type SubjectResult } from '@/lib/engine';
import { fmtPct } from '@/lib/format';

interface MathDrawerProps {
  subject: SubjectResult;
}

export default function MathDrawer({ subject }: MathDrawerProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-t border-white/5 mt-3 pt-3">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-emerald-400 transition-colors"
      >
        {open ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        Show the math
      </button>
      {open && (
        <div className="mt-3 space-y-2 text-xs font-mono text-slate-400 bg-base-900/50 rounded-lg p-3">
          <div>
            <span className="text-slate-500">Formula:</span>{' '}
            needed = ceil(target × (C + R) − A)
          </div>
          <div className="text-slate-300">For 75%:</div>
          <div className="pl-4">
            needed = ceil(0.75 × ({subject.conducted} + {subject.remaining}) − {subject.attended})
          </div>
          <div className="pl-4">
            needed = ceil(0.75 × {subject.conducted + subject.remaining} − {subject.attended})
          </div>
          <div className="pl-4 text-emerald-400">
            = {subject.needed75} (clamped to {subject.clampedNeeded75} of {subject.remaining})
          </div>
          <div className="text-slate-300 mt-2">For 90%:</div>
          <div className="pl-4">
            needed = ceil(0.90 × ({subject.conducted} + {subject.remaining}) − {subject.attended})
          </div>
          <div className="pl-4 text-cyan-400">
            = {subject.needed90} (clamped to {subject.clampedNeeded90} of {subject.remaining})
          </div>
          <div className="mt-2 text-slate-300">Projections:</div>
          <div className="pl-4">
            Current: {fmtPct(subject.currentPct)} · Best: {fmtPct(subject.maxPossiblePct)} · Worst: {fmtPct(subject.minPossiblePct)}
          </div>
        </div>
      )}
    </div>
  );
}
