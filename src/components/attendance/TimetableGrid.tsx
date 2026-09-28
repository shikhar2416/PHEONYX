import { SECTIONS, PERIOD_TIMINGS } from '@/data/timetables';
import Tooltip from '@/components/ui/Tooltip';
import { getDayName, todayISO } from '@/lib/dates';

interface TimetableGridProps {
  sectionKey: string;
}

export default function TimetableGrid({ sectionKey }: TimetableGridProps) {
  const section = SECTIONS[sectionKey];
  if (!section) return null;

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const timings = PERIOD_TIMINGS[section.grid];
  const numPeriods = Math.max(...days.map((d) => section.weekly[d]?.length ?? 0), 0);
  const today = todayISO();
  const todayName = getDayName(today);

  return (
    <div className="glass-card bg-white/5 border border-white/10 rounded-2xl p-5">
      <h3 className="font-heading font-semibold text-white text-sm mb-4">
        Weekly Timetable — {section.label}
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left py-2 px-2 text-slate-400 font-medium">Day</th>
              {Array.from({ length: numPeriods }, (_, i) => (
                <th key={i} className="text-center py-2 px-2 text-slate-400 font-medium">
                  P{i + 1}
                  <div className="text-[10px] text-slate-600 font-normal">{timings[i]}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {days.map((day) => (
              <tr
                key={day}
                className={`border-b border-white/5 ${day === todayName ? 'bg-emerald-400/5' : ''}`}
              >
                <td className="py-2 px-2 text-slate-300 font-medium">
                  {day.slice(0, 3)}
                  {day === todayName && (
                    <span className="ml-1 text-[10px] text-emerald-400">today</span>
                  )}
                </td>
                {Array.from({ length: numPeriods }, (_, i) => {
                  const slot = section.weekly[day]?.[i];
                  if (!slot) return <td key={i} className="text-center py-2 px-2 text-slate-600">—</td>;
                  const info = section.slots[slot];
                  return (
                    <td key={i} className="text-center py-2 px-2">
                      <Tooltip content={info ? `${info.code} — ${info.name}` : slot}>
                        <span className="inline-block px-2 py-1 rounded bg-emerald-400/10 text-emerald-400 font-mono cursor-help">
                          {slot}
                        </span>
                      </Tooltip>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
