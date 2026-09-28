import { Check } from 'lucide-react';

interface StepperProps {
  current: number;
  steps: string[];
  onStepClick?: (index: number) => void;
}

export default function Stepper({ current, steps, onStepClick }: StepperProps) {
  return (
    <div className="flex items-center justify-center gap-2 sm:gap-4 mb-8">
      {steps.map((step, i) => (
        <div key={step} className="flex items-center gap-2 sm:gap-4">
          <button
            onClick={() => onStepClick?.(i)}
            disabled={i > current}
            className="flex items-center gap-2 group disabled:cursor-not-allowed"
          >
            <div
              className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                i < current
                  ? 'bg-emerald-400 text-base-900'
                  : i === current
                    ? 'bg-gradient-to-br from-emerald-400 to-cyan-400 text-base-900 ring-4 ring-emerald-400/20'
                    : 'bg-white/5 border border-white/10 text-slate-500'
              }`}
            >
              {i < current ? <Check className="w-4 h-4" /> : i + 1}
            </div>
            <span
              className={`text-sm font-medium hidden sm:inline ${
                i === current ? 'text-white' : i < current ? 'text-emerald-400' : 'text-slate-500'
              }`}
            >
              {step}
            </span>
          </button>
          {i < steps.length - 1 && (
            <div
              className={`w-8 sm:w-16 h-0.5 rounded-full transition-colors ${
                i < current ? 'bg-emerald-400' : 'bg-white/10'
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}
