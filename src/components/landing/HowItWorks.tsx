import { motion } from 'framer-motion';
import { ListChecks, UserCircle, PencilLine, CalendarClock, Target } from 'lucide-react';

const steps = [
  { icon: ListChecks, title: 'Pick your class', desc: 'Search 10 pre-loaded sections by year, department, or subject. Filter to find yours fast.' },
  { icon: UserCircle, title: 'Enter your identity', desc: 'Give us your name and roll number. We save it locally so you never lose your progress.' },
  { icon: PencilLine, title: 'Log your attendance', desc: 'Quick mode (just %) or Precise mode (attended & conducted). Auto-fills from timetable.' },
  { icon: CalendarClock, title: 'Plan your leaves', desc: 'Mark leave days on the calendar, get safe-leave suggestions, and check date ranges.' },
  { icon: Target, title: 'Get your exact survival number', desc: 'See exactly how many of the remaining classes you must attend to stay above 75%.' },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-16 sm:py-24 scroll-mt-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="text-center mb-12">
          <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">How it works</span>
          <h2 className="mt-2 text-3xl sm:text-4xl font-bold font-heading text-white">
            Five steps to your survival number
          </h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-5">
          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="relative"
            >
              <div className="glass-card bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 h-full">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400/20 to-cyan-400/20 border border-emerald-400/20 flex items-center justify-center">
                    <step.icon className="w-5 h-5 text-emerald-400" />
                  </div>
                  <span className="text-3xl font-bold font-heading text-white/10">{i + 1}</span>
                </div>
                <h3 className="font-heading font-semibold text-white text-base mb-1.5">{step.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{step.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
