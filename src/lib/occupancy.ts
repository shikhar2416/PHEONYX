import { SECTIONS, ROOMS, PERIOD_TIMINGS, normalizeVenueToRoomId, type GridType } from "@/data/timetables";

export function getPeriodIndexFromTime(
  timeStr: string,
  grid: GridType,
): number | null {
  const timings = PERIOD_TIMINGS[grid];
  const [inputH, inputM] = timeStr.split(":").map(Number);
  const inputMinutes = inputH * 60 + inputM;
  for (let i = 0; i < timings.length; i++) {
    const [start, end] = timings[i].split("-");
    const toMin = (t: string) => {
      const [h, m] = t.replace(".", ":").split(":").map(Number);
      return h * 60 + m;
    };
    if (inputMinutes >= toMin(start) && inputMinutes < toMin(end)) return i;
  }
  return null;
}

export function getPeriodTimeRange(index: number, grid: GridType): string {
  return PERIOD_TIMINGS[grid][index] ?? "Unknown";
}

export function getOccupancySnapshot(
  weekday: string,
  periodIndex: number,
): Record<string, Array<{ sectionKey: string; subjectName: string; subjectCode: string; faculty: string }>> {
  const snapshot: Record<string, Array<{ sectionKey: string; subjectName: string; subjectCode: string; faculty: string }>> = {};
  for (const [sectionKey, section] of Object.entries(SECTIONS)) {
    const roomId = normalizeVenueToRoomId(section.venue);
    const daySlots = section.weekly[weekday];
    if (!daySlots) continue;
    const slot = daySlots[periodIndex];
    if (!slot) continue;
    const subject = section.slots[slot];
    if (!subject) continue;
    if (!snapshot[roomId]) snapshot[roomId] = [];
    snapshot[roomId].push({
      sectionKey,
      subjectName: subject.name,
      subjectCode: subject.code,
      faculty: subject.faculty ?? "—",
    });
  }
  return snapshot;
}

export function isRoomFree(roomId: string, weekday: string, periodIndex: number): boolean {
  const snapshot = getOccupancySnapshot(weekday, periodIndex);
  return !snapshot[roomId] || snapshot[roomId].length === 0;
}

export function getAllFreeRoomsAt(weekday: string, periodIndex: number): string[] {
  const snapshot = getOccupancySnapshot(weekday, periodIndex);
  return Object.keys(ROOMS).filter((roomId) => !snapshot[roomId] || snapshot[roomId].length === 0);
}

export function getAllOccupiedRoomsAt(weekday: string, periodIndex: number): string[] {
  const snapshot = getOccupancySnapshot(weekday, periodIndex);
  return Object.keys(ROOMS).filter((roomId) => snapshot[roomId] && snapshot[roomId].length > 0);
}

export function getFreeConsecutivePeriods(
  roomId: string,
  weekday: string,
  startPeriodIndex: number,
  grid: GridType,
): number {
  const total = PERIOD_TIMINGS[grid].length;
  let count = 0;
  for (let i = startPeriodIndex; i < total; i++) {
    if (isRoomFree(roomId, weekday, i)) count++;
    else break;
  }
  return count;
}

export function getNextOccupancy(
  roomId: string,
  weekday: string,
  afterPeriodIndex: number,
  grid: GridType,
): { periodIndex: number; timeRange: string; occupants: ReturnType<typeof getOccupancySnapshot>[string] } | null {
  const total = PERIOD_TIMINGS[grid].length;
  for (let i = afterPeriodIndex + 1; i < total; i++) {
    const occ = getOccupancySnapshot(weekday, i)[roomId];
    if (occ && occ.length > 0) {
      return {
        periodIndex: i,
        timeRange: getPeriodTimeRange(i, grid),
        occupants: occ,
      };
    }
  }
  return null;
}

export function getRoomHeatmapForDay(
  weekday: string,
  grid: GridType,
): { rooms: string[]; periods: readonly string[]; cells: boolean[][] } {
  const rooms = Object.keys(ROOMS);
  const periods = PERIOD_TIMINGS[grid];
  const cells = rooms.map((roomId) =>
    periods.map((_, pIdx) => !isRoomFree(roomId, weekday, pIdx)),
  );
  return { rooms, periods, cells };
}

export interface FreeRoomResult {
  roomId: string;
  room: (typeof ROOMS)[string];
  freePeriodsCount: number;
  freeTimeRange: string;
  nextOccupancy: ReturnType<typeof getNextOccupancy>;
  currentOccupants: ReturnType<typeof getOccupancySnapshot>[string];
}

export function getEnrichedFreeRooms(
  weekday: string,
  periodIndex: number,
  durationPeriods: number,
  grid: GridType,
): FreeRoomResult[] {
  const results: FreeRoomResult[] = [];
  for (const roomId of Object.keys(ROOMS)) {
    let blockFree = true;
    for (let offset = 0; offset < durationPeriods; offset++) {
      if (!isRoomFree(roomId, weekday, periodIndex + offset)) {
        blockFree = false;
        break;
      }
    }
    if (!blockFree) continue;
    const freeCount = getFreeConsecutivePeriods(roomId, weekday, periodIndex, grid);
    const startTime = getPeriodTimeRange(periodIndex, grid).split("-")[0].replace(".", ":");
    const endPeriod = Math.min(periodIndex + freeCount - 1, PERIOD_TIMINGS[grid].length - 1);
    const endTime = getPeriodTimeRange(endPeriod, grid).split("-")[1].replace(".", ":");
    const freeTimeRange = `${startTime} – ${endTime}`;
    const nextOcc = getNextOccupancy(roomId, weekday, periodIndex + freeCount - 1, grid);
    const currentOcc = getOccupancySnapshot(weekday, periodIndex)[roomId] ?? [];
    results.push({
      roomId,
      room: ROOMS[roomId],
      freePeriodsCount: freeCount,
      freeTimeRange,
      nextOccupancy: nextOcc,
      currentOccupants: currentOcc,
    });
  }
  return results.sort(
    (a, b) => b.freePeriodsCount - a.freePeriodsCount || a.room.floor - b.room.floor,
  );
}
