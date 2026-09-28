import { SECTIONS, SEMESTER, type SectionData } from '@/data/timetables';
import { eachDay, isTeachingDay, getDayName, clampToSemester, addDays, parseISO, toISO } from './dates';

export interface OccurrenceResult {
  bySubjectCode: Record<string, number>;
  total: number;
}

/**
 * Count class occurrences for a section between two dates (inclusive).
 * Skips weekends and holidays. Each non-null cell in the weekly grid counts as one class.
 * Lab double-periods count as the number of cells they occupy.
 */
export function countOccurrences(
  sectionKey: string,
  fromDateISO: string,
  toDateISO: string,
): OccurrenceResult {
  const section = SECTIONS[sectionKey];
  if (!section) return { bySubjectCode: {}, total: 0 };

  const from = clampToSemester(fromDateISO);
  const to = clampToSemester(toDateISO);

  const result: OccurrenceResult = { bySubjectCode: {}, total: 0 };

  for (const iso of eachDay(from, to)) {
    if (!isTeachingDay(iso)) continue;
    const dayName = getDayName(iso);
    const periods = section.weekly[dayName];
    if (!periods) continue;

    for (const slotLetter of periods) {
      if (!slotLetter) continue;
      const slot = section.slots[slotLetter];
      if (!slot) continue;
      const code = slot.code;
      result.bySubjectCode[code] = (result.bySubjectCode[code] ?? 0) + 1;
      result.total++;
    }
  }

  return result;
}

export type AttendanceStatus = 'SAFE' | 'AT_RISK' | 'IMPOSSIBLE';

export interface SubjectResult {
  code: string;
  name: string;
  credits: string;
  faculty: string;
  attended: number;
  conducted: number;
  remaining: number;
  remainingTillPlanDate: number;
  currentPct: number | null;
  maxPossiblePct: number;
  minPossiblePct: number;
  needed75: number;
  needed90: number;
  clampedNeeded75: number;
  clampedNeeded90: number;
  bunksAllowed75: number;
  bunksAllowed90: number;
  requiredRate75: number | null;
  requiredRate90: number | null;
  status75: AttendanceStatus;
  status90: AttendanceStatus;
  status: AttendanceStatus;
  safeUntilDate: string | null;
  weeklyFrequency: number;
}

export interface EngineResult {
  subjects: SubjectResult[];
  aggregate: SubjectResult & { name: string; code: string };
  totalClassesLeft: number;
  totalClassesLeftTillPlanDate: number;
  totalClassesConducted: number;
  worstStatus: AttendanceStatus;
  planDate: string;
  today: string;
}

function neededForTarget(attended: number, conducted: number, remaining: number, target: number): number {
  return Math.ceil(target * (conducted + remaining) - attended);
}

function getStatus(needed: number, remaining: number): AttendanceStatus {
  if (needed <= 0) return 'SAFE';
  if (needed <= remaining) return 'AT_RISK';
  return 'IMPOSSIBLE';
}

function computeSafeUntilDate(
  sectionKey: string,
  code: string,
  attended: number,
  conducted: number,
  todayISO: string,
): string | null {
  const section = SECTIONS[sectionKey];
  if (!section) return null;

  let currentConducted = conducted;
  let currentAttended = attended;

  if (currentConducted === 0) return null;

  let cursor = todayISO;
  const end = SEMESTER.end;

  while (cursor <= end) {
    if (isTeachingDay(cursor)) {
      const dayName = getDayName(cursor);
      const periods = section.weekly[dayName];
      if (periods) {
        for (const slotLetter of periods) {
          if (!slotLetter) continue;
          const slot = section.slots[slotLetter];
          if (!slot) continue;
          if (slot.code === code) {
            currentConducted++;
          }
        }
      }
    }

    const pct = (currentAttended / currentConducted) * 100;
    if (pct < 75) {
      return addDays(cursor, -1) < todayISO ? todayISO : addDays(cursor, -1);
    }

    cursor = addDays(cursor, 1);
  }

  return SEMESTER.end;
}

function getWeeklyFrequency(section: SectionData, code: string): number {
  let count = 0;
  for (const day of Object.keys(section.weekly)) {
    for (const slot of section.weekly[day]) {
      if (!slot) continue;
      const s = section.slots[slot];
      if (s && s.code === code) count++;
    }
  }
  return count;
}

export interface SubjectInput {
  code: string;
  attended: number;
  conducted: number;
}

export function computeEngine(
  sectionKey: string,
  todayISO: string,
  planDateISO: string,
  inputs: SubjectInput[],
): EngineResult {
  const section = SECTIONS[sectionKey];
  if (!section) throw new Error(`Unknown section: ${sectionKey}`);

  const today = clampToSemester(todayISO);
  const yesterday = addDays(today, -1);
  const planDate = clampToSemester(planDateISO);
  const end = SEMESTER.end;

  const remainingTillEnd = countOccurrences(sectionKey, today, end);
  const remainingTillPlan = countOccurrences(sectionKey, today, planDate);

  const subjects: SubjectResult[] = [];
  let aggAttended = 0;
  let aggConducted = 0;
  let aggRemaining = 0;
  let aggRemainingPlan = 0;

  for (const input of inputs) {
    const slot = Object.values(section.slots).find((s) => s.code === input.code);
    if (!slot) continue;

    const A = input.attended;
    const C = input.conducted;
    const R = remainingTillEnd.bySubjectCode[input.code] ?? 0;
    const Rplan = remainingTillPlan.bySubjectCode[input.code] ?? 0;

    const currentPct = C > 0 ? (A / C) * 100 : null;
    const maxPossiblePct = C + R > 0 ? ((A + R) / (C + R)) * 100 : 0;
    const minPossiblePct = C + R > 0 ? (A / (C + R)) * 100 : 0;

    const needed75 = neededForTarget(A, C, R, 0.75);
    const needed90 = neededForTarget(A, C, R, 0.90);
    const clamped75 = Math.min(Math.max(needed75, 0), R);
    const clamped90 = Math.min(Math.max(needed90, 0), R);
    const bunks75 = Math.max(R - needed75, 0);
    const bunks90 = Math.max(R - needed90, 0);
    const reqRate75 = R > 0 ? (clamped75 / R) * 100 : null;
    const reqRate90 = R > 0 ? (clamped90 / R) * 100 : null;
    const status75 = getStatus(needed75, R);
    const status90 = getStatus(needed90, R);
    const status = status75 === 'IMPOSSIBLE' ? 'IMPOSSIBLE' : status90 === 'IMPOSSIBLE' ? 'AT_RISK' : status75;

    const safeUntil = computeSafeUntilDate(sectionKey, input.code, A, C, today);
    const weeklyFreq = getWeeklyFrequency(section, input.code);

    subjects.push({
      code: input.code,
      name: slot.name,
      credits: slot.credits,
      faculty: slot.faculty,
      attended: A,
      conducted: C,
      remaining: R,
      remainingTillPlanDate: Rplan,
      currentPct,
      maxPossiblePct,
      minPossiblePct,
      needed75,
      needed90,
      clampedNeeded75: clamped75,
      clampedNeeded90: clamped90,
      bunksAllowed75: bunks75,
      bunksAllowed90: bunks90,
      requiredRate75: reqRate75,
      requiredRate90: reqRate90,
      status75,
      status90,
      status,
      safeUntilDate: safeUntil,
      weeklyFrequency: weeklyFreq,
    });

    aggAttended += A;
    aggConducted += C;
    aggRemaining += R;
    aggRemainingPlan += Rplan;
  }

  const aggCurrentPct = aggConducted > 0 ? (aggAttended / aggConducted) * 100 : null;
  const aggMaxPct = aggConducted + aggRemaining > 0 ? ((aggAttended + aggRemaining) / (aggConducted + aggRemaining)) * 100 : 0;
  const aggMinPct = aggConducted + aggRemaining > 0 ? (aggAttended / (aggConducted + aggRemaining)) * 100 : 0;
  const aggNeeded75 = neededForTarget(aggAttended, aggConducted, aggRemaining, 0.75);
  const aggNeeded90 = neededForTarget(aggAttended, aggConducted, aggRemaining, 0.90);
  const aggClamped75 = Math.min(Math.max(aggNeeded75, 0), aggRemaining);
  const aggClamped90 = Math.min(Math.max(aggNeeded90, 0), aggRemaining);
  const aggBunks75 = Math.max(aggRemaining - aggNeeded75, 0);
  const aggBunks90 = Math.max(aggRemaining - aggNeeded90, 0);
  const aggStatus75 = getStatus(aggNeeded75, aggRemaining);
  const aggStatus90 = getStatus(aggNeeded90, aggRemaining);
  const aggStatus = aggStatus75 === 'IMPOSSIBLE' ? 'IMPOSSIBLE' : aggStatus90 === 'IMPOSSIBLE' ? 'AT_RISK' : aggStatus75;

  let worstStatus: AttendanceStatus = 'SAFE';
  for (const s of subjects) {
    if (s.status === 'IMPOSSIBLE') {
      worstStatus = 'IMPOSSIBLE';
      break;
    }
    if (s.status === 'AT_RISK') worstStatus = worstStatus === 'IMPOSSIBLE' ? 'IMPOSSIBLE' : 'AT_RISK';
  }
  if (aggStatus === 'IMPOSSIBLE') worstStatus = 'IMPOSSIBLE';

  const aggregate: SubjectResult & { name: string; code: string } = {
    code: 'ALL',
    name: 'All Subjects (Aggregate)',
    credits: '—',
    faculty: '—',
    attended: aggAttended,
    conducted: aggConducted,
    remaining: aggRemaining,
    remainingTillPlanDate: aggRemainingPlan,
    currentPct: aggCurrentPct,
    maxPossiblePct: aggMaxPct,
    minPossiblePct: aggMinPct,
    needed75: aggNeeded75,
    needed90: aggNeeded90,
    clampedNeeded75: aggClamped75,
    clampedNeeded90: aggClamped90,
    bunksAllowed75: aggBunks75,
    bunksAllowed90: aggBunks90,
    requiredRate75: aggRemaining > 0 ? (aggClamped75 / aggRemaining) * 100 : null,
    requiredRate90: aggRemaining > 0 ? (aggClamped90 / aggRemaining) * 100 : null,
    status75: aggStatus75,
    status90: aggStatus90,
    status: aggStatus,
    safeUntilDate: null,
    weeklyFrequency: 0,
  };

  return {
    subjects,
    aggregate,
    totalClassesLeft: remainingTillEnd.total,
    totalClassesLeftTillPlanDate: remainingTillPlan.total,
    totalClassesConducted: aggConducted,
    worstStatus,
    planDate,
    today,
  };
}

export function getSubjectInputsFromSection(sectionKey: string, todayISO: string): SubjectInput[] {
  const section = SECTIONS[sectionKey];
  if (!section) return [];
  const yesterday = addDays(clampToSemester(todayISO), -1);
  const conducted = countOccurrences(sectionKey, SEMESTER.start, yesterday);
  const inputs: SubjectInput[] = [];
  const seen = new Set<string>();
  for (const slot of Object.values(section.slots)) {
    if (seen.has(slot.code)) continue;
    seen.add(slot.code);
    inputs.push({
      code: slot.code,
      attended: 0,
      conducted: conducted.bySubjectCode[slot.code] ?? 0,
    });
  }
  return inputs;
}

export function getDemoInputs(sectionKey: string, todayISO: string): SubjectInput[] {
  const base = getSubjectInputsFromSection(sectionKey, todayISO);
  const demos: Record<string, number> = {};
  let i = 0;
  const pcts = [82, 68, 91, 75, 88, 95, 70, 79, 85];
  for (const input of base) {
    const pct = pcts[i % pcts.length];
    i++;
    const C = input.conducted || 20;
    const A = Math.round((pct / 100) * C);
    demos[input.code] = A;
  }
  return base.map((inp) => ({
    ...inp,
    attended: demos[inp.code] ?? 0,
  }));
}

export { neededForTarget, getStatus };
