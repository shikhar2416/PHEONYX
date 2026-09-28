import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Play } from 'lucide-react';
import SplitText from '@/components/ui/SplitText';
import MockDashboard from './MockDashboard';
import Button from '@/components/ui/Button';

export default function Hero() {
  return (
    <section className="relative pt-12 pb-20 sm:pt-16 sm:pb-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 font-medium mb-6"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              VibeCraft Round 1 — The Overworld
            </motion.div>

            <SplitText
              text="Know exactly how many classes you can afford to miss."
              tag="h1"
              className="text-4xl sm:text-5xl lg:text-6xl font-bold font-heading text-white leading-[1.1] tracking-tight"
              delay={30}
              duration={0.8}
              from={{ opacity: 0, y: 50 }}
              to={{ opacity: 1, y: 0 }}
              textAlign="left"
            />

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5, duration: 0.5 }}
              className="mt-6 text-lg text-slate-400 max-w-xl mx-auto lg:mx-0 leading-relaxed"
            >
              Attendify predicts your attendance against the mandatory{' '}
              <span className="text-rose-400 font-semibold">75% detention line</span> for the
              29 Aug → 29 Nov 2026 semester. No more guessing — just the exact number.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.8, duration: 0.5 }}
              className="mt-8 flex flex-col sm:flex-row gap-3 justify-center lg:justify-start"
            >
              <Link to="/select">
                <Button size="lg" className="w-full sm:w-auto">
                  Calculate My Attendance
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <a href="#how-it-works">
                <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                  <Play className="w-4 h-4" />
                  See how it works
                </Button>
              </a>
            </motion.div>
          </div>

          <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-80 h-80 rounded-full bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 blur-3xl" />
            </div>
            <MockDashboard />
          </div>
        </div>
      </div>
    </section>
  );
}
