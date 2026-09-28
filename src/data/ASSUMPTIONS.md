# Data & Assumptions — Attendify

## Semester Constants
- **Start:** 29 August 2026
- **End:** 29 November 2026
- **Detention Threshold:** 75%
- **Safe/Target Threshold:** 90%
- **Teaching Days:** Monday–Friday (weekends skipped)
- **Holidays:** None recorded (empty array). Add ISO date strings to `SEMESTER.holidays` as needed.

## Slot-Based Data Model
Each section's timetable is a two-level structure:
1. **Weekly Grid** — a `day → period → slot letter` mapping. Cells contain slot letters (A–K, LAB, CDC, etc.), not subject names.
2. **Slot Lookup** — a `letter → {code, name, faculty, credits}` table unique to each section.

This separation allows the same grid pattern to resolve to different subjects for different sections.

## Lab Double-Period Counting
When a lab slot (LAB) occupies multiple consecutive cells in the weekly grid, each cell is counted as one class occurrence. For example, if LAB appears in periods 8 and 9 on Monday, that counts as 2 classes, not 1. This is documented in `lib/engine.ts`.

## Section-Specific Assumptions

### III-ECE-A, III-ECE-B, III-ECE-DS (V Semester)
- Slots B, C, E, H, K were filled with plausible V-semester ECE core/elective subjects based on the provided reference table.
- Faculty names marked "—" are unknown and left as placeholders.
- The weekly grids for III-ECE-B and III-ECE-DS are plausible rearrangements of III-ECE-A's pattern, keeping the same slot frequencies to maintain credit consistency.

### II-ECE-DS-A, II-ECE-DS-B (III Semester)
- All slot mappings (A–K, CDC, LAB) are taken directly from the provided III Semester reference table.
- The two sections share the same slot table but have different weekly grids (DS-B is a shifted version of DS-A).

### IV-ECE-A, IV-ECE-B (VII Semester)
- All slot mappings (A–F, LAB) are taken from the provided VII Semester reference table.
- IV-ECE-B has a rearranged weekly grid based on IV-ECE-A's pattern.

### I-ECE-A, I-ECE-B-EEE, I-BIOTECH-B-BME (I Semester / First Year)
- Uses the `firstYear` period timing grid (9 periods, ending at 17:05).
- Slot letters A–F, CDC are taken from the provided first-year reference table.
- German (21LEH104T) is assigned slot key `GER`, Philosophy of Engineering (21GNH101J) is assigned slot key `PHIL` since these subjects don't map to the standard A–K letters.
- The three first-year sections share the same slot table but have permuted weekly grids to reflect different section schedules.
- Workshop (E slot) occupies 3 consecutive periods on Tuesday, reflecting its 0-0-4-2 credit structure.

## General Assumptions
1. All sections follow a Monday–Friday teaching schedule. No Saturday/Sunday classes.
2. Each period in the grid counts as one class session, regardless of duration.
3. Null cells in the weekly grid represent free periods and are not counted.
4. The semester dates (29 Aug – 29 Nov 2026) are hardcoded constants, not user-editable.
5. Demo data uses realistic attendance percentages (70–95%) for demonstration purposes.
6. Section venues and labels are based on the provided spec; some venue numbers for first-year sections (IST 101/102/103) are plausible assumptions.
