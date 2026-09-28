import { useNavigate } from 'react-router-dom';
import { Pencil, LogOut, Trash2, MapPin, CalendarDays, Hash } from 'lucide-react';
import { useStudent } from '@/context/StudentContext';
import { SECTIONS } from '@/data/timetables';
import { todayISO, formatLong } from '@/lib/dates';
import Button from '@/components/ui/Button';

export default function ProfileHeader() {
  const navigate = useNavigate();
  const { profile, sectionKey, signOut, deleteData } = useStudent();
  const section = SECTIONS[sectionKey];
  if (!profile) return null;

  const initials = profile.name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div className="glass-card bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-5">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-cyan-400 flex items-center justify-center text-base-900 font-bold font-heading text-xl flex-shrink-0">
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="font-heading font-bold text-white text-lg">Hi, {profile.name}</h2>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-xs text-slate-300 font-mono">
              <Hash className="w-3 h-3" />
              {profile.rollNumber}
            </span>
          </div>
          <div className="flex items-center gap-3 flex-wrap mt-1.5 text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {section?.label} · {section?.venue}
            </span>
            <span className="flex items-center gap-1">
              <CalendarDays className="w-3 h-3" />
              {formatLong(todayISO())}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Button size="sm" variant="ghost" onClick={() => navigate('/select')}>
            <Pencil className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Edit profile</span>
          </Button>
          <Button size="sm" variant="ghost" onClick={() => { signOut(); navigate('/select'); }}>
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sign out</span>
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              if (window.confirm('Delete this saved profile and all attendance data? This cannot be undone.')) {
                deleteData();
                navigate('/select');
              }
            }}
            aria-label="Delete saved profile"
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-400" />
            <span className="hidden sm:inline text-rose-300">Delete data</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
