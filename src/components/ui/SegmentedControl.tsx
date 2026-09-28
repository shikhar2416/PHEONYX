interface SegmentedControlProps {
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export default function SegmentedControl({ options, value, onChange, className = '' }: SegmentedControlProps) {
  return (
    <div className={`inline-flex p-1 rounded-xl bg-white/5 border border-white/10 ${className}`}>
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
            value === opt.value
              ? 'bg-gradient-to-r from-emerald-400 to-cyan-400 text-base-900 shadow-lg shadow-emerald-500/20'
              : 'text-slate-300 hover:text-white hover:bg-white/5'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
