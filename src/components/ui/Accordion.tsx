import { type ReactNode, useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface AccordionItem {
  question: string;
  answer: ReactNode;
}

interface AccordionProps {
  items: AccordionItem[];
}

export default function Accordion({ items }: AccordionProps) {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="flex flex-col gap-3">
      {items.map((item, i) => (
        <div
          key={i}
          className="glass-card bg-white/5 backdrop-blur-md border border-white/10 rounded-xl overflow-hidden"
        >
          <button
            onClick={() => setOpen(open === i ? null : i)}
            className="w-full flex items-center justify-between px-5 py-4 text-left transition-colors hover:bg-white/5"
            aria-expanded={open === i}
          >
            <span className="font-heading font-medium text-white text-sm sm:text-base">{item.question}</span>
            <ChevronDown
              className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${open === i ? 'rotate-180' : ''}`}
            />
          </button>
          <div
            className={`overflow-hidden transition-all duration-300 ${
              open === i ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
            }`}
          >
            <div className="px-5 pb-4 text-sm text-slate-300 leading-relaxed">{item.answer}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
