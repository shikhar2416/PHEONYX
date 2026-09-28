import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CalendarDays, Clock, ShieldCheck, Target,
  Copy, Printer, RotateCcw, Share2, Calculator,
} from 'lucide-react';
import { useStudent } from '@/context/StudentContext';
import { useToast } from '@/components/ui/Toast';
import { SECTIONS } from '@/data/timetables';
import { todayISO, formatShort } from '@/lib/dates';
import { computeEngine, getSubjectInputsFromSection } from '@/lib/engine';
import { buildShareUrl, copyToClipboard, parseShareUrl } from '@/lib/share';
import ProfileHeader from '@/components/student/ProfileHeader';
import Tabs, { type TabId } from '@/components/attendance/Tabs';
import AttendanceInput from '@/components/attendance/AttendanceInput';
import DatePlanner from '@/components/dashboard/DatePlanner';
import VerdictBanner from '@/components/dashboard/VerdictBanner';
import KpiCard from '@/components/dashboard/KpiCard';
import SubjectTable from '@/components/dashboard/SubjectTable';
import SubjectGauge from '@/components/dashboard/SubjectGauge';
import ProjectionChart from '@/components/dashboard/ProjectionChart';
import RemainingBarChart from '@/components/dashboard/RemainingBarChart';
import BunkBudget from '@/components/dashboard/BunkBudget';
import TimetableGrid from '@/components/attendance/TimetableGrid';
import ChatbotWidget from '@/components/chatbot/ChatbotWidget';
import LeaveBudget from '@/components/leaves/LeaveBudget';
import LeaveCalendar from '@/components/leaves/LeaveCalendar';
import LeaveSuggester from '@/components/leaves/LeaveSuggester';
import LeaveRangePlanner from '@/components/leaves/LeaveRangePlanner';
import Button from '@/components/ui/Button';

export default function Attendance() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const {
    profile, sectionKey, planDate, setPlanDate, inputs, setInputs,
  setSectionKey, signOut,
  } = useStudent();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [recalcKey, setRecalcKey] = useState(0);

  useEffect(() => {
    const shared = parseShareUrl(searchParams);
    const sharedSection = shared?.section ?? searchParams.get('section');
    if (!sharedSection || !SECTIONS[sharedSection]) return;
    setSectionKey(sharedSection);
    if (shared) {
      setPlanDate(shared.planDate);
      setInputs(shared.inputs);
    } else {
      setInputs(getSubjectInputsFromSection(sharedSection, todayISO()));
    }
  }, [searchParams, setPlanDate, setSectionKey, setInputs]);

  const today = todayISO();

  const result = useMemo(() => {
    if (!SECTIONS[sectionKey] || inputs.length === 0) return null;
    try {
      return computeEngine(sectionKey, today, planDate, inputs);
    } catch {
      return null;
    }
  }, [sectionKey, today, planDate, inputs, recalcKey]);

  if (!profile) {
    return <Navigate to="/select" replace />;
  }

  const handleCopySummary = async () => {
    if (!result) return;
    const lines = [
      'Attendify Summary',
      `Name: ${profile.name} (${profile.rollNumber})`,
      `Section: ${sectionKey}`,
      `Date: ${formatShort(today)}`,
      `Plan date: ${formatShort(planDate)}`,
      `Overall: ${result.aggregate.currentPct?.toFixed(1) ?? '—'}%`,
      `Must attend for 75%: ${result.aggregate.clampedNeeded75}/${result.aggregate.remaining}`,
      `Must attend for 90%: ${result.aggregate.clampedNeeded90}/${result.aggregate.remaining}`,
      `Bunks allowed: ${result.aggregate.bunksAllowed75}`,
      `Status: ${result.worstStatus}`,
    ];
    await copyToClipboard(lines.join('\n'));
    showToast('Summary copied to clipboard', 'success');
  };

  const handleShare = async () => {
    const url = buildShareUrl(window.location.origin, sectionKey, planDate, inputs);
    await copyToClipboard(url);
    showToast('Share link copied to clipboard', 'success');
  };

  const handleReset = () => {
    setInputs(getSubjectInputsFromSection(sectionKey, today));
    setRecalcKey((k) => k + 1);
    showToast('Attendance reset', 'info');
  };

  const handleSignOut = () => {
    signOut();
    navigate('/select');
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 space-y-6">
      <ProfileHeader />

      <Tabs active={activeTab} onChange={setActiveTab} />

      <AnimatePresence mode="wait">
        {activeTab === 'overview' && (
          <motion.div key="overview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} className="space-y-6">
            <DatePlanner planDate={planDate} onChange={setPlanDate} />

            {result && <VerdictBanner result={result} />}

            {result && (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <KpiCard icon={<CalendarDays className="w-5 h-5" />} label="Classes left (semester)" value={result.totalClassesLeft} accent="cyan" />
                <KpiCard icon={<Clock className="w-5 h-5" />} label={`Left till ${formatShort(result.planDate)}`} value={result.totalClassesLeftTillPlanDate} accent="emerald" />
                <KpiCard icon={<ShieldCheck className="w-5 h-5" />} label="Must attend for 75%" value={result.aggregate.clampedNeeded75} accent="amber" />
                <KpiCard icon={<Target className="w-5 h-5" />} label="Must attend for 90%" value={result.aggregate.clampedNeeded90} accent="rose" />
              </div>
            )}

            {result && <BunkBudget result={result} />}

            {result && (
              <div className="grid lg:grid-cols-2 gap-4">
                <ProjectionChart sectionKey={sectionKey} inputs={inputs} todayISO={today} />
                <RemainingBarChart subjects={result.subjects} />
              </div>
            )}

            <div className="flex flex-wrap gap-2 no-print pt-2">
              <Button variant="secondary" size="sm" onClick={handleCopySummary}><Copy className="w-3.5 h-3.5" /> Copy summary</Button>
              <Button variant="secondary" size="sm" onClick={() => window.print()}><Printer className="w-3.5 h-3.5" /> Print / Save PDF</Button>
              <Button variant="secondary" size="sm" onClick={handleShare}><Share2 className="w-3.5 h-3.5" /> Share link</Button>
              <Button variant="ghost" size="sm" onClick={() => setRecalcKey((k) => k + 1)}><Calculator className="w-3.5 h-3.5" /> Recalculate</Button>
              <Button variant="ghost" size="sm" onClick={handleReset}><RotateCcw className="w-3.5 h-3.5" /> Reset</Button>
              <Button variant="ghost" size="sm" onClick={handleSignOut}>Sign out</Button>
            </div>
          </motion.div>
        )}

        {activeTab === 'subjects' && (
          <motion.div key="subjects" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} className="space-y-6">
            <AttendanceInput />
            {result && (
              <>
                <div>
                  <h3 className="font-heading font-semibold text-white text-lg mb-4">Per-Subject Breakdown</h3>
                  <SubjectTable subjects={result.subjects} />
                </div>
                <div>
                  <h3 className="font-heading font-semibold text-white text-lg mb-4">Attendance Gauges</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                    {result.subjects.map((s) => <SubjectGauge key={s.code} subject={s} />)}
                  </div>
                </div>
              </>
            )}
          </motion.div>
        )}

        {activeTab === 'leaves' && (
          <motion.div key="leaves" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} className="space-y-6">
            <LeaveBudget />
            <LeaveCalendar />
            <LeaveSuggester />
            <LeaveRangePlanner />
          </motion.div>
        )}

        {activeTab === 'timetable' && (
          <motion.div key="timetable" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
            <TimetableGrid sectionKey={sectionKey} />
          </motion.div>
        )}
      </AnimatePresence>
      <ChatbotWidget />
    </div>
  );
}
