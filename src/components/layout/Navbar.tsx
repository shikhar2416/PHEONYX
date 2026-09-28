import { Link, useLocation } from 'react-router-dom';
import { CalendarCheck, DoorOpen, Menu, X } from 'lucide-react';
import { useState } from 'react';
import ThemeToggle from './ThemeToggle';
import Button from '@/components/ui/Button';

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const isLanding = location.pathname === '/';

  const navLinks = [
    { label: 'How it works', href: '/#how-it-works' },
    { label: 'Features', href: '/#features' },
    { label: 'Data', href: '/data' },
    { label: 'Free Classes', href: '/free-classes' },
    { label: 'Pick Class', href: '/select' },
  ];

  return (
    <header className="sticky top-0 z-50 no-print">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 mt-3 rounded-2xl px-4 bg-base-900/60 backdrop-blur-xl border border-white/10">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-110 transition-transform">
              <CalendarCheck className="w-5 h-5 text-base-900" strokeWidth={2.5} />
            </div>
            <span className="font-heading font-bold text-lg text-white tracking-tight">Attendify</span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="px-3.5 py-2 text-sm text-slate-300 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2.5">
            <ThemeToggle />
            <Link to="/select" className="hidden sm:block">
              <Button size="sm" className="shadow-lg shadow-emerald-500/20">
                Get Started
              </Button>
            </Link>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-lg bg-white/5 border border-white/10 text-white"
              aria-label="Menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="md:hidden mt-2 rounded-2xl p-3 bg-base-800/90 backdrop-blur-xl border border-white/10 flex flex-col gap-1">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="px-4 py-2.5 text-sm text-slate-300 hover:text-white rounded-lg hover:bg-white/5"
              >
                {link.label}
              </a>
            ))}
            <Link to="/select" onClick={() => setMobileOpen(false)}>
              <Button size="sm" className="w-full mt-1">Get Started</Button>
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
