import { motion } from 'framer-motion';
import { MapPin, BookOpen, Clock } from 'lucide-react';
import { type SectionData } from '@/data/timetables';

interface SectionCardProps {
  sectionKey: string;
  section: SectionData;
  onSelect: (key: string) => void;
  index: number;
}

function getWeeklyHours(section: SectionData): number {
  let count = 0;
  for (const day of Object.keys(section.weekly)) {
    for (const slot of section.weekly[day]) {
      if (slot) count++;
    }
  }
  return count;
}

export default function SectionCard({ sectionKey, section, onSelect, index }: SectionCardProps) {
  const subjectCount = Object.keys(section.slots).length;
  const weeklyHours = getWeeklyHours(section);

  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.04 }}
      onClick={() => onSelect(sectionKey)}
      className="text-left p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-emerald-400/30 hover:bg-white/[0.07] transition-all group focus-visible:ring-2 focus-visible:ring-emerald-400/40"
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-mono px-2 py-0.5 rounded-md bg-emerald-400/10 text-emerald-300">
          {sectionKey}
        </span>
        <span className="text-xs text-cyan-400 font-medium">{subjectCount} subjects</span>
      </div>
      <h3 className="font-heading font-semibold text-white text-sm mb-1.5">{section.label}</h3>
      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
        <span className="flex items-center gap-1">
          <MapPin className="w-3 h-3" />
          {section.venue}
        </span>
        <span className="flex items-center gap-1">
          <BookOpen className="w-3 h-3" />
          {section.semesterNo} Sem
        </span>
        <span className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {weeklyHours}h/week
        </span>
      </div>
    </motion.button>
  );
}
