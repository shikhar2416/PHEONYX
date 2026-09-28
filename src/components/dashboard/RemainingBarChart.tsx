import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts';
import { type SubjectResult } from '@/lib/engine';

interface RemainingBarChartProps {
  subjects: SubjectResult[];
}

export default function RemainingBarChart({ subjects }: RemainingBarChartProps) {
  const data = subjects.map((s) => ({
    name: s.code.length > 8 ? s.code.slice(0, 7) + '…' : s.code,
    mustAttend: s.clampedNeeded75,
    freeToBunk: Math.max(s.remaining - s.clampedNeeded75, 0),
  impossible: s.status75 === 'IMPOSSIBLE' ? s.needed75 : 0,
  }));

  return (
    <div className="glass-card bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-5">
      <h3 className="font-heading font-semibold text-white text-sm mb-4">
        Remaining Classes per Subject
      </h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 10, bottom: 5, left: -20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 10 }} angle={-30} textAnchor="end" height={50} />
            <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} allowDecimals={false} />
            <Tooltip
              contentStyle={{ background: '#0F1525', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 }}
              labelStyle={{ color: '#e2e8f0' }}
            />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Bar dataKey="mustAttend" stackId="a" fill="#34D399" name="Must attend" radius={[0, 0, 0, 0]} />
            <Bar dataKey="freeToBunk" stackId="a" fill="#22D3EE" name="Free to bunk" radius={[4, 4, 0, 0]} />
            <Bar dataKey="impossible" stackId="a" fill="#F43F5E" name="Impossible gap" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
