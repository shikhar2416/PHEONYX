import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Clock,
  MapPin,
  Users,
  Building2,
  Copy,
  Check,
  DoorOpen,
  CalendarDays,
  Layers,
  Sparkles,
  ArrowUpRight,
  AlertCircle,
  Info,
} from "lucide-react";
import { format } from "date-fns";
import { SEMESTER, PERIOD_TIMINGS } from "@/data/timetables";
import { ROOMS } from "@/data/timetables";
import { useFreeClasses, type GridType } from "@/hooks/useFreeClasses";
import { getOccupancySnapshot } from "@/lib/occupancy";


function useLiveClock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return now;
}

function RoomCard({ room, index }: { room: ReturnType<typeof useFreeClasses>["freeRooms"][number]; index: number }) {
  const [copied, setCopied] = useState(false);
  const freeForLong = room.freePeriodsCount >= 2;

  const handleCopy = () => {
    const text = `${room.room.displayName} · Floor ${room.room.floor} · Free ${room.freeTimeRange}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.35, ease: "easeOut" }}
      className="glass-card bg-white/5 border border-white/10 rounded-2xl p-5 hover:border-emerald-400/30 transition-colors group"
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-heading font-bold text-lg text-white">{room.room.displayName}</h3>
          <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-400">
            <Building2 className="w-3.5 h-3.5" />
            <span>{room.room.building} · Floor {room.room.floor}</span>
          </div>
        </div>
        <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-xs text-slate-300">
          <Users className="w-3.5 h-3.5 text-cyan-400" />
          {room.room.capacity}
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5 mb-3">
        {room.room.amenities.map((a) => (
          <span key={a} className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-white/5 border border-white/10 text-slate-400">
            {a}
          </span>
        ))}
      </div>

      <div className="flex items-center gap-2 mb-2">
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${freeForLong ? "bg-emerald-400/15 text-emerald-300 border border-emerald-400/20" : "bg-amber-400/15 text-amber-300 border border-amber-400/20"}`}>
          Free for {room.freePeriodsCount} period{room.freePeriodsCount > 1 ? "s" : ""}
        </span>
        <span className="text-xs text-slate-400 tabular-nums">{room.freeTimeRange}</span>
      </div>

      {room.nextOccupancy ? (
        <div className="flex items-start gap-1.5 text-xs text-amber-300/80 mt-2">
          <AlertCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
          <span>
            Next class: {room.nextOccupancy.occupants[0]?.subjectName ?? "Unknown"} at{" "}
            {room.nextOccupancy.timeRange.replace(".", ":")}
          </span>
        </div>
      ) : (
        <div className="flex items-center gap-1.5 text-xs text-emerald-300 mt-2">
          <Check className="w-3.5 h-3.5" />
          <span>Free for the rest of the day</span>
        </div>
      )}

      <button
        onClick={handleCopy}
        className="mt-3 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 hover:text-white transition-colors"
      >
        {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
        {copied ? "Copied!" : "Copy room info"}
      </button>
    </motion.div>
  );
}

function HeatmapCell({ occupied, occupants, isCurrentPeriod }: {
  occupied: boolean;
  occupants: ReturnType<typeof getOccupancySnapshot>[string];
  isCurrentPeriod: boolean;
}) {
  const [show, setShow] = useState(false);
  const tooltipText = occupied && occupants && occupants.length > 0
    ? occupants.map((o) => `${o.sectionKey} — ${o.subjectName} · ${o.faculty}`).join(" | ")
    : "Free this period";

  return (
    <span
      className="relative inline-block"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      <div
        className={`h-10 w-full rounded-md cursor-pointer transition-all hover:scale-105 ${
          occupied
            ? "bg-rose-500/25 border border-rose-500/30"
            : "bg-emerald-400/15 border border-emerald-400/20"
        } ${isCurrentPeriod ? "ring-2 ring-cyan-400/60" : ""}`}
      />
      {show && (
        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 rounded-lg bg-base-700 border border-white/15 text-[10px] text-slate-200 z-50 shadow-xl pointer-events-none max-w-[200px]">
          {tooltipText}
        </span>
      )}
    </span>
  );
}

function SuggestionCard({ title, icon, room }: {
  title: string;
  icon: React.ReactNode;
  room: ReturnType<typeof useFreeClasses>["freeRooms"][number] | null;
}) {
  if (!room) {
    return (
      <div className="glass-card bg-white/5 border border-white/10 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-1 text-slate-400 text-sm font-medium">{icon}{title}</div>
        <p className="text-xs text-slate-500">No rooms available right now.</p>
      </div>
    );
  }
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="glass-card bg-white/5 border border-white/10 rounded-xl p-4 hover:border-emerald-400/20 transition-colors"
    >
      <div className="flex items-center gap-2 mb-2 text-sm font-medium text-white">{icon}{title}</div>
      <div className="text-lg font-heading font-bold text-emerald-300">{room.room.displayName}</div>
      <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{room.freePeriodsCount} periods free</span>
        <span className="flex items-center gap-1"><Layers className="w-3 h-3" />Floor {room.room.floor}</span>
        <span className="flex items-center gap-1"><Users className="w-3 h-3" />{room.room.capacity}</span>
      </div>
    </motion.div>
  );
}

export default function FreeClassesPage() {
  const fc = useFreeClasses();
  const now = useLiveClock();
  const semStart = SEMESTER.start;
  const semEnd = SEMESTER.end;

  const longestRoom = fc.freeRooms.length > 0 ? [...fc.freeRooms].sort((a, b) => b.freePeriodsCount - a.freePeriodsCount)[0] : null;
  const lowestFloorRoom = fc.freeRooms.length > 0 ? [...fc.freeRooms].sort((a, b) => a.room.floor - b.room.floor)[0] : null;
  const biggestRoom = fc.freeRooms.length > 0 ? [...fc.freeRooms].sort((a, b) => b.room.capacity - a.room.capacity)[0] : null;

  const dateValue = format(fc.selectedDate, "yyyy-MM-dd");
  const minDate = semStart;
  const maxDate = semEnd;
  const outsideHours = !fc.isWeekendDay && fc.resolvedPeriodIndex === null && fc.timeMode === "now";

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
      {/* HERO HEADER */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <DoorOpen className="w-6 h-6 text-base-900" strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="font-heading font-bold text-2xl sm:text-3xl text-white tracking-tight">Free Class Locator</h1>
            <p className="text-sm text-slate-400">Find a quiet classroom right now — no more floor hopping.</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 mt-4">
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl glass-card bg-white/5 border border-white/10">
            <Clock className="w-4 h-4 text-cyan-400" />
            <span className="text-sm font-semibold text-white tabular-nums">{format(now, "HH:mm:ss")}</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-400/10 border border-emerald-400/20">
            <span className="text-sm font-medium text-emerald-300">{fc.currentPeriodLabel}</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10">
            <CalendarDays className="w-4 h-4 text-slate-400" />
            <span className="text-sm text-slate-300">{fc.weekday}, {format(fc.selectedDate, "MMM d")}</span>
          </div>
        </div>
      </div>

      {/* CONTROLS PANEL */}
      <div className="glass-card bg-white/5 border border-white/10 rounded-2xl p-5 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Date picker */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Date</label>
            <input
              type="date"
              value={dateValue}
              min={minDate}
              max={maxDate}
              onChange={(e) => {
                const d = new Date(e.target.value + "T00:00:00");
                if (!isNaN(d.getTime())) fc.setSelectedDate(d);
              }}
              className="w-full px-3 py-2 rounded-lg bg-base-800/80 border border-white/10 text-sm text-white focus:border-emerald-400/40 outline-none transition-colors"
            />
          </div>

          {/* Time mode */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Time</label>
            <div className="flex rounded-lg bg-base-800/80 border border-white/10 p-0.5">
              {([
                { v: "now", label: "Right Now" },
                { v: "period", label: "Period" },
                { v: "custom", label: "Custom" },
              ] as const).map((m) => (
                <button
                  key={m.v}
                  onClick={() => fc.setTimeMode(m.v)}
                  className={`flex-1 px-2 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    fc.timeMode === m.v ? "bg-emerald-400/20 text-emerald-300" : "text-slate-400 hover:text-white"
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Period selector / custom time */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">
              {fc.timeMode === "period" ? "Select Period" : fc.timeMode === "custom" ? "Time (HH:MM)" : "Duration"}
            </label>
            {fc.timeMode === "period" ? (
              <select
                value={fc.selectedPeriodIndex}
                onChange={(e) => fc.setSelectedPeriodIndex(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg bg-base-800/80 border border-white/10 text-sm text-white focus:border-emerald-400/40 outline-none transition-colors"
              >
                {PERIOD_TIMINGS[fc.grid].map((p, i) => (
                  <option key={i} value={i}>Period {i + 1} · {p}</option>
                ))}
              </select>
            ) : fc.timeMode === "custom" ? (
              <input
                type="time"
                value={fc.customTime}
                onChange={(e) => fc.setCustomTime(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-base-800/80 border border-white/10 text-sm text-white focus:border-emerald-400/40 outline-none transition-colors"
              />
            ) : (
              <div className="flex gap-1.5">
                {[1, 2, 3, 4].map((n) => (
                  <button
                    key={n}
                    onClick={() => fc.setDurationPeriods(n)}
                    className={`flex-1 py-2 rounded-lg text-xs font-semibold border transition-colors ${
                      fc.durationPeriods === n
                        ? "bg-emerald-400/20 text-emerald-300 border-emerald-400/30"
                        : "bg-base-800/80 text-slate-400 border-white/10 hover:text-white"
                    }`}
                  >
                    {n}P
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Grid selector */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Timetable Grid</label>
            <div className="flex rounded-lg bg-base-800/80 border border-white/10 p-0.5">
              {([
                { v: "standard", label: "Standard (Y2-4)" },
                { v: "firstYear", label: "First Year" },
              ] as const).map((g) => (
                <button
                  key={g.v}
                  onClick={() => fc.setGrid(g.v as GridType)}
                  className={`flex-1 px-2 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    fc.grid === g.v ? "bg-cyan-400/20 text-cyan-300" : "text-slate-400 hover:text-white"
                  }`}
                >
                  {g.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Duration row (visible when not in "now" mode or always) */}
        {fc.timeMode !== "now" && (
          <div className="mt-4">
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Need room for</label>
            <div className="flex gap-1.5 max-w-xs">
              {[1, 2, 3, 4].map((n) => (
                <button
                  key={n}
                  onClick={() => fc.setDurationPeriods(n)}
                  className={`flex-1 py-2 rounded-lg text-xs font-semibold border transition-colors ${
                    fc.durationPeriods === n
                      ? "bg-emerald-400/20 text-emerald-300 border-emerald-400/30"
                      : "bg-base-800/80 text-slate-400 border-white/10 hover:text-white"
                  }`}
                >
                  {n} {n === 1 ? "period" : "periods"}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-white/5">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Floor</label>
            <div className="flex gap-1.5 flex-wrap">
              {[null, 2, 4, 5, 6].map((f) => (
                <button
                  key={f ?? "all"}
                  onClick={() => fc.setFilterFloor(f)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                    fc.filterFloor === f
                      ? "bg-emerald-400/20 text-emerald-300 border-emerald-400/30"
                      : "bg-base-800/60 text-slate-400 border-white/10 hover:text-white"
                  }`}
                >
                  {f === null ? "All" : `Floor ${f}`}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Capacity</label>
            <div className="flex gap-1.5 flex-wrap">
              {[0, 35, 45, 60].map((c) => (
                <button
                  key={c}
                  onClick={() => fc.setFilterMinCapacity(c)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                    fc.filterMinCapacity === c
                      ? "bg-cyan-400/20 text-cyan-300 border-cyan-400/30"
                      : "bg-base-800/60 text-slate-400 border-white/10 hover:text-white"
                  }`}
                >
                  {c === 0 ? "Any" : `${c}+`}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Weekend warning */}
        {fc.isWeekendDay && (
          <div className="flex items-center gap-2 mt-4 px-4 py-2.5 rounded-lg bg-cyan-400/10 border border-cyan-400/20 text-sm text-cyan-300">
            <Info className="w-4 h-4 flex-shrink-0" />
            <span>No classes on weekends — all rooms are free.</span>
          </div>
        )}
      </div>

      {/* RESULTS SUMMARY BAR */}
      {!fc.isWeekendDay && (
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-3">
            <span className="px-3 py-1.5 rounded-full text-sm font-semibold bg-emerald-400/15 text-emerald-300 border border-emerald-400/20">
              {fc.freeRooms.length} room{fc.freeRooms.length !== 1 ? "s" : ""} free
            </span>
            {fc.resolvedPeriodIndex !== null && (
              <span className="text-sm text-slate-400">
                for Period {fc.resolvedPeriodIndex + 1} ({PERIOD_TIMINGS[fc.grid][fc.resolvedPeriodIndex]?.replace(".", ":")})
              </span>
            )}
          </div>
          <div className="flex rounded-lg bg-base-800/80 border border-white/10 p-0.5">
            {([
              { v: "cards", label: "Cards" },
              { v: "heatmap", label: "Heatmap" },
            ] as const).map((m) => (
              <button
                key={m.v}
                onClick={() => fc.setViewMode(m.v)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  fc.viewMode === m.v ? "bg-white/10 text-white" : "text-slate-400 hover:text-white"
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* RESULTS PANEL */}
      {fc.isWeekendDay ? (
        <div className="glass-card bg-white/5 border border-white/10 rounded-2xl p-12 text-center">
          <DoorOpen className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
          <h3 className="font-heading font-bold text-lg text-white mb-1">It's the weekend</h3>
          <p className="text-sm text-slate-400">All rooms are free since there are no scheduled classes. Come back on a weekday to find available classrooms.</p>
        </div>
      ) : outsideHours && fc.viewMode === "cards" ? (
        <div className="glass-card bg-white/5 border border-white/10 rounded-2xl p-12 text-center">
          <Clock className="w-12 h-12 text-amber-400 mx-auto mb-3" />
          <h3 className="font-heading font-bold text-lg text-white mb-1">Outside teaching hours</h3>
          <p className="text-sm text-slate-400 mb-2">Classes run 09:00 to 04:50 (standard) or 05:05 (first year).</p>
          <p className="text-sm text-slate-500">Select a specific period or come back during class hours.</p>
        </div>
      ) : fc.viewMode === "cards" ? (
        fc.freeRooms.length === 0 ? (
          <div className="glass-card bg-white/5 border border-white/10 rounded-2xl p-12 text-center">
            <AlertCircle className="w-12 h-12 text-rose-400 mx-auto mb-3" />
            <h3 className="font-heading font-bold text-lg text-white mb-1">All classrooms are occupied</h3>
            <p className="text-sm text-slate-400">Try a different time, reduce the required duration, or adjust your filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence mode="popLayout">
              {fc.freeRooms.map((room, i) => (
                <RoomCard key={room.roomId} room={room} index={i} />
              ))}
            </AnimatePresence>
          </div>
        )
      ) : (
        /* HEATMAP MODE */
        fc.heatmap && (
          <div className="glass-card bg-white/5 border border-white/10 rounded-2xl p-5 overflow-x-auto">
            <div className="min-w-[640px]">
              <div className="grid mb-2" style={{ gridTemplateColumns: `120px repeat(${fc.heatmap.periods.length}, 1fr)` }}>
                <div className="text-xs font-medium text-slate-400 flex items-center pl-1">Room</div>
                {fc.heatmap.periods.map((p, i) => (
                  <div key={i} className="text-center text-[10px] text-slate-400 px-1 tabular-nums">
                    <div className="font-medium text-slate-300">P{i + 1}</div>
                    <div className="text-slate-500">{p.replace(".", ":")}</div>
                  </div>
                ))}
              </div>
              {fc.heatmap.rooms.map((roomId, roomIdx) => {
                const room = ROOMS[roomId];
                if (!room) return null;
                return (
                  <div key={roomId} className="grid items-center py-1 border-t border-white/5" style={{ gridTemplateColumns: `120px repeat(${fc.heatmap!.periods.length}, 1fr)` }}>
                    <div className="text-xs font-medium text-white pl-1">{room.displayName}</div>
                    {fc.heatmap!.cells[roomIdx].map((occupied, pIdx) => {
                      const snapshot = getOccupancySnapshot(fc.weekday, pIdx);
                      return (
                        <HeatmapCell
                          key={pIdx}
                          occupied={occupied}
                          occupants={snapshot[roomId]}
                          isCurrentPeriod={pIdx === fc.resolvedPeriodIndex}
                        />
                      );
                    })}
                  </div>
                );
              })}
              <div className="flex items-center gap-4 mt-4 pt-3 border-t border-white/5">
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <div className="w-4 h-4 rounded bg-emerald-400/15 border border-emerald-400/20" /> Free
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <div className="w-4 h-4 rounded bg-rose-500/25 border border-rose-500/30" /> Occupied
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <div className="w-4 h-4 rounded ring-2 ring-cyan-400/60" /> Current period
                </div>
              </div>
            </div>
          </div>
        )
      )}

      {/* QUICK SUGGEST PANEL */}
      {!fc.isWeekendDay && fc.freeRooms.length > 0 && (
        <div className="mt-8">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-emerald-400" />
            <h2 className="font-heading font-bold text-lg text-white">Best picks for you right now</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <SuggestionCard title="Longest available" icon={<Clock className="w-4 h-4 text-emerald-400" />} room={longestRoom} />
            <SuggestionCard title="Lowest floor" icon={<Building2 className="w-4 h-4 text-cyan-400" />} room={lowestFloorRoom} />
            <SuggestionCard title="Biggest room" icon={<Users className="w-4 h-4 text-amber-400" />} room={biggestRoom} />
          </div>
        </div>
      )}
    </div>
  );
}
