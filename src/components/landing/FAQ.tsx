import Accordion from '@/components/ui/Accordion';

const items = [
  {
    question: 'Why do you ask for total conducted classes?',
    answer:
      'A percentage alone is not enough to compute future requirements — the denominator matters. 80% of 10 classes is very different from 80% of 50. In Quick mode we auto-derive the denominator from your section\'s timetable. In Precise mode you enter the exact numbers your portal shows.',
  },
  {
    question: 'How is the "must attend" number calculated?',
    answer:
      'We use the formula: needed = ceil(target × (conducted + remaining) − attended). For 75% detention, target = 0.75. The result is clamped to [0, remaining]. If it exceeds remaining, recovery is mathematically impossible.',
  },
  {
    question: 'What does "Irreversible Detention" mean?',
    answer:
      'It means even if you attend every single remaining class in the semester, your attendance cannot reach 75%. The alert shows the exact arithmetic so you understand why — for example, you would need 23 classes but only 18 remain.',
  },
  {
    question: 'Is my data stored anywhere?',
    answer:
      'No. Everything lives in your browser\'s localStorage. There is no backend, no login, no tracking. Clearing your browser data resets everything. You can also use the Reset button on the dashboard.',
  },
  {
    question: 'Can I plan for a specific future date?',
    answer:
      'Yes. The date picker lets you choose any date between today and 29 Nov 2026. The app shows how many classes remain until that date, so you can plan around mid-sem, festivals, or any commitment.',
  },
];

export default function FAQ() {
  return (
    <section className="py-16 sm:py-24">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <div className="text-center mb-10">
          <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">FAQ</span>
          <h2 className="mt-2 text-3xl sm:text-4xl font-bold font-heading text-white">
            Questions, answered
          </h2>
        </div>
        <Accordion items={items} />
      </div>
    </section>
  );
}
