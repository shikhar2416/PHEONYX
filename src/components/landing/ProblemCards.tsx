import { motion } from 'framer-motion';
import { History, AlertCircle, Hash } from 'lucide-react';

const cards = [
  {
    icon: History,
    title: 'Portals show the past, not the future',
    desc: 'Your college portal tells you what already happened. It never tells you what comes next or what to do about it.',
  },
  {
    icon: AlertCircle,
    title: 'You find out too late',
    desc: 'By the time you see 74%, the semester is almost over. There is no runway left to recover — and nobody warned you.',
  },
  {
    icon: Hash,
    title: 'Nobody tells you the number',
    desc: 'Everyone says "maintain 75%". Nobody says "attend 9 of the next 12 classes." That number is all that matters.',
  },
];

export default function ProblemCards() {
  return (
    <section className="py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="text-center mb-12">
          <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">The Problem</span>
          <h2 className="mt-2 text-3xl sm:text-4xl font-bold font-heading text-white">
            Attendance portals are reactive, not predictive
          </h2>
        </div>
        <div className="grid sm:grid-cols-3 gap-5">
          {cards.map((card, i) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
            >
              <div className="glass-card bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 h-full hover:border-white/20 transition-colors">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-500/20 to-amber-500/20 border border-white/10 flex items-center justify-center mb-4">
                  <card.icon className="w-6 h-6 text-rose-400" />
                </div>
                <h3 className="font-heading font-semibold text-white text-lg mb-2">{card.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{card.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
