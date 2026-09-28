import { type SubjectInput } from './engine';

export interface StudentProfile {
  name: string;
  rollNumber: string;
  email?: string;
  sectionKey: string;
  planDate: string;
  mode: 'quick' | 'precise';
  inputs: SubjectInput[];
  plannedLeaves: string[];
  createdAt: string;
  updatedAt: string;
}

const PROFILE_PREFIX = 'attendify:profile:';
const LAST_ROLL_KEY = 'attendify:lastRoll';

export function getProfileKey(rollNumber: string): string {
  return `${PROFILE_PREFIX}${rollNumber.toUpperCase()}`;
}

export function saveProfile(profile: StudentProfile): void {
  const key = getProfileKey(profile.rollNumber);
  localStorage.setItem(key, JSON.stringify(profile));
  localStorage.setItem(LAST_ROLL_KEY, profile.rollNumber.toUpperCase());
}

export function loadProfile(rollNumber: string): StudentProfile | null {
  const key = getProfileKey(rollNumber);
  const raw = localStorage.getItem(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as StudentProfile;
  } catch {
    return null;
  }
}

export function getLastRoll(): string | null {
  return localStorage.getItem(LAST_ROLL_KEY);
}

export function clearLastRoll(): void {
  localStorage.removeItem(LAST_ROLL_KEY);
}

export function deleteProfile(rollNumber: string): void {
  const key = getProfileKey(rollNumber);
  localStorage.removeItem(key);
  if (getLastRoll() === rollNumber.toUpperCase()) {
    clearLastRoll();
  }
}

export function hasProfile(rollNumber: string): boolean {
  return localStorage.getItem(getProfileKey(rollNumber)) !== null;
}
