import { motion } from 'framer-motion';
import { TrendingUp, AlertTriangle, Clock } from 'lucide-react';

export default function MockDashboard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, rotateX: 15 }}
      animate={{ opacity: 1, y: 0, rotateX: 0 }}
      transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}
      className="relative"
      style={{ perspective: 1000 }}
    >
      <div className="glass-card bg-base-800/80 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-2xl shadow-emerald-500/10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-rose-400/60" />
            <div className="w-2.5 h-2.5 rounded-full bg-amber-400/60" />
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400/60" />
          </div>
          <span className="text-xs text-slate-500 font-body">attendify.live</span>
        </div>

        <div className="flex items-center gap-5">
          <div className="relative w-28 h-28 flex-shrink-0">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="8" />
              <motion.circle
                cx="50" cy="50" r="42"
                fill="none"
                stroke="url(#ringGrad)"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray="264"
                initial={{ strokeDashoffset: 264 }}
                animate={{ strokeDashoffset: 264 - (264 * 0.78) }}
                transition={{ duration: 1.5, delay: 0.5, ease: 'easeOut' }}
              />
              <defs>
                <linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#34D399" />
                  <stop offset="100%" stopColor="#22D3EE" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2 }}
                className="text-2xl font-bold font-heading text-white tabular-nums"
              >
                78%
              </motion.span>
              <span className="text-[10px] text-slate-500">attendance</span>
            </div>
          </div>

          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <Clock className="w-4 h-4 text-amber-400" />
              <span className="text-sm text-amber-200 font-medium">12 classes left</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span className="text-sm text-emerald-200">Attend 9 of 12 to stay safe</span>
            </div>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1.8, duration: 0.5 }}
          className="mt-4 -mb-2 flex items-center gap-2 px-3 py-2 rounded-lg bg-rose-500/15 border border-rose-500/30"
        >
          <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
          <span className="text-xs text-rose-200 font-medium">IRREVERSIBLE DETENTION risk for DLD</span>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2, duration: 0.4 }}
        className="absolute -bottom-4 -right-4 glass-card bg-base-700/90 backdrop-blur-xl border border-white/15 rounded-xl px-4 py-2.5 shadow-xl"
      >
        <span className="text-xs text-slate-400">Last safe bunk:</span>
        <span className="text-sm text-emerald-400 font-semibold ml-1.5">Nov 14</span>
      </motion.div>
    </motion.div>
  );
}
