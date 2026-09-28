import { SEMESTER } from '@/data/timetables';

const DAY_NAMES = [
  'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday',
] as const;

export function parseISO(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function toISO(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function getDayName(iso: string): string {
  return DAY_NAMES[parseISO(iso).getDay()];
}

export function isWeekend(iso: string): boolean {
  const day = parseISO(iso).getDay();
  return day === 0 || day === 6;
}

export function isHoliday(iso: string): boolean {
  return SEMESTER.holidays.includes(iso);
}

export function isTeachingDay(iso: string): boolean {
  if (isWeekend(iso)) return false;
  if (isHoliday(iso)) return false;
  return (SEMESTER.teachingDays as readonly string[]).includes(getDayName(iso));
}

export function clampToSemester(iso: string): string {
  if (iso < SEMESTER.start) return SEMESTER.start;
  if (iso > SEMESTER.end) return SEMESTER.end;
  return iso;
}

export function addDays(iso: string, days: number): string {
  const d = parseISO(iso);
  d.setDate(d.getDate() + days);
  return toISO(d);
}

export function todayISO(): string {
  return toISO(new Date());
}

export function diffDays(fromISO: string, toISO: string): number {
  const a = parseISO(fromISO).getTime();
  const b = parseISO(toISO).getTime();
  return Math.round((b - a) / (1000 * 60 * 60 * 24));
}

export function eachDay(fromISO: string, toISO: string): string[] {
  const result: string[] = [];
  let current = fromISO;
  while (current <= toISO) {
    result.push(current);
    current = addDays(current, 1);
  }
  return result;
}

export function formatLong(iso: string): string {
  const d = parseISO(iso);
  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function formatShort(iso: string): string {
  const d = parseISO(iso);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}
