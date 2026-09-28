import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { SEMESTER, SECTIONS } from '@/data/timetables';
import { getClassesOnDate, getLeaveBudget } from '@/lib/leaves';
import { eachDay, isTeachingDay, getDayName, todayISO, parseISO, toISO, addDays } from '@/lib/dates';
import { useStudent } from '@/context/StudentContext';
import { useToast } from '@/components/ui/Toast';

const MONTHS = [
  { name: 'September', year: 2026, num: 8 },
  { name: 'October', year: 2026, num: 9 },
  { name: 'November', year: 2026, num: 10 },
];

export default function LeaveCalendar() {
  const { inputs, sectionKey, plannedLeaves, setPlannedLeaves } = useStudent();
  const { showToast } = useToast();
  const today = todayISO();
  const [currentMonthIdx, setCurrentMonthIdx] = useState(0);
  const plannedSet = useMemo(() => new Set(plannedLeaves), [plannedLeaves]);

  const budget = useMemo(() => getLeaveBudget(inputs, sectionKey, today, plannedLeaves), [inputs, sectionKey, today, plannedLeaves]);
  const budgetMap = useMemo(() => {
    const m = new Map<string, number>();
    for (const b of budget) m.set(b.code, b.available);
    return m;
  }, [budget]);

  const section = SECTIONS[sectionKey];
  const month = MONTHS[currentMonthIdx];

  const daysInMonth = new Date(month.year, month.num + 1, 0).getDate();
  const firstDayOfWeek = new Date(month.year, month.num, 1).getDay();
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const toggleLeave = (iso: string) => {
    if (iso < today || iso > SEMESTER.end) return;
    if (!isTeachingDay(iso)) return;
    const dayClasses = getClassesOnDate(sectionKey, iso);
    if (dayClasses.slots.length === 0) return;

    if (plannedSet.has(iso)) {
      setPlannedLeaves(plannedLeaves.filter((d) => d !== iso));
      return;
    }

    for (const cls of dayClasses.slots) {
      if ((budgetMap.get(cls.code) ?? 0) <= 0) {
        showToast(`Cannot mark ${iso}: ${cls.name} would drop below 75%`, 'error');
        return;
      }
    }
    setPlannedLeaves([...plannedLeaves, iso]);
    showToast(`Marked ${iso} as planned leave`, 'success');
  };

  const toggleDay = (iso: string) => {
    if (plannedSet.has(iso)) {
      toggleLeave(iso);
      return;
    }
    const dayClasses = getClassesOnDate(sectionKey, iso);
    if (dayClasses.slots.length === 0) return;
    let canTakeAll = true;
    for (const cls of dayClasses.slots) {
      if ((budgetMap.get(cls.code) ?? 0) <= 0) { canTakeAll = false; break; }
    }
    if (canTakeAll) {
      setPlannedLeaves([...plannedLeaves, iso]);
      showToast(`Marked all of ${iso} as leave`, 'success');
    } else {
      showToast(`Cannot take ${iso} off — some subjects would drop below 75%`, 'error');
    }
  };

  const cells: (string | null)[] = [];
  for (let i = 0; i < firstDayOfWeek; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push(toISO(new Date(month.year, month.num, d)));
  }

  return (
    <div className="glass-card bg-white/5 border border-white/10 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-heading font-semibold text-white text-sm">
          Leave Calendar — {month.name} {month.year}
        </h3>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setCurrentMonthIdx(Math.max(0, currentMonthIdx - 1))}
            disabled={currentMonthIdx === 0}
            className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-slate-400 hover:text-white disabled:opacity-30 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => setCurrentMonthIdx(Math.min(MONTHS.length - 1, currentMonthIdx + 1))}
            disabled={currentMonthIdx === MONTHS.length - 1}
            className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-slate-400 hover:text-white disabled:opacity-30 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-1">
        {weekDays.map((d) => (
          <div key={d} className="text-center text-[10px] text-slate-500 font-medium py-1">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((iso, i) => {
          if (!iso) return <div key={i} />;
          const isTeaching = isTeachingDay(iso);
          const isPast = iso < today;
          const isFuture = iso > SEMESTER.end;
          const isPlanned = plannedSet.has(iso);
          const dayClasses = isTeaching && !isPast && !isFuture ? getClassesOnDate(sectionKey, iso) : { slots: [] as any[] };
          const hasClasses = dayClasses.slots.length > 0;
          const dayNum = parseISO(iso).getDate();

          let cellClass = 'bg-white/[0.02] border border-white/5 text-slate-600';
          if (isTeaching && !isPast && !isFuture) {
            cellClass = 'bg-white/5 border border-white/10 text-slate-300 hover:border-emerald-400/30 cursor-pointer';
            if (isPlanned) cellClass = 'bg-amber-500/15 border border-amber-500/40 text-amber-200 cursor-pointer';
          }
          if (isPast && isTeaching) cellClass = 'bg-white/[0.02] border border-white/5 text-slate-600';
          if (isFuture) cellClass = 'bg-white/[0.02] border border-white/5 text-slate-700';

          return (
            <button
              key={i}
              onClick={() => isTeaching && !isPast && !isFuture && toggleDay(iso)}
              disabled={!isTeaching || isPast || isFuture}
              className={`min-h-[44px] rounded-lg p-1 text-left transition-all ${cellClass}`}
            >
              <div className="text-[10px] font-medium">{dayNum}</div>
              {hasClasses && (
                <div className="flex flex-wrap gap-0.5 mt-0.5">
                  {dayClasses.slots.slice(0, 3).map((s, idx) => (
                    <span
                      key={idx}
                      className={`text-[8px] px-1 py-0.5 rounded font-mono ${
                        isPlanned ? 'bg-amber-500/30 text-amber-100' : 'bg-emerald-400/10 text-emerald-400'
                      }`}
                    >
                      {s.slotLetter}
                    </span>
                  ))}
                  {dayClasses.slots.length > 3 && (
                    <span className="text-[8px] text-slate-500">+{dayClasses.slots.length - 3}</span>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-4 flex items-center gap-4 text-xs text-slate-400">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-emerald-400/20 border border-emerald-400/30" /> Teaching day
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-amber-500/30 border border-amber-500/50" /> Planned leave
        </span>
      </div>
    </div>
  );
}
