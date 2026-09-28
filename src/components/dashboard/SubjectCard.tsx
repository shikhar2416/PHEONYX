import { useState } from 'react';
import { motion } from 'framer-motion';
import { type SubjectResult } from '@/lib/engine';
import Pill from '@/components/ui/Pill';
import MathDrawer from './MathDrawer';
import { fmtPct } from '@/lib/format';

interface SubjectCardProps {
  subject: SubjectResult;
}

export default function SubjectCard({ subject }: SubjectCardProps) {
  const [expanded, setExpanded] = useState(false);
  const s = subject;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-5"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono text-emerald-400 bg-emerald-400/10 px-1.5 py-0.5 rounded">
              {s.code}
            </span>
            <Pill type={s.status} className="text-[10px]" />
          </div>
          <h3 className="text-sm font-medium text-white truncate">{s.name}</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Credits: {s.credits} · {s.weeklyFrequency}×/week
          </p>
        </div>
        <div className="text-right flex-shrink-0">
          <div className="text-2xl font-bold font-heading text-white tabular-nums">
            {fmtPct(s.currentPct, 0)}
          </div>
          <div className="text-xs text-slate-500">
            {s.attended}/{s.conducted}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="px-3 py-2 rounded-lg bg-white/5">
          <span className="text-slate-500">For 75%:</span>{' '}
          <span className="text-emerald-400 font-semibold">
            {s.status75 === 'IMPOSSIBLE' ? 'IMPOSSIBLE' : `attend ${s.clampedNeeded75}/${s.remaining}`}
          </span>
        </div>
        <div className="px-3 py-2 rounded-lg bg-white/5">
          <span className="text-slate-500">For 90%:</span>{' '}
          <span className="text-cyan-400 font-semibold">
            {s.status90 === 'IMPOSSIBLE' ? 'IMPOSSIBLE' : `attend ${s.clampedNeeded90}/${s.remaining}`}
          </span>
        </div>
        <div className="px-3 py-2 rounded-lg bg-white/5">
          <span className="text-slate-500">Bunks left:</span>{' '}
          <span className="text-amber-400 font-semibold">{s.bunksAllowed75}</span>
        </div>
        <div className="px-3 py-2 rounded-lg bg-white/5">
          <span className="text-slate-500">Remaining:</span>{' '}
          <span className="text-white font-semibold">{s.remaining}</span>
        </div>
        <div className="px-3 py-2 rounded-lg bg-white/5">
          <span className="text-slate-500">Best final:</span>{' '}
          <span className="text-emerald-400 font-semibold">{fmtPct(s.maxPossiblePct, 0)}</span>
        </div>
        <div className="px-3 py-2 rounded-lg bg-white/5">
          <span className="text-slate-500">Worst final:</span>{' '}
          <span className="text-rose-400 font-semibold">{fmtPct(s.minPossiblePct, 0)}</span>
        </div>
      </div>

      <MathDrawer subject={s} />
    </motion.div>
  );
}
