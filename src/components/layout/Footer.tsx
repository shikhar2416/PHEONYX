import { Link } from 'react-router-dom';
import { CalendarCheck, Github, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-white/10 no-print">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-cyan-400 flex items-center justify-center">
              <CalendarCheck className="w-4.5 h-4.5 text-base-900" strokeWidth={2.5} />
            </div>
            <div>
              <p className="font-heading font-bold text-white text-sm">Attendify</p>
              <p className="text-xs text-slate-500">The Attendance Predictor</p>
            </div>
          </div>

          <nav className="flex items-center gap-4 text-sm text-slate-400">
            <Link to="/data" className="hover:text-emerald-400 transition-colors">Data & Assumptions</Link>
            <Link to="/dashboard" className="hover:text-emerald-400 transition-colors">Dashboard</Link>
            <a href="/#how-it-works" className="hover:text-emerald-400 transition-colors">How it works</a>
          </nav>

          <div className="text-xs text-slate-500 text-center md:text-right">
            <p className="flex items-center gap-1.5 justify-center md:justify-end">
              Team VibeCrafters
            </p>
            <p className="mt-1">VibeCraft Round 1 — The Overworld</p>
          </div>
        </div>
        <div className="mt-6 pt-6 border-t border-white/5 text-center text-xs text-slate-600">
          Built with React, Vite, Tailwind CSS, framer-motion, recharts & GSAP.
        </div>
      </div>
    </footer>
  );
}
