import { type ReactNode } from 'react';
import { useCountUp } from '@/hooks/useCountUp';

interface KpiCardProps {
  icon: ReactNode;
  label: string;
  value: number;
  suffix?: string;
  accent: 'emerald' | 'cyan' | 'amber' | 'rose';
}

const accents = {
  emerald: 'from-emerald-500/20 to-emerald-500/5 text-emerald-400 border-emerald-500/20',
  cyan: 'from-cyan-500/20 to-cyan-500/5 text-cyan-400 border-cyan-500/20',
  amber: 'from-amber-500/20 to-amber-500/5 text-amber-400 border-amber-500/20',
  rose: 'from-rose-500/20 to-rose-500/5 text-rose-400 border-rose-500/20',
};

export default function KpiCard({ icon, label, value, suffix, accent }: KpiCardProps) {
  const animated = useCountUp(value);
  return (
    <div className="glass-card bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-5">
      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${accents[accent]} border flex items-center justify-center mb-3`}>
        {icon}
      </div>
      <div className="text-3xl font-bold font-heading text-white tabular-nums">
        {Math.round(animated)}
        {suffix}
      </div>
      <div className="text-xs text-slate-400 mt-1">{label}</div>
    </div>
  );
}
