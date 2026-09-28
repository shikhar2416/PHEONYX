import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Legend,
} from 'recharts';
import { SEMESTER, SECTIONS } from '@/data/timetables';
import { type SubjectInput } from '@/lib/engine';
import { countOccurrences } from '@/lib/engine';
import { eachDay, isTeachingDay, getDayName, addDays, clampToSemester, formatShort } from '@/lib/dates';

interface ProjectionChartProps {
  sectionKey: string;
  inputs: SubjectInput[];
  todayISO: string;
}

export default function ProjectionChart({ sectionKey, inputs, todayISO: today }: ProjectionChartProps) {
  const section = SECTIONS[sectionKey];
  if (!section) return null;

  const end = SEMESTER.end;
  const totalAttended = inputs.reduce((sum, i) => sum + i.attended, 0);
  const totalConducted = inputs.reduce((sum, i) => sum + i.conducted, 0);

  const data: { date: string; label: string; attendAll: number; attendRequired: number; attendNone: number }[] = [];

  let cursor = clampToSemester(today);
  let conducted = totalConducted;
  const required75 = Math.ceil(0.75 * (totalConducted + countOccurrences(sectionKey, today, end).total) - totalAttended);

  let attendedAll = totalAttended;
  let attendedReq = totalAttended;
  let attendedNone = totalAttended;
  let conductedRunning = totalConducted;

  const sampleDates: string[] = [];
  const allDays = eachDay(cursor, end);
  const step = Math.max(1, Math.floor(allDays.length / 15));
  for (let i = 0; i < allDays.length; i += step) {
    sampleDates.push(allDays[i]);
  }
  if (!sampleDates.includes(end)) sampleDates.push(end);

  data.push({
    date: cursor,
    label: formatShort(cursor),
    attendAll: totalConducted > 0 ? (totalAttended / totalConducted) * 100 : 0,
    attendRequired: totalConducted > 0 ? (totalAttended / totalConducted) * 100 : 0,
    attendNone: totalConducted > 0 ? (totalAttended / totalConducted) * 100 : 0,
  });

  for (const iso of allDays) {
    if (!isTeachingDay(iso)) continue;
    const dayName = getDayName(iso);
    const periods = section.weekly[dayName];
    if (!periods) continue;

    let dayClassCount = 0;
    for (const slotLetter of periods) {
      if (!slotLetter) continue;
      const slot = section.slots[slotLetter];
      if (!slot) continue;
      const inp = inputs.find((i) => i.code === slot.code);
      if (inp) dayClassCount++;
    }

    if (dayClassCount > 0) {
      conductedRunning += dayClassCount;
      attendedAll += dayClassCount;
      attendedReq += Math.min(dayClassCount, Math.max(0, required75 - (attendedReq - totalAttended)));
      // attendedNone stays the same
    }

    if (sampleDates.includes(iso)) {
      data.push({
        date: iso,
        label: formatShort(iso),
        attendAll: conductedRunning > 0 ? (attendedAll / conductedRunning) * 100 : 0,
        attendRequired: conductedRunning > 0 ? (attendedReq / conductedRunning) * 100 : 0,
        attendNone: conductedRunning > 0 ? (attendedNone / conductedRunning) * 100 : 0,
      });
    }
  }

  return (
    <div className="glass-card bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-5">
      <h3 className="font-heading font-semibold text-white text-sm mb-4">
        Projected Attendance Over Time
      </h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 10, bottom: 5, left: -20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="label" tick={{ fill: '#94a3b8', fontSize: 10 }} interval="preserveStartEnd" />
            <YAxis domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 10 }} />
            <Tooltip
              contentStyle={{ background: '#0F1525', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 }}
              labelStyle={{ color: '#e2e8f0' }}
            />
            <ReferenceLine y={75} stroke="#F43F5E" strokeDasharray="4 4" label={{ value: '75%', fill: '#F43F5E', fontSize: 10 }} />
            <ReferenceLine y={90} stroke="#34D399" strokeDasharray="4 4" label={{ value: '90%', fill: '#34D399', fontSize: 10 }} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Line type="monotone" dataKey="attendAll" stroke="#34D399" strokeWidth={2} dot={false} name="Attend all" />
            <Line type="monotone" dataKey="attendRequired" stroke="#FBBF24" strokeWidth={2} dot={false} name="Attend required" />
            <Line type="monotone" dataKey="attendNone" stroke="#F43F5E" strokeWidth={2} dot={false} name="Attend none" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
