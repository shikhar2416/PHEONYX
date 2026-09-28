import { useState } from 'react';
import { SECTIONS, SECTION_KEYS, PERIOD_TIMINGS } from '@/data/timetables';
import Tooltip from '@/components/ui/Tooltip';
import ChatbotWidget from '@/components/chatbot/ChatbotWidget';

export default function DataPage() {
  const [selected, setSelected] = useState(SECTION_KEYS[0]);
  const section = SECTIONS[selected];

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const timings = PERIOD_TIMINGS[section.grid];
  const numPeriods = Math.max(...days.map((d) => section.weekly[d]?.length ?? 0), 0);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold font-heading text-white mb-2">
          Data & Assumptions
        </h1>
        <p className="text-slate-400 text-sm max-w-2xl mx-auto">
          Every section's timetable, slot lookup, and the assumptions made when filling gaps.
        </p>
      </div>

      <div className="flex flex-wrap gap-2 justify-center mb-8">
        {SECTION_KEYS.map((key) => (
          <button
            key={key}
            onClick={() => setSelected(key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
              selected === key
                ? 'bg-emerald-400/20 text-emerald-300 border border-emerald-400/30'
                : 'bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10'
            }`}
          >
            {key}
          </button>
        ))}
      </div>

      <div className="glass-card bg-white/5 border border-white/10 rounded-2xl p-5 mb-6">
        <h2 className="font-heading font-semibold text-white text-lg mb-2">{section.label}</h2>
        <div className="flex flex-wrap gap-4 text-sm text-slate-400">
          <span>Venue: <span className="text-white">{section.venue}</span></span>
          <span>Semester: <span className="text-white">{section.semesterLabel}</span></span>
          <span>Grid: <span className="text-white">{section.grid}</span></span>
        </div>
      </div>

      <div className="glass-card bg-white/5 border border-white/10 rounded-2xl p-5 mb-6">
        <h3 className="font-heading font-semibold text-white text-base mb-4">Weekly Timetable</h3>
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
                <tr key={day} className="border-b border-white/5">
                  <td className="py-2 px-2 text-slate-300 font-medium">{day.slice(0, 3)}</td>
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

      <div className="glass-card bg-white/5 border border-white/10 rounded-2xl p-5 mb-6">
        <h3 className="font-heading font-semibold text-white text-base mb-4">Slot Lookup</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-2 px-3 text-slate-400 font-medium">Slot</th>
                <th className="text-left py-2 px-3 text-slate-400 font-medium">Code</th>
                <th className="text-left py-2 px-3 text-slate-400 font-medium">Subject Name</th>
                <th className="text-left py-2 px-3 text-slate-400 font-medium">Faculty</th>
                <th className="text-left py-2 px-3 text-slate-400 font-medium">Credits</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(section.slots).map(([letter, info]) => (
                <tr key={letter} className="border-b border-white/5">
                  <td className="py-2 px-3">
                    <span className="inline-block px-2 py-0.5 rounded bg-cyan-400/10 text-cyan-400 font-mono text-xs">
                      {letter}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-emerald-400 font-mono text-xs">{info.code}</td>
                  <td className="py-2 px-3 text-white text-xs">{info.name}</td>
                  <td className="py-2 px-3 text-slate-400 text-xs">{info.faculty}</td>
                  <td className="py-2 px-3 text-slate-300 font-mono text-xs">{info.credits}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="glass-card bg-white/5 border border-white/10 rounded-2xl p-5">
        <h3 className="font-heading font-semibold text-white text-base mb-3">Assumptions</h3>
        <ul className="space-y-2 text-sm text-slate-400">
          <li className="flex gap-2"><span className="text-emerald-400">•</span> Lab double-periods count as the number of cells they occupy in the weekly grid.</li>
          <li className="flex gap-2"><span className="text-emerald-400">•</span> Faculty marked "—" are unknown and left as placeholders.</li>
          <li className="flex gap-2"><span className="text-emerald-400">•</span> Weekly grids for sections sharing a slot table are plausible rearrangements maintaining credit consistency.</li>
          <li className="flex gap-2"><span className="text-emerald-400">•</span> First-year German and Philosophy subjects use custom slot keys (GER, PHIL) since they don't map to A–K.</li>
          <li className="flex gap-2"><span className="text-emerald-400">•</span> Semester runs 29 Aug – 29 Nov 2026, Monday–Friday only, no holidays recorded.</li>
        </ul>
      </div>
      <ChatbotWidget />
    </div>
  );
}
