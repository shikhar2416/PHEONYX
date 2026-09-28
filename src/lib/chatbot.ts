import { SECTIONS, SEMESTER, ROOMS, PERIOD_TIMINGS, normalizeVenueToRoomId } from '@/data/timetables';
import {
  countOccurrences, computeEngine,
  type SubjectInput, type SubjectResult, neededForTarget, getStatus,
} from './engine';
import {
  getClassesOnDate, suggestSafeLeaves, evaluateLeaveRange,
} from './leaves';
import {
  todayISO, addDays, clampToSemester, isTeachingDay, getDayName,
  formatShort, formatLong, eachDay, parseISO,
} from './dates';
import {
  getAllFreeRoomsAt, getOccupancySnapshot, getPeriodIndexFromTime,
  getFreeConsecutivePeriods, getPeriodTimeRange,
} from './occupancy';
import type {
  Intent, ChatEntity, ChatbotContext, ChatbotResponse, IntentResult,
} from './chatbotTypes';

/* ── Intent detection ─────────────────────────────────────── */

function normalize(s: string): string {
  return s.toLowerCase().trim().replace(/[''`]/g, '').replace(/\s+/g, ' ');
}

function detectIntent(text: string): IntentResult {
  const q = normalize(text);

  // Irreversible detention explanation
  if (/\b(irreversible|detention|impossible|can'?t recover|no recovery)\b/.test(q) && /\b(why|explain|what does|meaning)\b/.test(q))
    return { intent: 'explain_irreversible_detention', entities: {} };
  if (/\b(irreversible|detention)\b/.test(q) && /\b(any|which|am i|check)\b/.test(q))
    return { intent: 'check_irreversible_detention', entities: {} };

  // Formula explanation
  if (/\b(how (did|do) you calculate|explain the (formula|calculation|math)|show the math|how (are|is) .* calculated|what does attend .* out of .* mean)\b/.test(q))
    return { intent: 'explain_formula', entities: {} };

  // Profile / context
  if (/\b(my )?(selected |current )?section\b/.test(q) && !/\b(left|remaining|classes)\b/.test(q))
    return { intent: 'get_selected_section', entities: {} };
  if (/\b(plan(ning)? date|selected date|planning date)\b/.test(q))
    return { intent: 'get_selected_plan_date', entities: {} };
  if (/\b(input mode|quick mode|precise mode|which mode|am i using)\b/.test(q))
    return { intent: 'get_input_mode', entities: {} };
  if (/\b(what data|which data|how do you know|what info)\b/.test(q))
    return { intent: 'get_input_mode', entities: {} };

  // Safe leave suggestion
  if (/\b(suggest|recommend).*(leave|bunk|skip|miss)\b/.test(q) || /\b(safe (leave|bunk) plan|safe to bunk|which day.*safe|safest.*bunk)\b/.test(q))
    return { intent: 'get_safe_leave_suggestion', entities: {} };

  // Skip date range
  if (/\b(from|between)\s.*\s(to|till|until|and|-)\s/.test(q) && /\b(leave|skip|miss|bunk|take)\b/.test(q)) {
    const entities = extractDateRange(q);
    return { intent: 'check_skip_range', entities };
  }

  // Skip tomorrow / specific date
  if (/\b(skip|miss|bunk|take leave|leave on)\b/.test(q) && /\b(tomorrow|today|next week|this week|\d{4}-\d{2}-\d{2}|\d{1,2}\/\d{1,2})\b/.test(q)) {
    const entities = extractDate(q);
    if (entities.dateRange) return { intent: 'check_skip_range', entities };
    return { intent: 'check_skip_date', entities };
  }

  // Skip next N classes of a subject
  const skipNMatch = q.match(/\b(?:skip|miss|bunk)\s+(?:the\s+)?next\s+(\d+)\s+class(?:es)?\b/);
  if (skipNMatch) {
    const entities = extractSubject(q);
    entities.classCount = parseInt(skipNMatch[1], 10);
    return { intent: 'check_skip_next_n_classes', entities };
  }

  // Next lab
  if (/\b(next lab|when.*lab|lab schedule|which lab)\b/.test(q))
    return { intent: 'get_next_lab', entities: {} };

  // Most frequent subjects
  if (/\b(most often|most frequent|which subject.*most|frequency|often)\b/.test(q))
    return { intent: 'get_most_frequent_subjects', entities: {} };

  // Day timetable
  const weekdayMatch = q.match(/\b(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/);
  if (weekdayMatch && (/\b(what class|timetable|schedule|show.*day|have on)\b/.test(q) || /\bclass\b/.test(q))) {
    return { intent: 'get_day_timetable', entities: { weekday: capitalize(weekdayMatch[1]) } };
  }
  if (/\b(this week|weekly timetable|week schedule|show.*week)\b/.test(q))
    return { intent: 'get_week_timetable', entities: {} };

  // Best possible attendance
  if (/\b(best possible|maximum possible|highest.*attendance|best.*final|max.*attendance|can i reach 100)\b/.test(q)) {
    const entities = extractSubject(q);
    return { intent: 'get_best_possible_attendance', entities };
  }

  // Can I reach 90% / 75%
  if (/\b(reach|achieve|get to|maintain|hit)\b/.test(q) && /\b90\s*%?\b/.test(q)) {
    const entities = extractSubject(q);
    entities.threshold = 90;
    return { intent: 'get_needed_for_90', entities };
  }
  if (/\b(reach|achieve|get to|maintain|hit)\b/.test(q) && /\b75\s*%?\b/.test(q)) {
    const entities = extractSubject(q);
    entities.threshold = 75;
    return { intent: 'get_needed_for_75', entities };
  }

  // Needed for 75% / 90%
  if (/\b(needed|must attend|have to attend|require|how many.*attend|attend.*stay|attend.*safe|above 75)\b/.test(q)) {
    const entities = extractSubject(q);
    if (/\b90\s*%?\b/.test(q)) { entities.threshold = 90; return { intent: 'get_needed_for_90', entities }; }
    return { intent: 'get_needed_for_75', entities };
  }

  // Bunks / leaves left
  if (/\b(leaves? left|bunks? left|skip|miss|afford|can i miss|can i skip|how many.*leave|how many.*bunk)\b/.test(q)) {
    const entities = extractSubject(q);
    if (entities.subjectCode) return { intent: 'get_subject_bunks_left', entities };
    return { intent: 'get_bunks_left', entities };
  }

  // Riskiest subject
  if (/\b(riskiest|most risky|worst|danger|at risk|risky)\b/.test(q))
    return { intent: 'get_riskiest_subject', entities: {} };

  // Irreversible detention check
  if (/\b(irreversible|detention|impossible)\b/.test(q))
    return { intent: 'check_irreversible_detention', entities: {} };

  // Subject attendance
  if (/\b(my attendance|current attendance|attendance in|attendance for|what.*attendance)\b/.test(q)) {
    const entities = extractSubject(q);
    if (entities.subjectCode) return { intent: 'get_subject_attendance', entities };
  }

  // Classes left
  if (/\b(classes? left|classes? remaining|classes left till|classes left until|how many.*left|total.*left|semester.*left)\b/.test(q)) {
    if (/\b(plan|planning|selected|my date|till|until)\b/.test(q))
      return { intent: 'get_classes_left_till_date', entities: {} };
    return { intent: 'get_total_classes_left', entities: {} };
  }

  // Subject-specific classes left (also falls through from above if subject mentioned)
  const subjForClasses = extractSubject(q);
  if (subjForClasses.subjectCode && /\b(classes? left|classes? remaining|how many.*left)\b/.test(q))
    return { intent: 'get_subject_attendance', entities: subjForClasses };

  // Free room locator: is a specific room free?
  const roomMatch = q.match(/\bist\s*(\d{3})\b/);
  if (roomMatch && /\b(free|busy|occupied|available)\b/.test(q)) {
    const roomId = `IST ${roomMatch[1]}`;
    if (ROOMS[roomId]) {
      return { intent: 'is_room_free', entities: { roomId } };
    }
  }

  // Free room at a specific time
  if (/\b(free|empty|available)\b/.test(q) && /\b(room|class|classroom)\b/.test(q) && /\bat\b/.test(q)) {
    const timeMatch = q.match(/\bat\s+(\d{1,2}[.:]\d{2})\b/);
    if (timeMatch) return { intent: 'get_free_rooms_at_time', entities: { timeStr: timeMatch[1].replace('.', ':') } };
  }

  // Free rooms now
  if (/\b(free room|empty class|where can i sit|quiet room|free classroom|find a room|free class|which room.*free|rooms.*free|available room)\b/.test(q))
    return { intent: 'get_free_rooms_now', entities: {} };

  // Subject attendance fallback (if subject is mentioned and nothing else matched)
  const subjAny = extractSubject(q);
  if (subjAny.subjectCode)
    return { intent: 'get_subject_attendance', entities: subjAny };

  // Room question fallback
  if (/\b(room|classroom|ist\s*\d{3})\b/.test(q) && /\b(free|busy|available|empty|occup)\b/.test(q)) {
    return { intent: 'get_free_rooms_now', entities: {} };
  }

  return { intent: 'fallback_unknown', entities: {} };
}

/* ── Entity extraction ────────────────────────────────────── */

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function extractSubject(text: string): ChatEntity {
  const section = SECTIONS[getDummySectionKey()];
  if (!section) return {};

  const q = normalize(text);

  // Build a list of all subject names + codes for the section
  const subjects: { code: string; name: string; slot: string }[] = [];
  for (const [slot, info] of Object.entries(section.slots)) {
    subjects.push({ code: info.code, name: info.name.toLowerCase(), slot });
  }

  // Try exact code match
  for (const s of subjects) {
    if (q.includes(s.code.toLowerCase())) {
      const info = section.slots[s.slot];
      return { subjectCode: s.code, subjectName: info.name };
    }
  }

  // Fuzzy match: check if any significant word from the query appears in the subject name
  let bestMatch: { code: string; name: string; score: number } | null = null;
  for (const s of subjects) {
    const words = s.name.split(/\s+/).filter((w) => w.length > 3 && !['the', 'and', 'for', 'with', 'from', 'basic', 'general', 'professional'].includes(w));
    let score = 0;
    for (const word of words) {
      if (q.includes(word)) score += word.length;
    }
    // Also check direct substring
    if (q.includes(s.name)) score += 100;
    if (score > 0 && (!bestMatch || score > bestMatch.score)) {
      bestMatch = { code: s.code, name: section.slots[s.slot].name, score };
    }
  }

  if (bestMatch && bestMatch.score >= 4) {
    return { subjectCode: bestMatch.code, subjectName: bestMatch.name };
  }

  return {};
}

// We need the section from context, but extractSubject is called before we have context.
// We'll store the section key in a module-level variable set by the main answer function.
let _activeSectionKey = 'III-ECE-A';

function setSectionKey(key: string): void {
  _activeSectionKey = key;
}

function getDummySectionKey(): string {
  return _activeSectionKey;
}

function extractDate(text: string): ChatEntity {
  const q = normalize(text);
  const today = todayISO();

  if (/\btomorrow\b/.test(q)) return { date: addDays(today, 1) };
  if (/\btoday\b/.test(q)) return { date: today };
  if (/\bnext week\b/.test(q)) return { date: addDays(today, 7) };
  if (/\bthis week\b/.test(q)) {
    // find next Friday
    let d = today;
    for (let i = 0; i < 7; i++) {
      if (getDayName(d) === 'Friday') return { date: d };
      d = addDays(d, 1);
    }
    return { date: addDays(today, 5) };
  }
  if (/\bsemester end\b/.test(q)) return { date: SEMESTER.end };

  // ISO date YYYY-MM-DD
  const isoMatch = q.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (isoMatch) return { date: `${isoMatch[1]}-${isoMatch[2]}-${isoMatch[3]}` };

  // DD/MM or DD/MM/YYYY
  const slashMatch = q.match(/(\d{1,2})\/(\d{1,2})(?:\/(\d{4}))?/);
  if (slashMatch) {
    const day = slashMatch[1].padStart(2, '0');
    const month = slashMatch[2].padStart(2, '0');
    const year = slashMatch[3] || '2026';
    return { date: `${year}-${month}-${day}` };
  }

  // Month name + day: "October 10", "Oct 14"
  const months = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
  const monthsShort = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
  const monthMatch = q.match(/\b(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\s+(\d{1,2})\b/);
  if (monthMatch) {
    const monthName = monthMatch[1];
    const monthIdx = months.indexOf(monthName) >= 0 ? months.indexOf(monthName) : monthsShort.indexOf(monthName);
    if (monthIdx >= 0) {
      const day = monthMatch[2].padStart(2, '0');
      const month = String(monthIdx + 1).padStart(2, '0');
      return { date: `2026-${month}-${day}` };
    }
  }

  return {};
}

function extractDateRange(text: string): ChatEntity {
  const q = normalize(text);
  const today = todayISO();

  // "from X to Y", "between X and Y", "X to Y"
  const fromToMatch = q.match(/\b(?:from|between)\s+(.+?)\s+(?:to|till|until|and|-)\s+(.+?)(?:\s|$)/);
  if (fromToMatch) {
    const fromResult = extractDate(fromToMatch[1]);
    const toResult = extractDate(fromToMatch[2]);
    if (fromResult.date && toResult.date) {
      return { dateRange: { from: clampToSemester(fromResult.date), to: clampToSemester(toResult.date) } };
    }
  }

  // "Oct 10 to Oct 14" pattern
  const monthsShort = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
  const monthsFull = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
  const rangeMatch = q.match(/\b(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\s+(\d{1,2})\s+(?:to|till|until|-|and)\s+(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)?\s*(\d{1,2})\b/);
  if (rangeMatch) {
    const fromMonth = rangeMatch[1];
    const fromDay = rangeMatch[2];
    const toMonth = rangeMatch[3] || fromMonth;
    const toDay = rangeMatch[4];
    const fromResult = extractDate(`${fromMonth} ${fromDay}`);
    const toResult = extractDate(`${toMonth} ${toDay}`);
    if (fromResult.date && toResult.date) {
      return { dateRange: { from: clampToSemester(fromResult.date), to: clampToSemester(toResult.date) } };
    }
  }

  return {};
}

/* ── Subject matching with context ────────────────────────── */

function matchSubject(query: string, sectionKey: string): { code: string; name: string; slot: string } | null {
  const section = SECTIONS[sectionKey];
  if (!section) return null;
  const q = normalize(query);

  // Try exact code match
  for (const [slot, info] of Object.entries(section.slots)) {
    if (q.includes(info.code.toLowerCase())) {
      return { code: info.code, name: info.name, slot };
    }
  }

  // Fuzzy match
  let bestMatch: { code: string; name: string; slot: string; score: number } | null = null;
  for (const [slot, info] of Object.entries(section.slots)) {
    const subjName = info.name.toLowerCase();
    const words = subjName.split(/\s+/).filter((w) => w.length > 3 && !['the', 'and', 'for', 'with', 'from', 'basic', 'general', 'professional', 'systems', 'design', 'laboratory', 'theory', 'interference'].includes(w));
    let score = 0;
    for (const word of words) {
      if (q.includes(word)) score += word.length;
    }
    if (q.includes(subjName)) score += 100;
    if (score > 0 && (!bestMatch || score > bestMatch.score)) {
      bestMatch = { code: info.code, name: info.name, slot, score };
    }
  }

  if (bestMatch && bestMatch.score >= 4) return bestMatch;
  return null;
}

/* ── Fallback suggestions ─────────────────────────────────── */

const FALLBACK_SUGGESTIONS = [
  'How many leaves can I still take?',
  'Can I still reach 90%?',
  'What classes are left till my planning date?',
  'What is my riskiest subject?',
];

const OUT_OF_SCOPE =
  "I can help with your attendance, timetable, section, subject-wise planning, and leave calculations. I can\u2019t reliably answer that from the current app data.";
const MISSING_DATA =
  "I need a bit more information to answer that accurately. Please enter your attendance details for the relevant subject first.";
const AMBIGUOUS =
  "I\u2019m not sure which subject or date you mean. Please mention the subject name or exact date.";
const IMPOSSIBLE_NO_INPUT =
  "I can calculate that once your attended/conducted classes or attendance percentage is filled in.";
const INTERNAL_ERROR =
  "Something went wrong while checking your attendance data. Please try again.";

/* ── Main answer generation ───────────────────────────────── */

export function answerQuery(
  rawQuery: string,
  ctx: ChatbotContext,
): ChatbotResponse {
  try {
    setSectionKey(ctx.sectionKey);

    if (!ctx.profileName) {
      return {
        text: "You haven\u2019t selected a profile yet. Pick your class section and enter your name and roll number to get started.",
        followUps: [],
      };
    }

    const { intent, entities } = detectIntent(rawQuery);

    // Re-extract subject with the correct section context
    if (!entities.subjectCode) {
      const matched = matchSubject(rawQuery, ctx.sectionKey);
      if (matched) {
        entities.subjectCode = matched.code;
        entities.subjectName = matched.name;
      }
    }

    // Compute engine results
    const hasAttendance = ctx.inputs.length > 0 && ctx.inputs.some((i) => i.conducted > 0 || i.attended > 0);
    let result: ReturnType<typeof computeEngine> | null = null;
    if (hasAttendance) {
      try {
        result = computeEngine(ctx.sectionKey, ctx.today, ctx.planDate, ctx.inputs);
      } catch { result = null; }
    }

    switch (intent) {
      case 'get_total_classes_left':
        return answerTotalClassesLeft(ctx, result);
      case 'get_classes_left_till_date':
        return answerClassesLeftTillDate(ctx, result);
      case 'get_subject_attendance':
        return answerSubjectAttendance(ctx, result, entities);
      case 'get_needed_for_75':
        return answerNeededFor(ctx, result, entities, 75);
      case 'get_needed_for_90':
        return answerNeededFor(ctx, result, entities, 90);
      case 'get_bunks_left':
        return answerBunksLeft(ctx, result);
      case 'get_subject_bunks_left':
        return answerSubjectBunksLeft(ctx, result, entities);
      case 'get_riskiest_subject':
        return answerRiskiestSubject(ctx, result);
      case 'check_irreversible_detention':
        return answerIrreversibleCheck(ctx, result);
      case 'get_next_lab':
        return answerNextLab(ctx);
      case 'get_day_timetable':
        return answerDayTimetable(ctx, entities);
      case 'get_week_timetable':
        return answerWeekTimetable(ctx);
      case 'check_skip_date':
        return answerSkipDate(ctx, entities);
      case 'check_skip_range':
        return answerSkipRange(ctx, entities);
      case 'check_skip_next_n_classes':
        return answerSkipNextN(ctx, result, entities);
      case 'explain_formula':
        return answerExplainFormula(ctx, result, entities);
      case 'explain_irreversible_detention':
        return answerExplainIrreversible(ctx, result, entities);
      case 'get_selected_section':
        return answerSelectedSection(ctx);
      case 'get_selected_plan_date':
        return answerSelectedPlanDate(ctx);
      case 'get_input_mode':
        return answerInputMode(ctx);
      case 'get_safe_leave_suggestion':
        return answerSafeLeaveSuggestion(ctx);
      case 'get_most_frequent_subjects':
        return answerMostFrequent(ctx);
      case 'get_best_possible_attendance':
        return answerBestPossible(ctx, result, entities);
      case 'get_free_rooms_now':
        return answerFreeRoomsNow(ctx);
      case 'get_free_rooms_at_time':
        return answerFreeRoomsAtTime(ctx, entities);
      case 'is_room_free':
        return answerIsRoomFree(ctx, entities);
      default:
        return { text: OUT_OF_SCOPE, followUps: FALLBACK_SUGGESTIONS };
    }
  } catch {
    return { text: INTERNAL_ERROR, followUps: FALLBACK_SUGGESTIONS };
  }
}

/* ── Individual answer functions ──────────────────────────── */

function getSubjectByCode(ctx: ChatbotContext, code: string): SubjectResult | null {
  if (!ctx.inputs.length) return null;
  const section = SECTIONS[ctx.sectionKey];
  if (!section) return null;
  const slot = Object.values(section.slots).find((s) => s.code === code);
  if (!slot) return null;
  // Build a single-subject result from engine
  try {
    const r = computeEngine(ctx.sectionKey, ctx.today, ctx.planDate, ctx.inputs);
    return r.subjects.find((s) => s.code === code) ?? null;
  } catch {
    return null;
  }
}

function fmtPct(n: number | null): string {
  if (n === null || isNaN(n)) return 'N/A';
  return `${n.toFixed(1)}%`;
}

function answerTotalClassesLeft(ctx: ChatbotContext, result: ReturnType<typeof computeEngine> | null): ChatbotResponse {
  if (!result) return { text: MISSING_DATA, followUps: FALLBACK_SUGGESTIONS };
  const total = result.totalClassesLeft;
  const tillPlan = result.totalClassesLeftTillPlanDate;
  const r = result.aggregate;
  const text = `You have ${total} classes left in the semester.${tillPlan !== total ? ` Till your planning date (${formatShort(result.planDate)}), you have ${tillPlan} classes.` : ''} To stay above 75%, you need to attend at least ${r.clampedNeeded75} of those ${total} classes. You can safely miss ${r.bunksAllowed75}.`;
  return {
    text,
    followUps: ['How many can I miss for 90%?', 'What is my riskiest subject?', 'Can I still reach 90%?'],
  };
}

function answerClassesLeftTillDate(ctx: ChatbotContext, result: ReturnType<typeof computeEngine> | null): ChatbotResponse {
  if (!result) return { text: MISSING_DATA, followUps: FALLBACK_SUGGESTIONS };
  return {
    text: `Till your selected planning date (${formatShort(result.planDate)}), you have ${result.totalClassesLeftTillPlanDate} classes remaining. After that date, there are ${result.totalClassesLeft - result.totalClassesLeftTillPlanDate} more classes till the semester ends.`,
    followUps: ['How many must I attend for 75%?', 'Can I skip tomorrow?', 'What is my current attendance?'],
  };
}

function answerSubjectAttendance(ctx: ChatbotContext, result: ReturnType<typeof computeEngine> | null, entities: ChatEntity): ChatbotResponse {
  if (!result) return { text: MISSING_DATA, followUps: FALLBACK_SUGGESTIONS };
  if (!entities.subjectCode) return { text: AMBIGUOUS, followUps: FALLBACK_SUGGESTIONS };
  const s = result.subjects.find((subj) => subj.code === entities.subjectCode);
  if (!s) return { text: `I couldn\u2019t find that subject in your section.`, followUps: FALLBACK_SUGGESTIONS };

  const text = `${s.name} (${s.code}):\n\u2022 Current attendance: ${fmtPct(s.currentPct)} (${s.attended}/${s.conducted} classes)\n\u2022 Remaining: ${s.remaining} classes\n\u2022 Must attend for 75%: ${s.clampedNeeded75} of ${s.remaining}\n\u2022 Must attend for 90%: ${s.clampedNeeded90} of ${s.remaining}\n\u2022 Bunks allowed: ${s.bunksAllowed75} (for 75%) / ${s.bunksAllowed90} (for 90%)\n\u2022 Status: ${s.status}`;
  return {
    text,
    followUps: [`Can I still reach 90% in ${s.name}?`, `How many leaves can I take in ${s.name}?`, `What is my best possible final % in ${s.name}?`],
  };
}

function answerNeededFor(ctx: ChatbotContext, result: ReturnType<typeof computeEngine> | null, entities: ChatEntity, threshold: 75 | 90): ChatbotResponse {
  if (!result) return { text: IMPOSSIBLE_NO_INPUT, followUps: FALLBACK_SUGGESTIONS };

  if (entities.subjectCode) {
    const s = result.subjects.find((subj) => subj.code === entities.subjectCode);
    if (!s) return { text: `I couldn\u2019t find that subject.`, followUps: FALLBACK_SUGGESTIONS };
    const needed = threshold === 75 ? s.clampedNeeded75 : s.clampedNeeded90;
    const rawNeeded = threshold === 75 ? s.needed75 : s.needed90;
    const status = threshold === 75 ? s.status75 : s.status90;
    const bunks = threshold === 75 ? s.bunksAllowed75 : s.bunksAllowed90;

    if (status === 'IMPOSSIBLE') {
      return {
        text: `No \u2014 you cannot reach ${threshold}% in ${s.name}. Even if you attend all ${s.remaining} remaining classes, your maximum possible final attendance would be ${s.maxPossiblePct.toFixed(1)}%. You\u2019d need ${rawNeeded} more attended classes but only ${s.remaining} remain. This is an irreversible detention case.`,
        followUps: ['Why is this irreversible?', 'What is my riskiest subject?', 'How are leaves calculated?'],
      };
    }
    if (status === 'SAFE') {
      return {
        text: `You\u2019re already above ${threshold}% in ${s.name}! Your current attendance is ${fmtPct(s.currentPct)}. You can miss ${bunks} more classes and still stay above ${threshold}%.`,
        followUps: [`How many leaves can I take in ${s.name}?`, `What is my best possible final % in ${s.name}?`],
      };
    }
    return {
      text: `Yes \u2014 you can reach ${threshold}% in ${s.name}, but you must attend at least ${needed} of the remaining ${s.remaining} classes. You can miss up to ${bunks} more. Current: ${fmtPct(s.currentPct)}.`,
      followUps: [`How many leaves can I take in ${s.name}?`, `What is my riskiest subject?`, 'Can I skip tomorrow?'],
    };
  }

  // Aggregate
  const r = result.aggregate;
  const needed = threshold === 75 ? r.clampedNeeded75 : r.clampedNeeded90;
  const status = threshold === 75 ? r.status75 : r.status90;
  const bunks = threshold === 75 ? r.bunksAllowed75 : r.bunksAllowed90;

  if (status === 'IMPOSSIBLE') {
    return {
      text: `Unfortunately, reaching ${threshold}% overall is impossible. Even attending every remaining class, your maximum overall attendance would be ${r.maxPossiblePct.toFixed(1)}%. You\u2019d need ${threshold === 75 ? r.needed75 : r.needed90} classes but only ${r.remaining} remain.`,
      followUps: ['Why is this irreversible?', 'What is my riskiest subject?', 'How did you calculate this?'],
    };
  }
  return {
    text: `To reach ${threshold}% overall, you need to attend at least ${needed} of your remaining ${r.remaining} classes. You can safely miss ${bunks}. Current overall: ${fmtPct(r.currentPct)}.`,
    followUps: ['What is my riskiest subject?', 'Can I skip tomorrow?', 'How many leaves can I still take?'],
  };
}

function answerBunksLeft(ctx: ChatbotContext, result: ReturnType<typeof computeEngine> | null): ChatbotResponse {
  if (!result) return { text: IMPOSSIBLE_NO_INPUT, followUps: FALLBACK_SUGGESTIONS };
  const r = result.aggregate;
  const text = `Overall, you can safely miss ${r.bunksAllowed75} classes and still stay above 75%. For 90%, you can miss ${r.bunksAllowed90}.\n\nPer subject:\n${result.subjects.map((s) => `\u2022 ${s.name}: ${s.bunksAllowed75} bunks left (75%)`).join('\n')}`;
  return {
    text,
    followUps: ['Suggest a safe bunk', 'Can I skip tomorrow?', 'What is my riskiest subject?'],
  };
}

function answerSubjectBunksLeft(ctx: ChatbotContext, result: ReturnType<typeof computeEngine> | null, entities: ChatEntity): ChatbotResponse {
  if (!result) return { text: IMPOSSIBLE_NO_INPUT, followUps: FALLBACK_SUGGESTIONS };
  if (!entities.subjectCode) return { text: AMBIGUOUS, followUps: FALLBACK_SUGGESTIONS };
  const s = result.subjects.find((subj) => subj.code === entities.subjectCode);
  if (!s) return { text: `I couldn\u2019t find that subject.`, followUps: FALLBACK_SUGGESTIONS };
  return {
    text: `You can miss ${s.bunksAllowed75} more ${s.name} classes and stay above 75%. For 90%, you can miss ${s.bunksAllowed90}. You have ${s.remaining} classes remaining.`,
    followUps: [`Can I still reach 90% in ${s.name}?`, 'Suggest a safe bunk', 'Can I skip tomorrow?'],
  };
}

function answerRiskiestSubject(ctx: ChatbotContext, result: ReturnType<typeof computeEngine> | null): ChatbotResponse {
  if (!result) return { text: IMPOSSIBLE_NO_INPUT, followUps: FALLBACK_SUGGESTIONS };

  // Find subjects that are impossible first, then at risk with lowest maxPossiblePct
  const impossible = result.subjects.filter((s) => s.status === 'IMPOSSIBLE');
  if (impossible.length > 0) {
    const s = impossible[0];
    return {
      text: `Your riskiest subject is ${s.name}. Even if you attend every remaining class, your maximum possible final attendance is ${s.maxPossiblePct.toFixed(1)}%, so this is an irreversible detention case.`,
      followUps: ['Why is this irreversible?', 'How did you calculate this?', 'What is my current attendance?'],
    };
  }

  const atRisk = result.subjects.filter((s) => s.status === 'AT_RISK').sort((a, b) => a.maxPossiblePct - b.maxPossiblePct);
  if (atRisk.length > 0) {
    const s = atRisk[0];
    return {
      text: `Your riskiest subject is ${s.name}. Current: ${fmtPct(s.currentPct)}, max possible: ${s.maxPossiblePct.toFixed(1)}%. You must attend ${s.clampedNeeded75} of the remaining ${s.remaining} classes to stay above 75%.`,
      followUps: [`Can I still reach 90% in ${s.name}?`, `How many leaves can I take in ${s.name}?`, 'Suggest a safe bunk'],
    };
  }

  const safe = result.subjects.sort((a, b) => (a.currentPct ?? 100) - (b.currentPct ?? 100));
  return {
    text: `You\u2019re safe across all subjects. The one with the lowest attendance is ${safe[0].name} at ${fmtPct(safe[0].currentPct)}, but you\u2019re still above 75%.`,
    followUps: ['How many classes are left?', 'Can I skip tomorrow?', 'Suggest a safe bunk'],
  };
}

function answerIrreversibleCheck(ctx: ChatbotContext, result: ReturnType<typeof computeEngine> | null): ChatbotResponse {
  if (!result) return { text: IMPOSSIBLE_NO_INPUT, followUps: FALLBACK_SUGGESTIONS };
  const impossible = result.subjects.filter((s) => s.status === 'IMPOSSIBLE');
  if (impossible.length === 0) {
    return {
      text: `Good news \u2014 you\u2019re not in irreversible detention for any subject. Every subject can still be brought above 75% if you attend enough remaining classes.`,
      followUps: ['What is my riskiest subject?', 'How many classes are left?', 'Can I still reach 90%?'],
    };
  }
  const list = impossible.map((s) => `${s.name} (max possible: ${s.maxPossiblePct.toFixed(1)}%)`).join(', ');
  return {
    text: `Yes \u2014 you are in irreversible detention for ${impossible.length} subject${impossible.length > 1 ? 's' : ''}: ${list}. Even attending every remaining class won\u2019t bring you above 75%.`,
    followUps: ['Why is this irreversible?', 'How did you calculate this?', 'What is my riskiest subject?'],
  };
}

function answerNextLab(ctx: ChatbotContext): ChatbotResponse {
  const section = SECTIONS[ctx.sectionKey];
  if (!section) return { text: INTERNAL_ERROR, followUps: [] };
  const today = ctx.today;
  // Search forward for a day with LAB slot
  let cursor = today;
  for (let i = 0; i < 70; i++) {
    if (isTeachingDay(cursor)) {
      const dayName = getDayName(cursor);
      const periods = section.weekly[dayName];
      if (periods) {
        const labIndices: number[] = [];
        periods.forEach((sl, idx) => { if (sl === 'LAB') labIndices.push(idx); });
        if (labIndices.length > 0) {
          const labSlot = section.slots['LAB'];
          const timings = section.grid === 'firstYear' ?
            ['09.00-09.50','09.50-10.45','10.50-11.40','11.45-12.35','12.35-01.30','01.30-02.20','02.25-03.15','03.20-04.10','04.15-05.05'] :
            ['09.00-09.50','09.50-10.40','10.50-11.40','11.40-12.30','12.30-01.20','01.20-02.10','02.10-03.00','03.10-04.00','04.00-04.50'];
          const periods_str = labIndices.map((idx) => `P${idx + 1} (${timings[idx] || '?'})`).join(', ');
          return {
            text: `Your next lab is on ${formatLong(cursor)} (${dayName}). It\u2019s ${labSlot.name} (${labSlot.code}) during ${periods_str}.`,
            followUps: ['What classes do I have on Thursday?', 'How many classes are left?', 'Show my timetable for this week'],
          };
        }
      }
    }
    cursor = addDays(cursor, 1);
    if (cursor > SEMESTER.end) break;
  }
  return { text: `No lab sessions found in the remaining semester.`, followUps: [] };
}

function answerDayTimetable(ctx: ChatbotContext, entities: ChatEntity): ChatbotResponse {
  const section = SECTIONS[ctx.sectionKey];
  if (!section) return { text: INTERNAL_ERROR, followUps: [] };
  const dayName = entities.weekday;
  if (!dayName) return { text: AMBIGUOUS, followUps: FALLBACK_SUGGESTIONS };
  const periods = section.weekly[dayName];
  if (!periods) return { text: `No timetable found for ${dayName}.`, followUps: [] };

  const timings = section.grid === 'firstYear' ?
    ['09.00-09.50','09.50-10.45','10.50-11.40','11.45-12.35','12.35-01.30','01.30-02.20','02.25-03.15','03.20-04.10','04.15-05.05'] :
    ['09.00-09.50','09.50-10.40','10.50-11.40','11.40-12.30','12.30-01.20','01.20-02.10','02.10-03.00','03.10-04.00','04.00-04.50'];

  const lines: string[] = [];
  periods.forEach((sl, idx) => {
    if (!sl) return;
    const info = section.slots[sl];
    if (info) {
      lines.push(`P${idx + 1} (${timings[idx] || '?'}): ${info.name} (${info.code}) [${sl}]`);
    }
  });
  if (lines.length === 0) return { text: `You have no classes on ${dayName}.`, followUps: [] };
  return {
    text: `${dayName} timetable:\n${lines.join('\n')}`,
    followUps: ['When is my next lab?', 'Show my timetable for this week', 'How many classes are left?'],
  };
}

function answerWeekTimetable(ctx: ChatbotContext): ChatbotResponse {
  const section = SECTIONS[ctx.sectionKey];
  if (!section) return { text: INTERNAL_ERROR, followUps: [] };
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const lines: string[] = [];
  for (const day of days) {
    const periods = section.weekly[day];
    if (!periods) continue;
    const slots = periods.filter((s) => s).map((s) => s as string);
    const names = slots.map((s) => section.slots[s]?.name ?? s).join(', ');
    lines.push(`${day}: ${slots.length} classes \u2014 ${names}`);
  }
  return {
    text: `This week\u2019s timetable:\n${lines.join('\n')}`,
    followUps: ['When is my next lab?', 'What classes do I have on Thursday?', 'How many classes are left?'],
  };
}

function answerSkipDate(ctx: ChatbotContext, entities: ChatEntity): ChatbotResponse {
  if (!entities.date) return { text: `Which date are you thinking of skipping? Try saying "Can I skip tomorrow?" or "Can I skip October 10?"`, followUps: ['Can I skip tomorrow?', 'Can I take leave from Oct 10 to Oct 14?'] };
  const date = clampToSemester(entities.date);
  if (date < ctx.today) return { text: `${formatShort(date)} is in the past \u2014 you can\u2019t plan a leave for a day that\u2019s already happened.`, followUps: [] };
  if (!isTeachingDay(date)) return { text: `${formatLong(date)} is not a teaching day (weekend or holiday), so skipping it has no impact on your attendance.`, followUps: ['Can I skip tomorrow?', 'How many leaves can I still take?'] };

  const classes = getClassesOnDate(ctx.sectionKey, date);
  if (classes.slots.length === 0) return { text: `You have no classes on ${formatShort(date)}, so skipping has no impact.`, followUps: [] };

  if (!ctx.inputs.length || ctx.inputs.every((i) => i.conducted === 0)) {
    return { text: `You have ${classes.slots.length} classes on ${formatShort(date)}: ${classes.slots.map((s) => s.name).join(', ')}. Enter your attendance data to see the exact impact of skipping.`, followUps: ['What is my current attendance?', 'How many classes are left?'] };
  }

  // Use evaluateLeaveRange with single date
  const evalResult = evaluateLeaveRange(ctx.inputs, ctx.sectionKey, ctx.today, date, date);
  const verdictLabel = evalResult.verdict === 'APPROVED' ? 'Yes, you can safely skip' : evalResult.verdict === 'RISKY' ? 'It\u2019s risky to skip' : 'No \u2014 you cannot skip';
  const impactedLines = evalResult.impacts
    .filter((i) => i.status !== 'SAFE')
    .map((i) => `\u2022 ${i.name}: ${i.currentPct}% \u2192 ${i.projectedPct}% (${i.status})`);

  const text = `${verdictLabel} ${formatShort(date)}.\nYou\u2019d miss ${classes.slots.length} classes: ${classes.slots.map((s) => s.name).join(', ')}.\n${impactedLines.length > 0 ? `Impact:\n${impactedLines.join('\n')}` : 'No subject would drop below 75%.'}`;
  return {
    text,
    followUps: ['How many leaves can I still take?', 'Suggest a safe bunk', 'What is my riskiest subject?'],
  };
}

function answerSkipRange(ctx: ChatbotContext, entities: ChatEntity): ChatbotResponse {
  if (!entities.dateRange) return { text: `Which date range? Try "Can I take leave from October 10 to October 14?"`, followUps: ['Can I take leave from Oct 10 to Oct 14?', 'How many leaves can I still take?'] };
  const { from, to } = entities.dateRange;
  if (from > to) return { text: `The start date must be before the end date.`, followUps: [] };

  const evalResult = evaluateLeaveRange(ctx.inputs, ctx.sectionKey, ctx.today, from, to);
  const verdictLabel = evalResult.verdict === 'APPROVED' ? 'APPROVED \u2014 safe to take leave' : evalResult.verdict === 'RISKY' ? 'RISKY \u2014 some subjects at risk' : 'DENIED \u2014 would push you below 75%';
  const impactLines = evalResult.impacts
    .filter((i) => i.status !== 'SAFE')
    .map((i) => `\u2022 ${i.name}: ${i.currentPct}% \u2192 ${i.projectedPct}% (${i.status})`);

  return {
    text: `${verdictLabel} from ${formatShort(from)} to ${formatShort(to)}.\n${impactLines.length > 0 ? `Per-subject impact:\n${impactLines.join('\n')}` : 'All subjects stay above 75%.'}`,
    followUps: ['How many leaves can I still take?', 'Suggest a safe bunk', 'What is my riskiest subject?'],
  };
}

function answerSkipNextN(ctx: ChatbotContext, result: ReturnType<typeof computeEngine> | null, entities: ChatEntity): ChatbotResponse {
  if (!result) return { text: IMPOSSIBLE_NO_INPUT, followUps: FALLBACK_SUGGESTIONS };
  if (!entities.subjectCode) return { text: `Which subject? Try "If I miss the next 2 classes of Control Systems, what happens?"`, followUps: [] };
  const n = entities.classCount ?? 1;
  const s = result.subjects.find((subj) => subj.code === entities.subjectCode);
  if (!s) return { text: `I couldn\u2019t find that subject.`, followUps: [] };

  const projectedAttended = s.attended;
  const projectedConducted = s.conducted + n;
  const projectedR = Math.max(s.remaining - n, 0);
  const projectedPct = projectedConducted > 0 ? (projectedAttended / projectedConducted) * 100 : 0;
  const needed75After = neededForTarget(projectedAttended, projectedConducted, projectedR, 0.75);
  const status = getStatus(needed75After, projectedR);

  const statusText = status === 'IMPOSSIBLE' ? 'IRREVERSIBLE DETENTION' : status === 'AT_RISK' ? 'AT RISK' : 'SAFE';
  return {
    text: `If you miss the next ${n} ${s.name} class${n > 1 ? 'es' : ''}:\n\u2022 Attendance drops from ${fmtPct(s.currentPct)} to ${projectedPct.toFixed(1)}%\n\u2022 You\u2019d then need to attend ${Math.max(needed75After, 0)} of the remaining ${projectedR} classes for 75%\n\u2022 Status: ${statusText}`,
    followUps: [`How many leaves can I take in ${s.name}?`, 'Suggest a safe bunk', 'What is my riskiest subject?'],
  };
}

function answerExplainFormula(ctx: ChatbotContext, result: ReturnType<typeof computeEngine> | null, entities: ChatEntity): ChatbotResponse {
  if (!result) return { text: IMPOSSIBLE_NO_INPUT, followUps: FALLBACK_SUGGESTIONS };
  if (entities.subjectCode) {
    const s = result.subjects.find((subj) => subj.code === entities.subjectCode);
    if (!s) return { text: `I couldn\u2019t find that subject.`, followUps: [] };
    return {
      text: `Here\u2019s the math for ${s.name}:\n\nneeded(75%) = \u23080.75 \u00d7 (C + R) \u2212 A\u2309 = \u23080.75 \u00d7 (${s.conducted} + ${s.remaining}) \u2212 ${s.attended}\u2309 = \u23080.75 \u00d7 ${s.conducted + s.remaining} \u2212 ${s.attended}\u2309 = ${s.needed75}\n\nClamped to [0, R] = ${s.clampedNeeded75}.\nSince ${s.needed75} ${s.needed75 <= 0 ? '\u2264 0, status is SAFE' : s.needed75 <= s.remaining ? `\u2264 ${s.remaining}, status is AT_RISK` : `> ${s.remaining}, status is IMPOSSIBLE`}.\n\nBunks allowed = R \u2212 needed = ${s.remaining} \u2212 ${s.needed75} = ${s.bunksAllowed75}.`,
      followUps: [`Can I still reach 90% in ${s.name}?`, `How many leaves can I take in ${s.name}?`, 'Why is this irreversible?'],
    };
  }
  const r = result.aggregate;
  return {
    text: `Here\u2019s the math for your overall attendance:\n\nneeded(75%) = \u23080.75 \u00d7 (C + R) \u2212 A\u2309 = \u23080.75 \u00d7 (${r.conducted} + ${r.remaining}) \u2212 ${r.attended}\u2309 = ${r.needed75}\n\nClamped: ${r.clampedNeeded75}. Bunks allowed: ${r.bunksAllowed75}.\nCurrent: ${fmtPct(r.currentPct)}. Max possible: ${r.maxPossiblePct.toFixed(1)}%.`,
    followUps: ['What is my riskiest subject?', 'How many leaves can I still take?', 'Can I still reach 90%?'],
  };
}

function answerExplainIrreversible(ctx: ChatbotContext, result: ReturnType<typeof computeEngine> | null, entities: ChatEntity): ChatbotResponse {
  if (!result) return { text: IMPOSSIBLE_NO_INPUT, followUps: FALLBACK_SUGGESTIONS };
  const impossible = result.subjects.filter((s) => s.status === 'IMPOSSIBLE');
  if (impossible.length === 0) {
    return { text: `Irreversible detention means that even if you attend every single remaining class, your final attendance would still be below 75%. Right now, none of your subjects are in this state \u2014 you can still recover.`, followUps: ['What is my riskiest subject?', 'How many classes are left?'] };
  }
  const s = impossible[0];
  return {
    text: `Irreversible detention means even attending 100% of remaining classes won\u2019t get you above 75%.\n\nFor ${s.name}:\n\u2022 Attended (A) = ${s.attended}, Conducted (C) = ${s.conducted}, Remaining (R) = ${s.remaining}\n\u2022 Max possible final = (A + R) / (C + R) \u00d7 100 = (${s.attended} + ${s.remaining}) / (${s.conducted} + ${s.remaining}) \u00d7 100 = ${s.maxPossiblePct.toFixed(1)}%\n\u2022 Since ${s.maxPossiblePct.toFixed(1)}% < 75%, this is mathematically impossible to fix.`,
    followUps: ['How did you calculate this?', 'What is my riskiest subject?', 'How many classes are left?'],
  };
}

function answerSelectedSection(ctx: ChatbotContext): ChatbotResponse {
  const section = SECTIONS[ctx.sectionKey];
  if (!section) return { text: `No section selected.`, followUps: [] };
  return {
    text: `Your selected section is ${ctx.sectionKey} \u2014 ${section.label}, venue ${section.venue}. It has ${Object.keys(section.slots).length} subjects and uses the ${section.grid} timetable grid.`,
    followUps: ['What classes do I have on Thursday?', 'When is my next lab?', 'Show my timetable for this week'],
  };
}

function answerSelectedPlanDate(ctx: ChatbotContext): ChatbotResponse {
  return {
    text: `Your selected planning date is ${formatLong(ctx.planDate)}. You have ${(() => { try { return countOccurrences(ctx.sectionKey, ctx.today, ctx.planDate).total; } catch { return '?'; } })()} classes between today and that date.`,
    followUps: ['How many classes are left?', 'How many must I attend for 75%?', 'Can I skip tomorrow?'],
  };
}

function answerInputMode(ctx: ChatbotContext): ChatbotResponse {
  const modeDesc = ctx.mode === 'quick'
    ? 'Quick mode \u2014 you enter attendance percentages and the app auto-calculates conducted classes from the timetable.'
    : 'Precise mode \u2014 you enter exact attended and conducted class counts per subject.';
  const dataSummary = ctx.inputs.length > 0
    ? ` You have data for ${ctx.inputs.length} subjects${ctx.inputs.some((i) => i.conducted > 0) ? `, with attendance entered` : ', but no attendance entered yet'}.`
    : ' No attendance data entered yet.';
  return {
    text: `You\u2019re using ${modeDesc}.${dataSummary}`,
    followUps: ['How many classes are left?', 'What is my riskiest subject?', 'Can I still reach 90%?'],
  };
}

function answerSafeLeaveSuggestion(ctx: ChatbotContext): ChatbotResponse {
  if (!ctx.inputs.length || ctx.inputs.every((i) => i.conducted === 0)) {
    return { text: IMPOSSIBLE_NO_INPUT, followUps: ['What is my current attendance?', 'How many classes are left?'] };
  }
  const suggestions = suggestSafeLeaves(ctx.inputs, ctx.sectionKey, ctx.today, ctx.plannedLeaves);
  if (suggestions.length === 0) {
    return {
      text: `Unfortunately, there are no safe days to skip right now. Every remaining class is needed to keep you above 75% in at least one subject.`,
      followUps: ['What is my riskiest subject?', 'How many leaves can I still take?', 'Can I still reach 90%?'],
    };
  }
  const dateList = suggestions.slice(0, 8).map((d) => `\u2022 ${formatLong(d)}`).join('\n');
  return {
    text: `I can suggest ${suggestions.length} safe skip day${suggestions.length > 1 ? 's' : ''} where every subject stays above 75%:\n${dateList}${suggestions.length > 8 ? `\n...and ${suggestions.length - 8} more.` : ''}\n\nYou can apply these in the Leave Tracker tab.`,
    followUps: ['How many leaves can I still take?', 'What is my riskiest subject?', 'Can I skip tomorrow?'],
  };
}

function answerMostFrequent(ctx: ChatbotContext): ChatbotResponse {
  const section = SECTIONS[ctx.sectionKey];
  if (!section) return { text: INTERNAL_ERROR, followUps: [] };
  const freq = new Map<string, number>();
  for (const day of Object.keys(section.weekly)) {
    for (const sl of section.weekly[day]) {
      if (!sl) continue;
      const info = section.slots[sl];
      if (info) freq.set(info.name, (freq.get(info.name) ?? 0) + 1);
    }
  }
  const sorted = [...freq.entries()].sort((a, b) => b[1] - a[1]);
  const top = sorted.slice(0, 4).map(([name, count], i) => `${i + 1}. ${name} \u2014 ${count} classes/week`);
  return {
    text: `Your most frequent subjects:\n${top.join('\n')}`,
    followUps: ['How many classes are left?', 'When is my next lab?', 'Show my timetable for this week'],
  };
}

function answerBestPossible(ctx: ChatbotContext, result: ReturnType<typeof computeEngine> | null, entities: ChatEntity): ChatbotResponse {
  if (!result) return { text: IMPOSSIBLE_NO_INPUT, followUps: FALLBACK_SUGGESTIONS };
  if (entities.subjectCode) {
    const s = result.subjects.find((subj) => subj.code === entities.subjectCode);
    if (!s) return { text: `I couldn\u2019t find that subject.`, followUps: [] };
    return {
      text: `Your best possible final attendance in ${s.name} is ${s.maxPossiblePct.toFixed(1)}% \u2014 that\u2019s if you attend all ${s.remaining} remaining classes. Your worst case (attend nothing) is ${s.minPossiblePct.toFixed(1)}%. Current: ${fmtPct(s.currentPct)}.`,
      followUps: [`Can I still reach 90% in ${s.name}?`, `How many leaves can I take in ${s.name}?`, 'What is my riskiest subject?'],
    };
  }
  const r = result.aggregate;
  return {
    text: `Your best possible overall attendance is ${r.maxPossiblePct.toFixed(1)}% (attend everything). Worst case is ${r.minPossiblePct.toFixed(1)}% (attend nothing). Current: ${fmtPct(r.currentPct)}.`,
    followUps: ['Can I still reach 90%?', 'What is my riskiest subject?', 'How many leaves can I still take?'],
  };
}

/* ── Free room locator answers ─────────────────────────────── */

function getCurrentWeekday(ctx: ChatbotContext): string | null {
  const today = ctx.today;
  if (!isTeachingDay(today)) return null;
  return getDayName(today);
}

function formatTime(range: string): string {
  return range.replace(/\./g, ":");
}

function answerFreeRoomsNow(ctx: ChatbotContext): ChatbotResponse {
  const weekday = getCurrentWeekday(ctx);
  if (!weekday) {
    return {
      text: "It seems to be outside teaching hours or a weekend — all rooms should be free. Check the Free Class Locator page during class hours for live occupancy.",
      followUps: ["What classes do I have today?", "When is my next lab?"],
    };
  }

  const section = SECTIONS[ctx.sectionKey];
  const grid = section?.grid ?? "standard";
  const now = new Date();
  const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
  const periodIdx = getPeriodIndexFromTime(timeStr, grid);

  if (periodIdx === null) {
    return {
      text: "It's currently outside teaching hours. Classes run 09:00 to 04:50 (standard) or 05:05 (first year). All rooms are free right now.",
      followUps: ["What classes do I have today?", "When is my next lab?"],
    };
  }

  const freeRooms = getAllFreeRoomsAt(weekday, periodIdx);
  const timeRange = formatTime(getPeriodTimeRange(periodIdx, grid));

  if (freeRooms.length === 0) {
    return {
      text: `Right now (Period ${periodIdx + 1}, ${timeRange}), all classrooms are occupied. Try again in the next period or check the Free Class Locator page for a heatmap.`,
      followUps: ["What classes do I have today?", "When is my next lab?"],
    };
  }

  const topRooms = freeRooms.slice(0, 3).map((roomId) => {
    const room = ROOMS[roomId];
    const freeCount = getFreeConsecutivePeriods(roomId, weekday, periodIdx, grid);
    return `\u2022 ${room.displayName} (Floor ${room.floor}, cap ${room.capacity}) — free for ${freeCount} period${freeCount > 1 ? "s" : ""}`;
  }).join("\n");

  return {
    text: `Right now (Period ${periodIdx + 1}, ${timeRange}), these rooms are free:\n${topRooms}${freeRooms.length > 3 ? `\n...and ${freeRooms.length - 3} more.` : ""}`,
    followUps: ["Is IST 518 free?", "What classes do I have today?", "When is my next lab?"],
  };
}

function answerFreeRoomsAtTime(ctx: ChatbotContext, entities: ChatEntity): ChatbotResponse {
  if (!entities.timeStr) return { text: "What time? Try asking 'Free rooms at 10:50?'", followUps: ["Free rooms now", "Is IST 518 free?"] };
  const weekday = getCurrentWeekday(ctx);
  if (!weekday) {
    return {
      text: "It's a weekend or holiday — all rooms are free. Check back on a weekday for scheduled occupancy.",
      followUps: ["Free rooms now", "What classes do I have today?"],
    };
  }

  const section = SECTIONS[ctx.sectionKey];
  const grid = section?.grid ?? "standard";
  const periodIdx = getPeriodIndexFromTime(entities.timeStr, grid);

  if (periodIdx === null) {
    return {
      text: `${entities.timeStr} is outside teaching hours. Classes run 09:00 to 04:50 (standard) or 05:05 (first year).`,
      followUps: ["Free rooms now", "Is IST 518 free?"],
    };
  }

  const freeRooms = getAllFreeRoomsAt(weekday, periodIdx);
  const timeRange = formatTime(getPeriodTimeRange(periodIdx, grid));

  if (freeRooms.length === 0) {
    return {
      text: `At ${entities.timeStr} (Period ${periodIdx + 1}, ${timeRange}), all classrooms are occupied.`,
      followUps: ["Free rooms now", "Is IST 518 free?"],
    };
  }

  const list = freeRooms.slice(0, 5).map((roomId) => {
    const room = ROOMS[roomId];
    return `\u2022 ${room.displayName} (Floor ${room.floor})`;
  }).join("\n");

  return {
    text: `At ${entities.timeStr} (Period ${periodIdx + 1}, ${timeRange}), these rooms are available:\n${list}`,
    followUps: ["Free rooms now", "Is IST 518 free?", "What classes do I have today?"],
  };
}

function answerIsRoomFree(ctx: ChatbotContext, entities: ChatEntity): ChatbotResponse {
  if (!entities.roomId || !ROOMS[entities.roomId]) {
    return {
      text: "I can only look up rooms within the IST Block (IST 225, 227, 411, 518, 519, 602, 625). Try asking 'Which rooms are free now?' or 'Is IST 518 free?'",
      followUps: ["Free rooms now", "Is IST 518 free?"],
    };
  }

  const roomId = entities.roomId;
  const room = ROOMS[roomId];
  const weekday = getCurrentWeekday(ctx);

  if (!weekday) {
    return {
      text: `${room.displayName} is free — it's a weekend or holiday with no scheduled classes.`,
      followUps: ["Free rooms now", "What classes do I have today?"],
    };
  }

  const section = SECTIONS[ctx.sectionKey];
  const grid = section?.grid ?? "standard";
  const now = new Date();
  const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
  const periodIdx = getPeriodIndexFromTime(timeStr, grid);

  if (periodIdx === null) {
    return {
      text: `${room.displayName} is free right now — it's outside teaching hours.`,
      followUps: ["Free rooms now", "What classes do I have today?"],
    };
  }

  const snapshot = getOccupancySnapshot(weekday, periodIdx);
  const occupants = snapshot[roomId];

  if (occupants && occupants.length > 0) {
    const occList = occupants.map((o) => `${o.sectionKey} for ${o.subjectName}`).join(", ");
    return {
      text: `${room.displayName} is occupied right now. It's being used by ${occList}.`,
      followUps: ["Free rooms now", "Is IST 519 free?"],
    };
  }

  const freeCount = getFreeConsecutivePeriods(roomId, weekday, periodIdx, grid);
  const endPeriod = Math.min(periodIdx + freeCount - 1, PERIOD_TIMINGS[grid].length - 1);
  const endTime = getPeriodTimeRange(endPeriod, grid).split("-")[1].replace(/\./g, ":");
  return {
    text: `${room.displayName} is free right now! It's free for the next ${freeCount} period${freeCount > 1 ? "s" : ""} (until ${endTime}).`,
    followUps: ["Free rooms now", "Is IST 519 free?", "What classes do I have today?"],
  };
}

/* ── Proactive suggestions ────────────────────────────────── */

export function generateProactiveSuggestions(ctx: ChatbotContext): string[] {
  const suggestions: string[] = [];
  if (!ctx.hasData) {
    suggestions.push('What is my current attendance?');
    return suggestions;
  }

  try {
    const result = computeEngine(ctx.sectionKey, ctx.today, ctx.planDate, ctx.inputs);
    if (result.worstStatus === 'IMPOSSIBLE') {
      suggestions.push('Why am I in irreversible detention?');
      suggestions.push('What is my riskiest subject?');
    } else if (result.worstStatus === 'AT_RISK') {
      suggestions.push('What is my riskiest subject?');
      suggestions.push('Can I still reach 90%?');
    } else {
      suggestions.push('How many leaves can I still take?');
      suggestions.push('Can I skip tomorrow?');
    }

    if (result.aggregate.bunksAllowed75 <= 3 && result.aggregate.bunksAllowed75 > 0) {
      suggestions.push('Suggest a safe bunk');
    }

    const daysToPlan = Math.round((parseISO(ctx.planDate).getTime() - parseISO(ctx.today).getTime()) / (1000 * 60 * 60 * 24));
    if (daysToPlan > 14) {
      suggestions.push('How many classes are left till my planning date?');
    }
  } catch { /* ignore */ }

  if (suggestions.length === 0) {
    suggestions.push('How many classes are left?', 'Can I still reach 90%?', 'What is my riskiest subject?', 'Suggest a safe bunk');
  }

  return suggestions.slice(0, 4);
}

export function getEmptyStatePrompts(name: string | null): string[] {
  const greeting = name ? `Hi ${name}` : 'Hi there';
  return [
    `${greeting}, I can help you understand your attendance.`,
    'How many classes are left?',
    'What is my riskiest subject?',
    'Can I still reach 90%?',
    'How many leaves can I still take?',
  ];
}

export const QUICK_ACTIONS = [
  'Classes left',
  'Leaves left',
  'Can I reach 90%?',
  'Riskiest subject',
  'Next lab',
  'Why am I at risk?',
  'Suggest safe bunk',
  'Free rooms now',
  'Is IST 518 free?',
];
