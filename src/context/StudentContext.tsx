import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { SECTIONS } from '@/data/timetables';
import { todayISO, clampToSemester, addDays } from '@/lib/dates';
import { getSubjectInputsFromSection, type SubjectInput } from '@/lib/engine';
import { saveProfile, loadProfile, getLastRoll, clearLastRoll, deleteProfile, hasProfile, type StudentProfile } from '@/lib/storage';

interface StudentContextValue {
  profile: StudentProfile | null;
  sectionKey: string;
  planDate: string;
  mode: 'quick' | 'precise';
  inputs: SubjectInput[];
  plannedLeaves: string[];
  isReturning: boolean;
  setSectionKey: (key: string) => void;
  setPlanDate: (date: string) => void;
  setMode: (mode: 'quick' | 'precise') => void;
  setInputs: (inputs: SubjectInput[]) => void;
  setPlannedLeaves: (leaves: string[]) => void;
  createProfile: (name: string, rollNumber: string, email: string, sectionKey: string) => void;
  loadExistingProfile: (rollNumber: string) => boolean;
  updateProfile: () => void;
  signOut: () => void;
  deleteData: () => void;
  hasExistingProfile: (rollNumber: string) => boolean;
}

const StudentContext = createContext<StudentContextValue | null>(null);

export function StudentProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [sectionKey, setSectionKey] = useState('III-ECE-A');
  const [planDate, setPlanDate] = useState(clampToSemester(addDays(todayISO(), 30)));
  const [mode, setMode] = useState<'quick' | 'precise'>('quick');
  const [inputs, setInputs] = useState<SubjectInput[]>([]);
  const [plannedLeaves, setPlannedLeaves] = useState<string[]>([]);
  const [isReturning, setIsReturning] = useState(false);

  useEffect(() => {
    const lastRoll = getLastRoll();
    if (lastRoll) {
      const existing = loadProfile(lastRoll);
      if (existing) {
        setProfile(existing);
        setSectionKey(existing.sectionKey);
        setPlanDate(existing.planDate);
        setMode(existing.mode);
        setInputs(existing.inputs);
        setPlannedLeaves(existing.plannedLeaves || []);
        setIsReturning(true);
      }
    }
  }, []);

  useEffect(() => {
    if (profile) {
      const updated: StudentProfile = {
        ...profile,
        sectionKey,
        planDate,
        mode,
        inputs,
        plannedLeaves,
        updatedAt: new Date().toISOString(),
      };
      setProfile(updated);
      saveProfile(updated);
    }
  }, [sectionKey, planDate, mode, inputs, plannedLeaves]);

  const createProfile = useCallback((name: string, rollNumber: string, email: string, sKey: string) => {
    const roll = rollNumber.toUpperCase();
    const existing = loadProfile(roll);
    const baseInputs = getSubjectInputsFromSection(sKey, todayISO());
    const newProfile: StudentProfile = {
      name,
      rollNumber: roll,
      email: email || undefined,
      sectionKey: sKey,
      planDate: clampToSemester(addDays(todayISO(), 30)),
      mode: 'quick',
      inputs: existing?.inputs?.length ? existing.inputs : baseInputs,
      plannedLeaves: existing?.plannedLeaves || [],
      createdAt: existing?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setProfile(newProfile);
    setSectionKey(sKey);
    setPlanDate(newProfile.planDate);
    setMode(newProfile.mode);
    setInputs(newProfile.inputs);
    setPlannedLeaves(newProfile.plannedLeaves);
    saveProfile(newProfile);
    setIsReturning(!!existing);
  }, []);

  const loadExistingProfile = useCallback((rollNumber: string): boolean => {
    const existing = loadProfile(rollNumber);
    if (!existing) return false;
    setProfile(existing);
    setSectionKey(existing.sectionKey);
    setPlanDate(existing.planDate);
    setMode(existing.mode);
    setInputs(existing.inputs);
    setPlannedLeaves(existing.plannedLeaves || []);
    setIsReturning(true);
    return true;
  }, []);

  const updateProfile = useCallback(() => {
    if (!profile) return;
    const updated: StudentProfile = {
      ...profile,
      sectionKey,
      planDate,
      mode,
      inputs,
      plannedLeaves,
      updatedAt: new Date().toISOString(),
    };
    setProfile(updated);
    saveProfile(updated);
  }, [profile, sectionKey, planDate, mode, inputs, plannedLeaves]);

  const signOut = useCallback(() => {
    setProfile(null);
    setSectionKey('III-ECE-A');
    setPlanDate(clampToSemester(addDays(todayISO(), 30)));
    setMode('quick');
    setInputs([]);
    setPlannedLeaves([]);
    setIsReturning(false);
    clearLastRoll();
  }, []);

  const deleteData = useCallback(() => {
    if (profile) {
      deleteProfile(profile.rollNumber);
    }
    signOut();
  }, [profile, signOut]);

  const hasExistingProfileFn = useCallback((rollNumber: string): boolean => {
    return hasProfile(rollNumber);
  }, []);

  return (
    <StudentContext.Provider value={{
      profile,
      sectionKey,
      planDate,
      mode,
      inputs,
      plannedLeaves,
      isReturning,
      setSectionKey,
      setPlanDate,
      setMode,
      setInputs,
      setPlannedLeaves,
      createProfile,
      loadExistingProfile,
      updateProfile,
      signOut,
      deleteData,
      hasExistingProfile: hasExistingProfileFn,
    }}>
      {children}
    </StudentContext.Provider>
  );
}

export function useStudent(): StudentContextValue {
  const ctx = useContext(StudentContext);
  if (!ctx) throw new Error('useStudent must be used within StudentProvider');
  return ctx;
}
