import { motion } from 'framer-motion';
import { useCountUp } from '@/hooks/useCountUp';
import { SEMESTER, SECTIONS } from '@/data/timetables';
import { eachDay, isTeachingDay, diffDays } from '@/lib/dates';
import { todayISO } from '@/lib/dates';

function StatItem({ value, label, suffix }: { value: number; label: string; suffix?: string }) {
  const animated = useCountUp(value);
  return (
    <div className="text-center">
      <div className="text-3xl sm:text-4xl font-bold font-heading text-white tabular-nums">
        {Math.round(animated)}
        {suffix}
      </div>
      <div className="text-xs sm:text-sm text-slate-400 mt-1">{label}</div>
    </div>
  );
}

export default function StatsStrip() {
  const today = todayISO();
  const daysLeft = Math.max(diffDays(today, SEMESTER.end), 0);

  let totalTeachingDays = 0;
  for (const iso of eachDay(SEMESTER.start, SEMESTER.end)) {
    if (isTeachingDay(iso)) totalTeachingDays++;
  }

  let totalClassHours = 0;
  for (const section of Object.values(SECTIONS)) {
    for (const day of Object.keys(section.weekly)) {
      for (const slot of section.weekly[day]) {
        if (slot) totalClassHours++;
      }
    }
  }

  return (
    <section className="relative py-8">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="glass-card bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl px-6 py-8 sm:px-10"
        >
          <div className="grid grid-cols-3 gap-4 sm:gap-8">
            <StatItem value={daysLeft} label="Days left in semester" />
            <StatItem value={totalTeachingDays} label="Total teaching days" />
            <StatItem value={totalClassHours} label="Class hours (all sections)" suffix="+" />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
