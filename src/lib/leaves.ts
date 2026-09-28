import { SECTIONS, SEMESTER } from '@/data/timetables';
import { eachDay, isTeachingDay, getDayName } from './dates';
import { type SubjectInput, countOccurrences, neededForTarget } from './engine';

export interface DayClasses {
  date: string;
  dayName: string;
  isTeaching: boolean;
  slots: { slotLetter: string; code: string; name: string; periodIndex: number }[];
}

export function getClassesOnDate(sectionKey: string, iso: string): DayClasses {
  const section = SECTIONS[sectionKey];
  const dayName = getDayName(iso);
  const slots: DayClasses['slots'] = [];
  if (section && section.weekly[dayName]) {
    section.weekly[dayName].forEach((slotLetter, idx) => {
      if (!slotLetter) return;
      const slot = section.slots[slotLetter];
      if (slot) {
        slots.push({ slotLetter, code: slot.code, name: slot.name, periodIndex: idx });
      }
    });
  }
  return { date: iso, dayName, isTeaching: isTeachingDay(iso), slots };
}

export function getFutureTeachingDays(sectionKey: string, fromISO: string, toISO: string): string[] {
  return eachDay(fromISO, toISO).filter((iso) => isTeachingDay(iso));
}

export function getLeaveBudget(
  inputs: SubjectInput[],
  sectionKey: string,
  today: string,
  plannedLeaves: string[],
): { code: string; name: string; available: number; used: number; total: number }[] {
  const section = SECTIONS[sectionKey];
  if (!section) return [];
  const remaining = countOccurrences(sectionKey, today, SEMESTER.end);

  return inputs.map((inp) => {
    const slot = Object.values(section.slots).find((s) => s.code === inp.code);
    const R = remaining.bySubjectCode[inp.code] ?? 0;
    const needed75 = neededForTarget(inp.attended, inp.conducted, R, 0.75);
    const available = Math.max(R - needed75, 0);
    const used = Math.max(inp.conducted - inp.attended, 0);
    const plannedForSubject = plannedLeaves.reduce((count, leaveDate) => {
      const periods = section.weekly[getDayName(leaveDate)] ?? [];
      return count + periods.filter((sl) => sl && section.slots[sl]?.code === inp.code).length;
    }, 0);
    return {
      code: inp.code,
      name: slot?.name ?? inp.code,
      available: Math.max(available - plannedForSubject, 0),
      used: used + plannedForSubject,
      total: R,
    };
  });
}

export function suggestSafeLeaves(
  inputs: SubjectInput[],
  sectionKey: string,
  today: string,
  plannedLeaves: string[],
): string[] {
  const section = SECTIONS[sectionKey];
  if (!section) return [];
  const remaining = countOccurrences(sectionKey, today, SEMESTER.end);
  const futureDays = getFutureTeachingDays(sectionKey, today, SEMESTER.end);
  const existingSet = new Set(plannedLeaves);

  const budgets = new Map<string, number>();
  for (const inp of inputs) {
    const R = remaining.bySubjectCode[inp.code] ?? 0;
    const needed75 = neededForTarget(inp.attended, inp.conducted, R, 0.75);
    budgets.set(inp.code, Math.max(R - needed75, 0));
  }

  const suggestions: string[] = [];
  for (const iso of futureDays) {
    if (existingSet.has(iso)) continue;
    const dayName = getDayName(iso);
    const periods = section.weekly[dayName];
    if (!periods) continue;
    const dayClasses: string[] = [];
    for (const sl of periods) {
      if (!sl) continue;
      const s = section.slots[sl];
      if (s) dayClasses.push(s.code);
    }
    let canTakeAll = true;
    for (const code of dayClasses) {
      if ((budgets.get(code) ?? 0) <= 0) {
        canTakeAll = false;
        break;
      }
    }
    if (canTakeAll && dayClasses.length > 0) {
      for (const code of dayClasses) {
        budgets.set(code, (budgets.get(code) ?? 0) - 1);
      }
      suggestions.push(iso);
    }
  }
  return suggestions;
}

export function evaluateLeaveRange(
  inputs: SubjectInput[],
  sectionKey: string,
  today: string,
  fromDate: string,
  toDate: string,
): { verdict: 'APPROVED' | 'RISKY' | 'DENIED'; impacts: { code: string; name: string; currentPct: number; projectedPct: number; status: string }[] } {
  const section = SECTIONS[sectionKey];
  if (!section) return { verdict: 'DENIED', impacts: [] };
  const remaining = countOccurrences(sectionKey, today, SEMESTER.end);
  const leaveDays = eachDay(fromDate, toDate).filter((iso) => isTeachingDay(iso));

  const leaveBySubject = new Map<string, number>();
  for (const iso of leaveDays) {
    const dayName = getDayName(iso);
    const periods = section.weekly[dayName];
    if (!periods) continue;
    for (const sl of periods) {
      if (!sl) continue;
      const s = section.slots[sl];
      if (s) {
        leaveBySubject.set(s.code, (leaveBySubject.get(s.code) ?? 0) + 1);
      }
    }
  }

  const impacts = inputs.map((inp) => {
    const slot = Object.values(section.slots).find((s) => s.code === inp.code);
    const R = remaining.bySubjectCode[inp.code] ?? 0;
    const leaveCount = leaveBySubject.get(inp.code) ?? 0;
    const effectiveR = R - leaveCount;
    const currentPct = inp.conducted > 0 ? (inp.attended / inp.conducted) * 100 : 0;
    const projectedPct = inp.conducted + effectiveR > 0
      ? ((inp.attended + effectiveR) / (inp.conducted + effectiveR)) * 100
      : 0;
    const needed75 = neededForTarget(inp.attended, inp.conducted, effectiveR, 0.75);
    const status = needed75 <= 0 ? 'SAFE' : needed75 <= effectiveR ? 'AT_RISK' : 'IMPOSSIBLE';
    return {
      code: inp.code,
      name: slot?.name ?? inp.code,
      currentPct: Math.round(currentPct * 10) / 10,
      projectedPct: Math.round(projectedPct * 10) / 10,
      status,
    };
  });

  const hasImpossible = impacts.some((i) => i.status === 'IMPOSSIBLE');
  const hasRisky = impacts.some((i) => i.status === 'AT_RISK');
  const verdict = hasImpossible ? 'DENIED' : hasRisky ? 'RISKY' : 'APPROVED';
  return { verdict, impacts };
}
