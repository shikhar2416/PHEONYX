import { neededForTarget, getStatus } from './engine';
import { SEMESTER } from '@/data/timetables';
import { countOccurrences } from './engine';
import { addDays, clampToSemester } from './dates';

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT FAILED: ${msg}`);
  console.log(`  ✓ ${msg}`);
}

export function runEngineTests() {
  console.log('Running engine self-tests...');

  // Test 1: A=12, C=20, R=18, T=0.75 -> needed 17
  const n1 = neededForTarget(12, 20, 18, 0.75);
  assert(n1 === 17, `A=12,C=20,R=18,T=0.75 -> needed=${n1} (expected 17)`);
  assert(getStatus(n1, 18) === 'AT_RISK', `status is AT_RISK`);
  assert(18 - n1 === 1, `bunks left = ${18 - n1} (expected 1)`);

  // Test 2: A=12, C=20, R=18, T=0.90 -> needed 23 > 18 -> IMPOSSIBLE
  const n2 = neededForTarget(12, 20, 18, 0.90);
  assert(n2 === 23, `A=12,C=20,R=18,T=0.90 -> needed=${n2} (expected 23)`);
  assert(getStatus(n2, 18) === 'IMPOSSIBLE', `90% is IMPOSSIBLE`);

  // Test 3: A=0, C=30, R=10 -> 75% IMPOSSIBLE
  const n3 = neededForTarget(0, 30, 10, 0.75);
  assert(getStatus(n3, 10) === 'IMPOSSIBLE', `A=0,C=30,R=10 -> 75% IMPOSSIBLE (needed=${n3})`);

  // Test 4: A=C (100%) -> needed(0.75) <= 0 -> SAFE
  const n4 = neededForTarget(20, 20, 10, 0.75);
  assert(n4 <= 0, `A=C=20,R=10 -> needed=${n4} (expected <=0)`);
  assert(getStatus(n4, 10) === 'SAFE', `100% attendance is SAFE`);

  // Test 5: planDate == today -> remainingTillPlanDate == 0
  const today = clampToSemester('2026-09-15');
  const r1 = countOccurrences('III-ECE-A', today, today);
  const r2 = countOccurrences('III-ECE-A', today, addDays(today, -1));
  assert(r2.total === 0, `planDate==today -> remainingTillPlanDate==0 (got ${r2.total})`);

  // Test 6: planDate == semester end -> remainingTillPlanDate == remainingTillEnd
  const rEnd = countOccurrences('III-ECE-A', today, SEMESTER.end);
  const rEnd2 = countOccurrences('III-ECE-A', today, SEMESTER.end);
  assert(rEnd.total === rEnd2.total, `planDate==end -> remaining matches`);

  console.log('All engine self-tests passed.');
}

runEngineTests();
