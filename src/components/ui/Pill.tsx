import type { AttendanceStatus } from '@/lib/engine';

type PillType = AttendanceStatus | 'info' | 'neutral';

const styles: Record<PillType, string> = {
  SAFE: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  AT_RISK: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  IMPOSSIBLE: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
  info: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
  neutral: 'bg-white/10 text-slate-300 border-white/15',
};

const labels: Record<AttendanceStatus, string> = {
  SAFE: 'SAFE',
  AT_RISK: 'AT RISK',
  IMPOSSIBLE: 'IRREVERSIBLE',
};

interface PillProps {
  type: PillType;
  label?: string;
  className?: string;
}

export default function Pill({ type, label, className = '' }: PillProps) {
  const text = label ?? (type in labels ? labels[type as AttendanceStatus] : type);
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${styles[type]} ${className}`}
    >
      {type === 'SAFE' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
      {type === 'AT_RISK' && <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />}
      {type === 'IMPOSSIBLE' && <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />}
      {text}
    </span>
  );
}
