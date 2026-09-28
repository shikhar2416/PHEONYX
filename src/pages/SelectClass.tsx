import { useNavigate } from 'react-router-dom';
import SectionGrid from '@/components/select/SectionGrid';

export default function SelectClass() {
  const navigate = useNavigate();

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold font-heading text-white mb-2">
          Pick your class
        </h1>
        <p className="text-slate-400 text-sm max-w-xl mx-auto">
          Select your section to load its timetable, subjects, and venue. Then we'll ask for your name and roll number.
        </p>
      </div>
      <SectionGrid onSelect={(key) => navigate(`/student/${encodeURIComponent(key)}`)} />
    </div>
  );
}
