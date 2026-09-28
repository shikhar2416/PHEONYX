import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { SECTIONS, SECTION_KEYS } from '@/data/timetables';

export default function SectionShowcase() {
  return (
    <section className="py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="text-center mb-10">
          <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Sections</span>
          <h2 className="mt-2 text-3xl sm:text-4xl font-bold font-heading text-white">
            10 sections, pre-loaded with real timetables
          </h2>
          <p className="mt-3 text-slate-400 text-sm max-w-xl mx-auto">
            Click any section to jump straight to the dashboard with it pre-selected.
          </p>
        </div>

        <div className="flex gap-3 overflow-x-auto pb-4 snap-x snap-mandatory -mx-4 px-4 scrollbar-thin">
          {SECTION_KEYS.map((key, i) => {
            const s = SECTIONS[key];
            const subjectCount = Object.keys(s.slots).length;
            return (
              <motion.div
                key={key}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
                className="flex-shrink-0 snap-center"
              >
                <Link to={`/student/${encodeURIComponent(key)}`}>
                  <div className="w-60 glass-card bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-5 hover:border-emerald-400/30 hover:bg-white/[0.08] transition-all cursor-pointer group">
                    <div className="flex items-start justify-between mb-3">
                      <span className="text-xs font-mono text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-md">
                        {key}
                      </span>
                      <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
                    </div>
                    <h3 className="font-heading font-semibold text-white text-sm mb-1">{s.label}</h3>
                    <p className="text-xs text-slate-500 mb-3">{s.semesterLabel}</p>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">Venue: <span className="text-slate-300">{s.venue}</span></span>
                      <span className="text-cyan-400 font-medium">{subjectCount} subjects</span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
