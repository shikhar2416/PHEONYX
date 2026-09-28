export const SEMESTER = {
  start: '2026-08-29',
  end: '2026-11-29',
  detentionThreshold: 75,
  goodThreshold: 90,
  teachingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
  holidays: [] as string[],
} as const;

export const PERIOD_TIMINGS = {
  standard: [
    '09.00-09.50', '09.50-10.40', '10.50-11.40', '11.40-12.30',
    '12.30-01.20', '01.20-02.10', '02.10-03.00', '03.10-04.00', '04.00-04.50',
  ],
  firstYear: [
    '09.00-09.50', '09.50-10.45', '10.50-11.40', '11.45-12.35',
    '12.35-01.30', '01.30-02.20', '02.25-03.15', '03.20-04.10', '04.15-05.05',
  ],
} as const;

export interface SlotInfo {
  code: string;
  name: string;
  faculty: string;
  credits: string;
}

export type GridType = 'standard' | 'firstYear';

export interface SectionData {
  label: string;
  year: number;
  semesterNo: string;
  department: string;
  venue: string;
  semesterLabel: string;
  grid: GridType;
  slots: Record<string, SlotInfo>;
  weekly: Record<string, (string | null)[]>;
}

export const SECTIONS: Record<string, SectionData> = {
  'III-ECE-A': {
    label: 'III Year ECE-A  ·  V Semester',
    year: 3, semesterNo: 'V', department: 'ECE',
    venue: 'IST 518/FN',
    semesterLabel: 'Odd Semester 2026-2027',
    grid: 'standard',
    slots: {
      A:   { code: '21ECC301P', name: 'Microprocessor, Microcontroller & Interfacing Techniques', faculty: 'Dr. M. Manikandan', credits: '3-0-2-4' },
      B:   { code: '21ECC302T', name: 'Analog and Digital Communication', faculty: 'Dr. V. Rajesh', credits: '3-0-0-3' },
      C:   { code: '21ECC303T', name: 'Linear Integrated Circuits', faculty: '—', credits: '3-0-0-3' },
      E:   { code: '21ECC304T', name: 'Control Systems', faculty: '—', credits: '3-0-0-3' },
      F:   { code: '21GNP301L', name: 'Community Connect', faculty: '—', credits: '0-0-2-1' },
      K:   { code: '21PDH301T', name: 'Professional Skills', faculty: '—', credits: '2-0-0-2' },
      H:   { code: '21LEM301T', name: 'Open Elective', faculty: '—', credits: '3-0-0-3' },
      CDC: { code: '21PDM301L', name: 'Analytical Thinking (CDC)', faculty: '—', credits: '0-0-2-0' },
      LAB: { code: '21ECC311L', name: 'VLSI Design / Microprocessor Laboratory', faculty: 'Dr. M. Jothi & Dr. P. Murugapandiyan', credits: '0-0-4-2' },
    },
    weekly: {
      Monday:    ['E', 'A', 'A', null, null, 'F', null, 'LAB', 'LAB'],
      Tuesday:   ['H', 'B', null, 'B', 'C', 'A', 'B', null, null],
      Wednesday: ['C', 'A', 'A', 'K', 'F', null, 'E', 'LAB', 'LAB'],
      Thursday:  ['A', 'E', 'K', null, 'LAB', 'A', null, 'K', null],
      Friday:    ['B', 'C', 'E', null, null, 'H', 'A', 'CDC', null],
    },
  },

  'III-ECE-B': {
    label: 'III Year ECE-B  ·  V Semester',
    year: 3, semesterNo: 'V', department: 'ECE',
    venue: 'IST 518/AN',
    semesterLabel: 'Odd Semester 2026-2027',
    grid: 'standard',
    slots: {
      A:   { code: '21ECC301P', name: 'Microprocessor, Microcontroller & Interfacing Techniques', faculty: 'Dr. M. Manikandan', credits: '3-0-2-4' },
      B:   { code: '21ECC302T', name: 'Analog and Digital Communication', faculty: 'Dr. V. Rajesh', credits: '3-0-0-3' },
      C:   { code: '21ECC303T', name: 'Linear Integrated Circuits', faculty: '—', credits: '3-0-0-3' },
      E:   { code: '21ECC304T', name: 'Control Systems', faculty: '—', credits: '3-0-0-3' },
      F:   { code: '21GNP301L', name: 'Community Connect', faculty: '—', credits: '0-0-2-1' },
      K:   { code: '21PDH301T', name: 'Professional Skills', faculty: '—', credits: '2-0-0-2' },
      H:   { code: '21LEM301T', name: 'Open Elective', faculty: '—', credits: '3-0-0-3' },
      CDC: { code: '21PDM301L', name: 'Analytical Thinking (CDC)', faculty: '—', credits: '0-0-2-0' },
      LAB: { code: '21ECC311L', name: 'VLSI Design / Microprocessor Laboratory', faculty: 'Dr. M. Jothi & Dr. P. Murugapandiyan', credits: '0-0-4-2' },
    },
    weekly: {
      Monday:    ['B', 'C', 'E', null, null, 'K', null, 'LAB', 'LAB'],
      Tuesday:   ['A', 'A', 'A', 'H', 'B', null, 'C', null, null],
      Wednesday: ['E', 'B', 'B', 'F', null, null, 'A', 'CDC', null],
      Thursday:  ['C', 'E', 'A', null, 'LAB', 'B', null, 'K', null],
      Friday:    ['H', 'A', 'C', null, null, 'E', 'B', 'LAB', 'LAB'],
    },
  },

  'III-ECE-DS': {
    label: 'III Year ECE-DS  ·  V Semester',
    year: 3, semesterNo: 'V', department: 'ECE',
    venue: 'IST 519/FN',
    semesterLabel: 'Odd Semester 2026-2027',
    grid: 'standard',
    slots: {
      A:   { code: '21ECC301P', name: 'Microprocessor, Microcontroller & Interfacing Techniques', faculty: 'Dr. M. Manikandan', credits: '3-0-2-4' },
      B:   { code: '21ECC302T', name: 'Analog and Digital Communication', faculty: 'Dr. V. Rajesh', credits: '3-0-0-3' },
      C:   { code: '21ECC303T', name: 'Linear Integrated Circuits', faculty: '—', credits: '3-0-0-3' },
      E:   { code: '21ECC304T', name: 'Control Systems', faculty: '—', credits: '3-0-0-3' },
      F:   { code: '21GNP301L', name: 'Community Connect', faculty: '—', credits: '0-0-2-1' },
      K:   { code: '21PDH301T', name: 'Professional Skills', faculty: '—', credits: '2-0-0-2' },
      H:   { code: '21LEM301T', name: 'Open Elective', faculty: '—', credits: '3-0-0-3' },
      CDC: { code: '21PDM301L', name: 'Analytical Thinking (CDC)', faculty: '—', credits: '0-0-2-0' },
      LAB: { code: '21ECC311L', name: 'VLSI Design / Microprocessor Laboratory', faculty: 'Dr. M. Jothi & Dr. P. Murugapandiyan', credits: '0-0-4-2' },
    },
    weekly: {
      Monday:    ['C', 'B', 'B', null, 'K', null, 'E', 'LAB', 'LAB'],
      Tuesday:   ['E', 'A', 'A', 'A', 'C', 'H', null, null, null],
      Wednesday: ['A', 'C', 'E', 'F', null, 'B', 'B', null, 'CDC'],
      Thursday:  ['B', 'E', 'K', null, 'LAB', 'C', null, 'A', null],
      Friday:    ['H', 'A', 'B', null, null, 'E', 'C', 'LAB', 'LAB'],
    },
  },

  'II-ECE-DS-A': {
    label: 'II Year DS-A  ·  III Semester',
    year: 2, semesterNo: 'III', department: 'ECE',
    venue: 'IST 411/FN',
    semesterLabel: 'Odd Semester 2025-2026',
    grid: 'standard',
    slots: {
      A:   { code: '21MAB201T', name: 'Transforms and Boundary Value Problems', faculty: '—', credits: '3-1-0-4' },
      B:   { code: '21ECC201T', name: 'Solid State Devices', faculty: '—', credits: '3-0-0-3' },
      C:   { code: '21CSS201T', name: 'Computer Organization and Architecture', faculty: '—', credits: '3-1-0-4' },
      D:   { code: '21ECC203T', name: 'Digital Logic Design', faculty: '—', credits: '3-0-0-3' },
      E:   { code: '21ECC205T', name: 'Electromagnetic Theory and Interference', faculty: '—', credits: '3-0-0-3' },
      F:   { code: '21LEM201T', name: 'Professional Ethics', faculty: '—', credits: '1-0-0-1' },
      G:   { code: '21LEM202T', name: 'Universal Human Values-II', faculty: '—', credits: '2-1-0-3' },
      K:   { code: '21PDH209T', name: 'Social Engineering', faculty: '—', credits: '2-0-0-2' },
      CDC: { code: '21PDM201L', name: 'Verbal Reasoning', faculty: '—', credits: '0-0-2-0' },
      LAB: { code: '21ECC211L', name: 'Devices and Digital IC Laboratory', faculty: '—', credits: '0-0-4-2' },
    },
    weekly: {
      Monday:    ['B', 'A', 'A', null, 'C', 'D', null, 'LAB', 'LAB'],
      Tuesday:   ['E', 'D', 'D', 'F', 'A', 'B', 'C', null, null],
      Wednesday: ['A', 'C', 'C', 'K', null, null, 'E', 'LAB', 'LAB'],
      Thursday:  ['D', 'B', 'B', null, 'LAB', 'E', null, 'G', null],
      Friday:    ['C', 'A', 'E', null, null, 'G', 'D', 'CDC', null],
    },
  },

  'II-ECE-DS-B': {
    label: 'II Year DS-B  ·  III Semester',
    year: 2, semesterNo: 'III', department: 'ECE',
    venue: 'IST 411/AN',
    semesterLabel: 'Odd Semester 2025-2026',
    grid: 'standard',
    slots: {
      A:   { code: '21MAB201T', name: 'Transforms and Boundary Value Problems', faculty: '—', credits: '3-1-0-4' },
      B:   { code: '21ECC201T', name: 'Solid State Devices', faculty: '—', credits: '3-0-0-3' },
      C:   { code: '21CSS201T', name: 'Computer Organization and Architecture', faculty: '—', credits: '3-1-0-4' },
      D:   { code: '21ECC203T', name: 'Digital Logic Design', faculty: '—', credits: '3-0-0-3' },
      E:   { code: '21ECC205T', name: 'Electromagnetic Theory and Interference', faculty: '—', credits: '3-0-0-3' },
      F:   { code: '21LEM201T', name: 'Professional Ethics', faculty: '—', credits: '1-0-0-1' },
      G:   { code: '21LEM202T', name: 'Universal Human Values-II', faculty: '—', credits: '2-1-0-3' },
      K:   { code: '21PDH209T', name: 'Social Engineering', faculty: '—', credits: '2-0-0-2' },
      CDC: { code: '21PDM201L', name: 'Verbal Reasoning', faculty: '—', credits: '0-0-2-0' },
      LAB: { code: '21ECC211L', name: 'Devices and Digital IC Laboratory', faculty: '—', credits: '0-0-4-2' },
    },
    weekly: {
      Monday:    ['A', 'A', 'B', null, 'E', 'C', null, 'LAB', 'LAB'],
      Tuesday:   ['D', 'D', 'E', 'F', 'B', 'C', 'A', null, null],
      Wednesday: ['C', 'C', 'A', 'K', null, null, 'B', 'LAB', 'LAB'],
      Thursday:  ['B', 'B', 'D', null, 'LAB', 'A', null, 'G', null],
      Friday:    ['E', 'C', 'D', null, null, 'G', 'A', 'CDC', null],
    },
  },

  'IV-ECE-A': {
    label: 'IV Year ECE-A  ·  VII Semester',
    year: 4, semesterNo: 'VII', department: 'ECE',
    venue: 'IST 225',
    semesterLabel: 'Odd Semester 2026-2027',
    grid: 'standard',
    slots: {
      A: { code: '21GNH401T', name: 'Behavioural Psychology', faculty: '—', credits: '2-1-0-3' },
      B: { code: '21ECC401T', name: 'Wireless Communication and Antenna Systems', faculty: '—', credits: '3-0-0-3' },
      C: { code: '21ECC402P', name: 'Computer Communication and Network Security', faculty: '—', credits: '2-1-0-3' },
      D: { code: '21ECE461T', name: 'Semiconductor Memory Design', faculty: '—', credits: '3-0-0-3' },
      E: { code: '21ECE463T', name: 'Scripting Language for Electronic Design Automation', faculty: '—', credits: '3-0-0-3' },
      F: { code: '21CSO355T', name: 'Machine Learning for All', faculty: '—', credits: '3-0-0-3' },
      LAB: { code: '21ECC412L', name: 'Computer Communication and Network Security Lab', faculty: '—', credits: '0-0-2-1' },
    },
    weekly: {
      Monday:    ['B', 'C', 'C', null, 'D', 'E', null, 'LAB', 'LAB'],
      Tuesday:   ['D', 'D', 'B', 'F', 'A', null, 'E', null, null],
      Wednesday: ['E', 'B', 'B', 'A', null, 'C', 'D', 'LAB', 'LAB'],
      Thursday:  ['C', 'A', 'A', null, 'F', 'B', null, 'E', null],
      Friday:    ['F', 'D', 'E', null, null, 'C', 'A', null, null],
    },
  },

  'IV-ECE-B': {
    label: 'IV Year ECE-B  ·  VII Semester',
    year: 4, semesterNo: 'VII', department: 'ECE',
    venue: 'IST 227',
    semesterLabel: 'Odd Semester 2026-2027',
    grid: 'standard',
    slots: {
      A: { code: '21GNH401T', name: 'Behavioural Psychology', faculty: '—', credits: '2-1-0-3' },
      B: { code: '21ECC401T', name: 'Wireless Communication and Antenna Systems', faculty: '—', credits: '3-0-0-3' },
      C: { code: '21ECC402P', name: 'Computer Communication and Network Security', faculty: '—', credits: '2-1-0-3' },
      D: { code: '21ECE461T', name: 'Semiconductor Memory Design', faculty: '—', credits: '3-0-0-3' },
      E: { code: '21ECE463T', name: 'Scripting Language for Electronic Design Automation', faculty: '—', credits: '3-0-0-3' },
      F: { code: '21CSO355T', name: 'Machine Learning for All', faculty: '—', credits: '3-0-0-3' },
      LAB: { code: '21ECC412L', name: 'Computer Communication and Network Security Lab', faculty: '—', credits: '0-0-2-1' },
    },
    weekly: {
      Monday:    ['D', 'D', 'B', null, 'E', 'C', null, 'LAB', 'LAB'],
      Tuesday:   ['B', 'C', 'C', 'A', 'F', null, 'D', null, null],
      Wednesday: ['A', 'A', 'D', 'F', null, 'E', 'B', 'LAB', 'LAB'],
      Thursday:  ['E', 'B', 'B', null, 'A', 'C', null, 'D', null],
      Friday:    ['F', 'E', 'C', null, null, 'A', 'D', null, null],
    },
  },

  'I-ECE-A': {
    label: 'I Year ECE-A  ·  I Semester',
    year: 1, semesterNo: 'I', department: 'ECE',
    venue: 'IST 101/FN',
    semesterLabel: 'Odd Semester 2024-2025',
    grid: 'firstYear',
    slots: {
      A:   { code: '21MAB102T', name: 'Advanced Calculus and Complex Analysis', faculty: '—', credits: '3-1-0-4' },
      B:   { code: '21CYB101J', name: 'Chemistry', faculty: '—', credits: '3-1-2-5' },
      C:   { code: '21BTB102J', name: 'Electronic System and PCB Design', faculty: '—', credits: '2-0-0-2' },
      D:   { code: '21CSS101J', name: 'Programming for Problem Solving', faculty: '—', credits: '3-0-2-4' },
      E:   { code: '21MES101L', name: 'Basic Civil and Mechanical Workshop', faculty: '—', credits: '0-0-4-2' },
      F:   { code: '21BTB103T', name: 'Biology', faculty: '—', credits: '2-0-0-2' },
      CDC: { code: '21PDM102L', name: 'General Aptitude', faculty: '—', credits: '0-0-2-0' },
      GER: { code: '21LEH104T', name: 'German', faculty: '—', credits: '2-1-0-3' },
      PHIL: { code: '21GNH101J', name: 'Philosophy of Engineering', faculty: '—', credits: '1-0-2-2' },
    },
    weekly: {
      Monday:    ['B', 'B', 'A', 'A', null, 'D', 'D', null, null],
      Tuesday:   ['A', 'A', 'C', 'C', 'B', null, 'E', 'E', 'E'],
      Wednesday: ['D', 'D', 'B', 'B', null, 'A', 'A', 'CDC', null],
      Thursday:  ['A', 'A', 'F', 'F', 'B', null, 'D', 'D', null],
      Friday:    ['C', 'C', 'B', 'B', null, 'GER', 'GER', 'PHIL', null],
    },
  },

  'I-ECE-B-EEE': {
    label: 'I Year ECE-B & EEE  ·  I Semester',
    year: 1, semesterNo: 'I', department: 'ECE',
    venue: 'IST 102/FN',
    semesterLabel: 'Odd Semester 2024-2025',
    grid: 'firstYear',
    slots: {
      A:   { code: '21MAB102T', name: 'Advanced Calculus and Complex Analysis', faculty: '—', credits: '3-1-0-4' },
      B:   { code: '21CYB101J', name: 'Chemistry', faculty: '—', credits: '3-1-2-5' },
      C:   { code: '21BTB102J', name: 'Electronic System and PCB Design', faculty: '—', credits: '2-0-0-2' },
      D:   { code: '21CSS101J', name: 'Programming for Problem Solving', faculty: '—', credits: '3-0-2-4' },
      E:   { code: '21MES101L', name: 'Basic Civil and Mechanical Workshop', faculty: '—', credits: '0-0-4-2' },
      F:   { code: '21BTB103T', name: 'Biology', faculty: '—', credits: '2-0-0-2' },
      CDC: { code: '21PDM102L', name: 'General Aptitude', faculty: '—', credits: '0-0-2-0' },
      GER: { code: '21LEH104T', name: 'German', faculty: '—', credits: '2-1-0-3' },
      PHIL: { code: '21GNH101J', name: 'Philosophy of Engineering', faculty: '—', credits: '1-0-2-2' },
    },
    weekly: {
      Monday:    ['A', 'A', 'B', 'B', null, 'D', 'D', null, null],
      Tuesday:   ['D', 'D', 'A', 'A', 'C', null, 'E', 'E', 'E'],
      Wednesday: ['B', 'B', 'D', 'D', null, 'A', 'A', 'CDC', null],
      Thursday:  ['B', 'B', 'A', 'A', 'F', null, 'D', 'D', null],
      Friday:    ['A', 'A', 'C', 'C', null, 'GER', 'GER', 'PHIL', null],
    },
  },

  'I-BIOTECH-B-BME': {
    label: 'I Year Biotech-B & Biomedical  ·  I Semester',
    year: 1, semesterNo: 'I', department: 'BIOTECH',
    venue: 'IST 103/FN',
    semesterLabel: 'Odd Semester 2024-2025',
    grid: 'firstYear',
    slots: {
      A:   { code: '21MAB102T', name: 'Advanced Calculus and Complex Analysis', faculty: '—', credits: '3-1-0-4' },
      B:   { code: '21CYB101J', name: 'Chemistry', faculty: '—', credits: '3-1-2-5' },
      C:   { code: '21BTB102J', name: 'Electronic System and PCB Design', faculty: '—', credits: '2-0-0-2' },
      D:   { code: '21CSS101J', name: 'Programming for Problem Solving', faculty: '—', credits: '3-0-2-4' },
      E:   { code: '21MES101L', name: 'Basic Civil and Mechanical Workshop', faculty: '—', credits: '0-0-4-2' },
      F:   { code: '21BTB103T', name: 'Biology', faculty: '—', credits: '2-0-0-2' },
      CDC: { code: '21PDM102L', name: 'General Aptitude', faculty: '—', credits: '0-0-2-0' },
      GER: { code: '21LEH104T', name: 'German', faculty: '—', credits: '2-1-0-3' },
      PHIL: { code: '21GNH101J', name: 'Philosophy of Engineering', faculty: '—', credits: '1-0-2-2' },
    },
    weekly: {
      Monday:    ['B', 'B', 'D', 'D', null, 'A', 'A', null, null],
      Tuesday:   ['A', 'A', 'B', 'B', 'F', null, 'E', 'E', 'E'],
      Wednesday: ['D', 'D', 'A', 'A', null, 'B', 'B', 'CDC', null],
      Thursday:  ['A', 'A', 'C', 'C', 'B', null, 'D', 'D', null],
      Friday:    ['B', 'B', 'A', 'A', null, 'GER', 'GER', 'PHIL', null],
    },
  },
};

export const SECTION_KEYS = Object.keys(SECTIONS);

export const ROOMS: Record<string, {
  id: string;
  displayName: string;
  building: string;
  floor: number;
  capacity: number;
  type: "classroom" | "lab" | "seminar_hall";
  amenities: string[];
}> = {
  "IST 225": {
    id: "IST 225", displayName: "IST 225",
    building: "IST Block", floor: 2, capacity: 45,
    type: "classroom", amenities: ["Projector", "Whiteboard", "AC"]
  },
  "IST 227": {
    id: "IST 227", displayName: "IST 227",
    building: "IST Block", floor: 2, capacity: 45,
    type: "classroom", amenities: ["Projector", "Whiteboard", "AC"]
  },
  "IST 411": {
    id: "IST 411", displayName: "IST 411",
    building: "IST Block", floor: 4, capacity: 60,
    type: "classroom", amenities: ["Projector", "Whiteboard", "AC"]
  },
  "IST 518": {
    id: "IST 518", displayName: "IST 518",
    building: "IST Block", floor: 5, capacity: 50,
    type: "classroom", amenities: ["Projector", "Whiteboard", "AC"]
  },
  "IST 519": {
    id: "IST 519", displayName: "IST 519",
    building: "IST Block", floor: 5, capacity: 50,
    type: "classroom", amenities: ["Projector", "Whiteboard", "AC"]
  },
  "IST 602": {
    id: "IST 602", displayName: "IST 602",
    building: "IST Block", floor: 6, capacity: 35,
    type: "classroom", amenities: ["Projector", "Whiteboard", "AC"]
  },
  "IST 625": {
    id: "IST 625", displayName: "IST 625",
    building: "IST Block", floor: 6, capacity: 40,
    type: "seminar_hall", amenities: ["Projector", "Whiteboard", "AC"]
  }
};

export function normalizeVenueToRoomId(venue: string): string {
  return venue.replace(/\/(FN|AN)$/i, "").trim();
}
