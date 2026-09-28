import { motion } from 'framer-motion';
import { MapPin, BookOpen, CalendarDays } from 'lucide-react';
import { SECTIONS, SECTION_KEYS } from '@/data/timetables';
import { todayISO, formatLong } from '@/lib/dates';

interface SectionPickerProps {
  selected: string;
  onSelect: (key: string) => void;
}

export default function SectionPicker({ selected, onSelect }: SectionPickerProps) {
  const today = todayISO();

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl sm:text-3xl font-bold font-heading text-white mb-2">
          Select your section
        </h2>
        <p className="text-slate-400 text-sm">
          Choose your class section to load its timetable and subjects.
        </p>
      </div>

      <div className="flex items-center justify-center gap-2">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20">
          <CalendarDays className="w-4 h-4 text-cyan-400" />
          <span className="text-sm text-cyan-200">Today: {formatLong(today)}</span>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {SECTION_KEYS.map((key, i) => {
          const s = SECTIONS[key];
          const subjectCount = Object.keys(s.slots).length;
          const isActive = selected === key;
          return (
            <motion.button
              key={key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
              onClick={() => onSelect(key)}
              className={`text-left p-5 rounded-2xl border transition-all ${
                isActive
                  ? 'bg-emerald-500/10 border-emerald-400/40 ring-2 ring-emerald-400/20'
                  : 'bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/[0.07]'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`text-xs font-mono px-2 py-0.5 rounded-md ${isActive ? 'bg-emerald-400/20 text-emerald-300' : 'bg-white/5 text-slate-400'}`}>
                  {key}
                </span>
                <span className="text-xs text-cyan-400 font-medium">{subjectCount} subjects</span>
              </div>
              <h3 className="font-heading font-semibold text-white text-sm mb-1">{s.label}</h3>
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <MapPin className="w-3 h-3" />
                <span>{s.venue}</span>
                <span className="mx-1">·</span>
                <BookOpen className="w-3 h-3" />
                <span>{s.semesterLabel}</span>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
