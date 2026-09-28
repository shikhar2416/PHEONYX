import { answerQuery, generateProactiveSuggestions } from './chatbot';
import type { ChatbotContext } from './chatbotTypes';

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT FAILED: ${msg}`);
  console.log(`  \u2713 ${msg}`);
}

function makeCtx(overrides: Partial<ChatbotContext> = {}): ChatbotContext {
  return {
    profileName: 'Test Student',
    rollNumber: 'RA2411004010123',
    sectionKey: 'III-ECE-A',
    sectionLabel: 'III Year ECE-A',
    planDate: '2026-10-28',
    mode: 'quick',
    inputs: [],
    plannedLeaves: [],
    today: '2026-09-28',
    hasData: false,
    ...overrides,
  };
}

export function runChatbotTests() {
  console.log('Running chatbot tests...');

  // 1. No profile -> fallback asking to select
  const r1 = answerQuery('How many classes left?', makeCtx({ profileName: null }));
  assert(r1.text.includes("haven't selected a profile"), 'No profile -> profile fallback');

  // 2. No attendance entered -> missing data
  const r2 = answerQuery('How many classes left?', makeCtx({ hasData: false, inputs: [] }));
  assert(r2.text.includes('more information') || r2.text.includes('attendance'), 'No data -> missing data fallback');

  // 3. Out of scope question
  const r3 = answerQuery('Who won the FIFA World Cup?', makeCtx({ hasData: true, inputs: [{ code: '21ECC302T', attended: 12, conducted: 20 }] }));
  assert(r3.text.includes("can't reliably answer") || r3.text.includes('cannot'), 'Out of scope -> fallback');

  // 4. Subject typo matching: "control" -> Control Systems
  const r4 = answerQuery('What is my attendance in control?', makeCtx({
    hasData: true,
    inputs: [{ code: '21ECC304T', attended: 12, conducted: 20 }],
  }));
  assert(r4.text.includes('Control Systems') || r4.text.includes('21ECC304T'), 'Typo "control" -> Control Systems matched');

  // 5. Can I reach 90% in control -> resolved to Control Systems
  const r5 = answerQuery('Can I reach 90% in control?', makeCtx({
    hasData: true,
    inputs: [{ code: '21ECC304T', attended: 12, conducted: 20 }],
  }));
  assert(r5.text.includes('Control Systems') || r5.text.includes('90%'), 'Can reach 90% in control -> resolved');

  // 6. Can I skip tomorrow? -> returns actual impact
  const r6 = answerQuery('Can I skip tomorrow?', makeCtx({
    hasData: true,
    inputs: [{ code: '21ECC302T', attended: 12, conducted: 20 }],
  }));
  assert(r6.text.includes('skip') || r6.text.includes('classes'), 'Skip tomorrow -> impact answer');

  // 7. Irreversible case -> correct explanation
  const r7 = answerQuery('Am I in irreversible detention?', makeCtx({
    hasData: true,
    inputs: [{ code: '21ECC302T', attended: 0, conducted: 30 }],
  }));
  assert(r7.text.includes('irreversible') || r7.text.includes('IMPOSSIBLE') || r7.text.includes('cannot'), 'Irreversible case detected');

  // 8. Classes left till planning date
  const r8 = answerQuery('How many classes are left till my planning date?', makeCtx({
    hasData: true,
    inputs: [{ code: '21ECC302T', attended: 12, conducted: 20 }],
  }));
  assert(r8.text.includes('planning date') || r8.text.includes('classes'), 'Classes till plan date answered');

  // 9. Leaves left
  const r9 = answerQuery('How many leaves can I still take?', makeCtx({
    hasData: true,
    inputs: [{ code: '21ECC302T', attended: 12, conducted: 20 }],
  }));
  assert(r9.text.includes('miss') || r9.text.includes('bunks') || r9.text.includes('leave'), 'Leaves left answered');

  // 10. Riskiest subject
  const r10 = answerQuery('What is my riskiest subject?', makeCtx({
    hasData: true,
    inputs: [
      { code: '21ECC302T', attended: 12, conducted: 20 },
      { code: '21ECC304T', attended: 5, conducted: 20 },
    ],
  }));
  assert(r10.text.includes('riskiest') || r10.text.includes('risk'), 'Riskiest subject answered');

  // 11. Proactive suggestions
  const suggestions = generateProactiveSuggestions(makeCtx({
    hasData: true,
    inputs: [{ code: '21ECC302T', attended: 0, conducted: 30 }],
  }));
  assert(suggestions.length > 0 && suggestions.length <= 4, 'Proactive suggestions generated');

  // 12. Selected section
  const r12 = answerQuery('What is my selected section?', makeCtx({ hasData: true }));
  assert(r12.text.includes('III-ECE-A') || r12.text.includes('ECE'), 'Selected section answered');

  // 13. Next lab
  const r13 = answerQuery('When is my next lab?', makeCtx({ hasData: true }));
  assert(r13.text.includes('lab') || r13.text.includes('Lab'), 'Next lab answered');

  // 14. Day timetable
  const r14 = answerQuery('What classes do I have on Thursday?', makeCtx({ hasData: true }));
  assert(r14.text.includes('Thursday') || r14.text.includes('timetable'), 'Day timetable answered');

  // 15. Formula explanation
  const r15 = answerQuery('How did you calculate this?', makeCtx({
    hasData: true,
    inputs: [{ code: '21ECC302T', attended: 12, conducted: 20 }],
  }));
  assert(r15.text.includes('needed') || r15.text.includes('formula') || r15.text.includes('0.75'), 'Formula explained');

  console.log('All chatbot tests passed.');
}

runChatbotTests();
