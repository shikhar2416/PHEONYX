# Attendify — The Attendance Predictor

> Know exactly how many classes you can afford to miss.

Attendify is a hackathon submission for **VibeCraft Round 1 — The Overworld**. It predicts a college student's attendance trajectory against the mandatory 75% detention line for the 29 Aug – 29 Nov 2026 semester, and tells them the exact number of remaining classes they must attend to stay safe, reach 90%, or warns them if recovery is mathematically impossible.

---

## Problem Recap

College students lose track of how many classes they **must attend** (not just how many they've missed). Existing portals only show past data. Attendify builds a dashboard that tells a student, for each subject, how many of the **remaining** classes they must attend to:

- Stay above / climb back above the mandatory **75% detention line**
- Reach or maintain **90%**
- Loudly warns if recovery is **mathematically impossible**

**Semester:** starts 29 August 2026, ends 29 November 2026 (hardcoded constants).
**Detention threshold:** 75%. **Safe/target threshold:** 90%.

---

## Mathematical Formulas

### Required Future Attendance

$$\text{needed}(T) = \lceil T \times (C + R) - A \rceil$$

Where:
- $A$ = classes attended so far
- $C$ = classes conducted so far
- $R$ = remaining classes till semester end
- $T$ = target fraction (0.75 or 0.90)

### Clamped Needed

$$\text{clampedNeeded} = \min(\max(\text{needed}, 0), R)$$

### Status

$$\text{status} = \begin{cases} \text{SAFE} & \text{if needed} \leq 0 \\ \text{AT\_RISK} & \text{if } 0 < \text{needed} \leq R \\ \text{IMPOSSIBLE} & \text{if needed} > R \end{cases}$$

### Attendance Percentages

$$\text{currentPct} = \frac{A}{C} \times 100 \quad (C > 0)$$

$$\text{maxPossiblePct} = \frac{A + R}{C + R} \times 100 \quad \text{(attend everything)}$$

$$\text{minPossiblePct} = \frac{A}{C + R} \times 100 \quad \text{(attend nothing)}$$

### Bunks Allowed

$$\text{bunksAllowed} = \max(R - \text{needed}, 0)$$

### Required Rate

$$\text{requiredRate} = \frac{\text{clampedNeeded}}{R} \times 100$$

---

## Slot-Based Data Model

The timetables are **slot-based**, not subject-based. A timetable cell contains a **slot letter** (A–K, LAB, CDC, etc.), not a subject name. Each section has its own `slot → {subjectCode, subjectName, faculty, credits}` lookup table.

The data layer is two-level:
1. **Weekly Grid** — `day × period → slot letter`
2. **Slot Lookup** — `letter → subject info`

This separation allows the same grid pattern to resolve to different subjects for different sections. Subject names are **never** hardcoded into the grid.

### Occurrence Counting

`countOccurrences(sectionKey, fromDate, toDate)` iterates day by day (inclusive). Weekends and holidays are skipped. For each teaching day, the weekly array is read, each non-null slot is resolved via `slots[]`, and the subject's code is incremented. Lab double-periods count as the number of cells they occupy.

---

## Assumptions

- Semester: 29 Aug – 29 Nov 2026, Monday–Friday, no holidays.
- Lab double-periods count as the number of cells occupied (e.g., 2 cells = 2 classes).
- Faculty marked "—" are unknown placeholders.
- Weekly grids for sections sharing a slot table are plausible rearrangements maintaining credit consistency.
- First-year German (GER) and Philosophy (PHIL) use custom slot keys since they don't map to A–K.
- See `src/data/ASSUMPTIONS.md` for the full list.

---

## Setup

```bash
npm install
npm run dev
```

The app runs entirely in the browser — no backend, no login, no tracking. All inputs persist to localStorage.

---

## Worked Example

**Scenario:** III-ECE-A, subject "Analog and Digital Communication" (21ECC302T)

- Attended (A) = 12
- Conducted (C) = 20
- Remaining (R) = 18

**For 75%:**
- needed = ceil(0.75 × (20 + 18) − 12) = ceil(0.75 × 38 − 12) = ceil(28.5 − 12) = ceil(16.5) = **17**
- 17 ≤ 18, so status = **AT_RISK** (must attend 17 of 18 remaining)
- Bunks allowed = 18 − 17 = **1**

**For 90%:**
- needed = ceil(0.90 × 38 − 12) = ceil(34.2 − 12) = ceil(22.2) = **23**
- 23 > 18, so status = **IMPOSSIBLE** (cannot reach 90% even by attending everything)

---

## Feature Checklist (F1–F7)

| Feature | Status |
|---------|--------|
| **F1** Section dropdown (10 sections, card-based selector) | ✅ |
| **F2** Enter current attendance per subject (Quick & Precise modes) | ✅ |
| **F3** Auto-detect today's date + future planning date picker (constrained to semester end) | ✅ |
| **F4** Total classes left (overall + per subject) + classes left till plan date | ✅ |
| **F5** Must attend for 75% + max bunks allowed | ✅ |
| **F6** Must attend for 90% | ✅ |
| **F7** Irreversible Detention alert (full-width, pulsing border, shake animation, plain-English explanation) | ✅ |

---

## Tech Stack

- React 18 + Vite + TypeScript
- Tailwind CSS (dark mode by default, light mode toggle)
- framer-motion (animations)
- recharts (charts)
- lucide-react (icons)
- GSAP + @gsap/react (SplitText component)
- date-fns (date utilities)
- react-router-dom (routing)

---

## Elevator Pitch

Attendify is the attendance predictor college students actually need. Instead of showing you a number that's already too late, it tells you the exact count: "attend 9 of your next 12 classes and you're safe." Pick your section, enter your attendance, choose a planning date, and get a survival number per subject — plus a loud, unmissable alert when recovery is mathematically impossible. No backend, no login, just clarity.
