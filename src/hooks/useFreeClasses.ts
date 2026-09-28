import { useState, useMemo } from "react";
import { format, isWeekend } from "date-fns";
import { PERIOD_TIMINGS } from "@/data/timetables";
import {
  getEnrichedFreeRooms,
  getRoomHeatmapForDay,
  getPeriodIndexFromTime,
  type FreeRoomResult,
} from "@/lib/occupancy";

export type GridType = "standard" | "firstYear";

export function useFreeClasses() {
  const today = new Date();
  const [selectedDate, setSelectedDate] = useState<Date>(today);
  const [timeMode, setTimeMode] = useState<"now" | "period" | "custom">("now");
  const [selectedPeriodIndex, setSelectedPeriodIndex] = useState<number>(0);
  const [customTime, setCustomTime] = useState<string>(format(today, "HH:mm"));
  const [durationPeriods, setDurationPeriods] = useState<number>(1);
  const [filterFloor, setFilterFloor] = useState<number | null>(null);
  const [filterMinCapacity, setFilterMinCapacity] = useState<number>(0);
  const [grid, setGrid] = useState<GridType>("standard");
  const [viewMode, setViewMode] = useState<"cards" | "heatmap">("cards");

  const weekday = useMemo(() => {
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    return days[selectedDate.getDay()];
  }, [selectedDate]);

  const isWeekendDay = useMemo(() => isWeekend(selectedDate), [selectedDate]);

  const resolvedPeriodIndex = useMemo(() => {
    if (isWeekendDay) return null;
    if (timeMode === "now") {
      const now = format(new Date(), "HH:mm");
      return getPeriodIndexFromTime(now, grid);
    }
    if (timeMode === "period") return selectedPeriodIndex;
    if (timeMode === "custom") return getPeriodIndexFromTime(customTime, grid);
    return null;
  }, [timeMode, selectedPeriodIndex, customTime, isWeekendDay, grid]);

  const freeRooms = useMemo((): FreeRoomResult[] => {
    if (isWeekendDay || resolvedPeriodIndex === null) return [];
    let results = getEnrichedFreeRooms(weekday, resolvedPeriodIndex, durationPeriods, grid);
    if (filterFloor !== null) results = results.filter((r) => r.room.floor === filterFloor);
    if (filterMinCapacity > 0) results = results.filter((r) => r.room.capacity >= filterMinCapacity);
    return results;
  }, [weekday, resolvedPeriodIndex, durationPeriods, grid, filterFloor, filterMinCapacity, isWeekendDay]);

  const heatmap = useMemo(() => {
    if (isWeekendDay) return null;
    return getRoomHeatmapForDay(weekday, grid);
  }, [weekday, grid, isWeekendDay]);

  const currentPeriodLabel = useMemo(() => {
    if (resolvedPeriodIndex === null) return "Outside teaching hours";
    return `Period ${resolvedPeriodIndex + 1} · ${PERIOD_TIMINGS[grid][resolvedPeriodIndex]}`;
  }, [resolvedPeriodIndex, grid]);

  return {
    selectedDate,
    setSelectedDate,
    timeMode,
    setTimeMode,
    selectedPeriodIndex,
    setSelectedPeriodIndex,
    customTime,
    setCustomTime,
    durationPeriods,
    setDurationPeriods,
    filterFloor,
    setFilterFloor,
    filterMinCapacity,
    setFilterMinCapacity,
    grid,
    setGrid,
    viewMode,
    setViewMode,
    weekday,
    isWeekendDay,
    resolvedPeriodIndex,
    currentPeriodLabel,
    freeRooms,
    heatmap,
  };
}
