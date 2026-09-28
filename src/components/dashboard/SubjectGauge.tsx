import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { type SubjectResult } from '@/lib/engine';
import { fmtPct } from '@/lib/format';

interface SubjectGaugeProps {
  subject: SubjectResult;
}

export default function SubjectGauge({ subject }: SubjectGaugeProps) {
  const pct = subject.currentPct ?? 0;
  const data = [
    { name: 'Attended', value: pct },
    { name: 'Remaining', value: Math.max(100 - pct, 0) },
  ];

  const color = pct >= 90 ? '#34D399' : pct >= 75 ? '#FBBF24' : '#F43F5E';

  return (
    <div className="glass-card bg-white/5 border border-white/10 rounded-2xl p-4">
      <div className="text-xs font-mono text-emerald-400 mb-1">{subject.code}</div>
      <p className="text-xs text-slate-400 truncate mb-2">{subject.name}</p>
      <div className="relative h-32">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              startAngle={90}
              endAngle={-270}
              innerRadius="70%"
              outerRadius="100%"
              dataKey="value"
              stroke="none"
            >
              <Cell fill={color} />
              <Cell fill="rgba(255,255,255,0.05)" />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-bold font-heading text-white tabular-nums">
            {fmtPct(subject.currentPct, 0)}
          </span>
        </div>
      </div>
      <div className="flex items-center justify-between text-[10px] mt-1">
        <span className="text-rose-400">75%</span>
        <span className="text-emerald-400">90%</span>
      </div>
    </div>
  );
}
