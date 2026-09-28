import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CalendarDays, Clock, ShieldCheck, Target,
  Copy, Printer, RotateCcw, Share2, ArrowRight, ArrowLeft,
} from 'lucide-react';
import Stepper from '@/components/dashboard/Stepper';
import SectionPicker from '@/components/dashboard/SectionPicker';
import DatePlanner from '@/components/dashboard/DatePlanner';
import AttendanceInput from '@/components/dashboard/AttendanceInput';
import VerdictBanner from '@/components/dashboard/VerdictBanner';
import KpiCard from '@/components/dashboard/KpiCard';
import SubjectTable from '@/components/dashboard/SubjectTable';
import SubjectGauge from '@/components/dashboard/SubjectGauge';
import ProjectionChart from '@/components/dashboard/ProjectionChart';
import RemainingBarChart from '@/components/dashboard/RemainingBarChart';
import BunkBudget from '@/components/dashboard/BunkBudget';
import Button from '@/components/ui/Button';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { SECTIONS } from '@/data/timetables';
import { todayISO, clampToSemester, formatShort } from '@/lib/dates';
import {
  computeEngine, getSubjectInputsFromSection, type SubjectInput,
} from '@/lib/engine';

const STEPS = ['Setup', 'Input', 'Results'];

export default function Dashboard() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSection = searchParams.get('section') || 'III-ECE-A';

  const [stage, setStage] = useState(0);
  const [sectionKey, setSectionKey] = useLocalStorage('attendify-section', initialSection);
  const [planDate, setPlanDate] = useLocalStorage('attendify-planDate', clampToSemester(addDaysSafe(todayISO(), 30)));
  const [mode, setMode] = useLocalStorage<'quick' | 'precise'>('attendify-mode', 'quick');
  const [fillAllPct, setFillAllPct] = useLocalStorage('attendify-fillPct', 80);
  const [inputs, setInputs] = useLocalStorage<SubjectInput[]>('attendify-inputs', []);

  const today = todayISO();

  useEffect(() => {
    const sParam = searchParams.get('section');
    if (sParam && SECTIONS[sParam]) {
      setSectionKey(sParam);
    }
  }, [searchParams, setSectionKey]);

  useEffect(() => {
    if (SECTIONS[sectionKey]) {
      const base = getSubjectInputsFromSection(sectionKey, today);
      if (inputs.length === 0 || inputs[0]?.code !== base[0]?.code) {
        setInputs(base);
      }
    }
  }, [sectionKey]);

  const result = useMemo(() => {
    if (!SECTIONS[sectionKey] || inputs.length === 0) return null;
    try {
      return computeEngine(sectionKey, today, planDate, inputs);
    } catch {
      return null;
    }
  }, [sectionKey, today, planDate, inputs]);

  const handleSectionSelect = (key: string) => {
    setSectionKey(key);
    const base = getSubjectInputsFromSection(key, today);
    setInputs(base);
  };

  const handleShare = () => {
    const url = `${window.location.origin}/dashboard?section=${encodeURIComponent(sectionKey)}`;
    navigator.clipboard.writeText(url);
  };

  const handleCopySummary = () => {
    if (!result) return;
    const lines = [
      'Attendify Summary',
      `Section: ${sectionKey}`,
      `Date: ${formatShort(today)}`,
      `Plan date: ${formatShort(planDate)}`,
      `Overall: ${result.aggregate.currentPct?.toFixed(1) ?? '—'}%`,
      `Must attend for 75%: ${result.aggregate.clampedNeeded75}/${result.aggregate.remaining}`,
      `Must attend for 90%: ${result.aggregate.clampedNeeded90}/${result.aggregate.remaining}`,
      `Bunks allowed: ${result.aggregate.bunksAllowed75}`,
      `Status: ${result.worstStatus}`,
    ];
    navigator.clipboard.writeText(lines.join('\n'));
  };

  const handleReset = () => {
    setInputs(getSubjectInputsFromSection(sectionKey, today));
    setStage(0);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
      <Stepper
        current={stage}
        steps={STEPS}
        onStepClick={(i) => i < stage && setStage(i)}
      />

      <AnimatePresence mode="wait">
        {stage === 0 && (
          <motion.div
            key="stage0"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <SectionPicker selected={sectionKey} onSelect={handleSectionSelect} />
            <div className="mt-8">
              <DatePlanner planDate={planDate} onChange={setPlanDate} />
            </div>
            <div className="mt-8 flex justify-center">
              <Button size="lg" onClick={() => setStage(1)}>
                Continue to Input
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>
        )}

        {stage === 1 && (
          <motion.div
            key="stage1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <AttendanceInput
              sectionKey={sectionKey}
              mode={mode}
              onModeChange={setMode}
              inputs={inputs}
              onInputsChange={setInputs}
              fillAllPct={fillAllPct}
              onFillAllPctChange={setFillAllPct}
            />
            <div className="mt-8 flex justify-between">
              <Button variant="ghost" onClick={() => setStage(0)}>
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
              <Button size="lg" onClick={() => setStage(2)}>
                Calculate Results
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>
        )}

        {stage === 2 && result && (
          <motion.div
            key="stage2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <VerdictBanner result={result} />

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <KpiCard
                icon={<CalendarDays className="w-5 h-5" />}
                label="Classes left (semester)"
                value={result.totalClassesLeft}
                accent="cyan"
              />
              <KpiCard
                icon={<Clock className="w-5 h-5" />}
                label={`Left till ${formatShort(result.planDate)}`}
                value={result.totalClassesLeftTillPlanDate}
                accent="emerald"
              />
              <KpiCard
                icon={<ShieldCheck className="w-5 h-5" />}
                label="Must attend for 75%"
                value={result.aggregate.clampedNeeded75}
                accent="amber"
              />
              <KpiCard
                icon={<Target className="w-5 h-5" />}
                label="Must attend for 90%"
                value={result.aggregate.clampedNeeded90}
                accent="rose"
              />
            </div>

            <BunkBudget result={result} />

            <div>
              <h3 className="font-heading font-semibold text-white text-lg mb-4">
                Per-Subject Breakdown
              </h3>
              <SubjectTable subjects={result.subjects} />
            </div>

            <div>
              <h3 className="font-heading font-semibold text-white text-lg mb-4">
                Attendance Gauges
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                {result.subjects.map((s) => (
                  <SubjectGauge key={s.code} subject={s} />
                ))}
              </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-4">
              <ProjectionChart
                sectionKey={sectionKey}
                inputs={inputs}
                todayISO={today}
              />
              <RemainingBarChart subjects={result.subjects} />
            </div>

            <div className="flex flex-wrap gap-2 no-print pt-4 border-t border-white/10">
              <Button variant="secondary" size="sm" onClick={handleCopySummary}>
                <Copy className="w-3.5 h-3.5" />
                Copy summary
              </Button>
              <Button variant="secondary" size="sm" onClick={() => window.print()}>
                <Printer className="w-3.5 h-3.5" />
                Print / Save PDF
              </Button>
              <Button variant="secondary" size="sm" onClick={handleShare}>
                <Share2 className="w-3.5 h-3.5" />
                Share link
              </Button>
              <Button variant="ghost" size="sm" onClick={handleReset}>
                <RotateCcw className="w-3.5 h-3.5" />
                Reset
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setStage(1)}>
                <ArrowLeft className="w-3.5 h-3.5" />
                Back to input
              </Button>
            </div>
          </motion.div>
        )}

        {stage === 2 && !result && (
          <div className="text-center py-20">
            <p className="text-slate-400">Something went wrong. Try going back and reselecting your section.</p>
            <Button variant="secondary" className="mt-4" onClick={() => setStage(0)}>
              Back to setup
            </Button>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function addDaysSafe(iso: string, days: number): string {
  const d = new Date(iso);
  d.setDate(d.getDate() + days);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dd}`;
}
