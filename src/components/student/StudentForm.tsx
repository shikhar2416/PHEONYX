import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Hash, ArrowRight, RotateCcw } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useStudent } from '@/context/StudentContext';
import { SECTIONS } from '@/data/timetables';

interface StudentFormProps {
  sectionKey: string;
}

export default function StudentForm({ sectionKey }: StudentFormProps) {
  const navigate = useNavigate();
  const { createProfile, loadExistingProfile, hasExistingProfile, isReturning } = useStudent();
  const section = SECTIONS[sectionKey];

  const [name, setName] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState<{ name?: string; roll?: string; email?: string }>({});
  const [rollExists, setRollExists] = useState(false);
  const [checkingRoll, setCheckingRoll] = useState(false);

  useEffect(() => {
    if (rollNumber.length >= 6) {
      setCheckingRoll(true);
      const t = setTimeout(() => {
        setRollExists(hasExistingProfile(rollNumber));
        setCheckingRoll(false);
      }, 300);
      return () => clearTimeout(t);
    }
    setRollExists(false);
  }, [rollNumber, hasExistingProfile]);

  const validate = (): boolean => {
    const e: { name?: string; roll?: string; email?: string } = {};
    if (!name || name.length < 3) e.name = 'Name must be at least 3 characters';
    if (name.length > 50) e.name = 'Name must be at most 50 characters';
    if (!/^[a-zA-Z\s.]+$/.test(name)) e.name = 'Only letters, spaces, and dots allowed';
    if (!rollNumber || rollNumber.length < 6) e.roll = 'Roll number must be at least 6 characters';
    if (rollNumber.length > 20) e.roll = 'Roll number must be at most 20 characters';
    if (!/^[a-zA-Z0-9]+$/.test(rollNumber)) e.roll = 'Only alphanumeric characters allowed';
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Invalid email format';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    createProfile(name, rollNumber.toUpperCase(), email, sectionKey);
    navigate('/attendance');
  };

  const handleLoadExisting = () => {
    const loaded = loadExistingProfile(rollNumber.toUpperCase());
    if (loaded) navigate('/attendance');
  };

  const isValid = name.length >= 3 && rollNumber.length >= 6 && !checkingRoll;

  return (
    <div className="max-w-md mx-auto w-full">
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 mb-4">
          <span className="font-mono">{sectionKey}</span>
          <span className="text-slate-500">·</span>
          <span>{section?.venue}</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold font-heading text-white mb-2">
          Almost there — who are you?
        </h2>
        <p className="text-slate-400 text-sm">
          We save your data locally so you never lose your progress.
        </p>
      </div>

      {rollExists && (
        <div className="mb-4 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
          <p className="text-sm text-emerald-200 mb-3">
            Welcome back! We found a saved profile for this roll number.
          </p>
          <Button size="sm" variant="outline" onClick={handleLoadExisting} className="w-full">
            <RotateCcw className="w-3.5 h-3.5" />
            Load my saved data
          </Button>
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="text-xs font-medium text-slate-400 mb-1.5 block">Full Name</label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Arjun Sharma"
              className={`w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border text-white text-sm placeholder:text-slate-500 transition-colors focus:bg-white/10 ${
                errors.name ? 'border-rose-500/50' : 'border-white/10 focus:border-emerald-400/50'
              }`}
            />
          </div>
          {errors.name && <span className="text-xs text-rose-400 mt-1 block">{errors.name}</span>}
        </div>

        <div>
          <label className="text-xs font-medium text-slate-400 mb-1.5 block">Roll Number</label>
          <div className="relative">
            <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={rollNumber}
              onChange={(e) => setRollNumber(e.target.value.toUpperCase())}
              placeholder="e.g. RA2411004010123"
              className={`w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border text-white text-sm placeholder:text-slate-500 transition-colors focus:bg-white/10 uppercase ${
                errors.roll ? 'border-rose-500/50' : 'border-white/10 focus:border-emerald-400/50'
              }`}
            />
          </div>
          {errors.roll && <span className="text-xs text-rose-400 mt-1 block">{errors.roll}</span>}
        </div>

        <div>
          <label className="text-xs font-medium text-slate-400 mb-1.5 block">Email (optional)</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. arjun@example.com"
              className={`w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border text-white text-sm placeholder:text-slate-500 transition-colors focus:bg-white/10 ${
                errors.email ? 'border-rose-500/50' : 'border-white/10 focus:border-emerald-400/50'
              }`}
            />
          </div>
          {errors.email && <span className="text-xs text-rose-400 mt-1 block">{errors.email}</span>}
        </div>

        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-500">Section: {section?.label}</span>
          <button
            onClick={() => navigate('/select')}
            className="text-emerald-400 hover:text-emerald-300 font-medium"
          >
            Change class
          </button>
        </div>

        <Button
          size="lg"
          onClick={handleSubmit}
          disabled={!isValid}
          className={`w-full ${isValid ? 'shadow-lg shadow-emerald-500/20' : ''}`}
        >
          Continue to my attendance
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
