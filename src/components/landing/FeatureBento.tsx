import { motion } from 'framer-motion';
import {
  Calculator, ShieldCheck, Trophy, AlertTriangle,
  CalendarClock, BarChart3, Coffee, WifiOff, CalendarRange, UserCheck,
} from 'lucide-react';

const features = [
  { icon: UserCheck, title: 'Student identity', desc: 'Save your name, roll number, and section. Your data persists locally across visits.', span: 'sm:col-span-2' },
  { icon: ShieldCheck, title: '75% survival math', desc: 'Exactly how many of the remaining classes you must attend to stay above the detention line.', span: '' },
  { icon: Trophy, title: '90% target tracker', desc: 'See what it takes to reach or maintain 90% attendance.', span: '' },
  { icon: AlertTriangle, title: 'Irreversible Detention alert', desc: 'Loud, pulsing warning when recovery is mathematically impossible.', span: 'sm:col-span-2' },
  { icon: CalendarClock, title: 'Future-date planner', desc: 'Pick any date up to 29 Nov 2026 and see classes remaining until then.', span: '' },
  { icon: BarChart3, title: 'Per-subject breakdown', desc: 'Detailed cards with attendance %, bunks allowed, and projected outcomes.', span: '' },
  { icon: Coffee, title: 'Leave tracker', desc: 'Plan leaves on a calendar, get safe-leave suggestions, and see per-subject impact.', span: '' },
  { icon: CalendarRange, title: 'Day-off planner', desc: 'Check if a date range leave is safe before you commit.', span: '' },
  { icon: Calculator, title: 'Remaining-class counter', desc: 'Total classes left in the semester, overall and per subject.', span: '' },
  { icon: WifiOff, title: 'Offline-ready', desc: 'All inputs persist to localStorage. No backend, no login, no tracking.', span: '' },
];

export default function FeatureBento() {
  return (
    <section id="features" className="py-16 sm:py-24 scroll-mt-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="text-center mb-12">
          <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Features</span>
          <h2 className="mt-2 text-3xl sm:text-4xl font-bold font-heading text-white">
            Everything you need to stay above the line
          </h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
              className={f.span}
            >
              <div className="glass-card bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-5 h-full hover:border-emerald-400/20 hover:bg-white/[0.07] transition-all group">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400/15 to-cyan-400/15 border border-white/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <f.icon className="w-5 h-5 text-emerald-400" />
                </div>
                <h3 className="font-heading font-semibold text-white text-sm mb-1">{f.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{f.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
