interface Option {
  value: string;
  label: string;
}

interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  label?: string;
  className?: string;
}

export default function Select({ value, onChange, options, label, className = '' }: SelectProps) {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && <label className="text-xs font-medium text-slate-400">{label}</label>}
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none px-3 py-2.5 pr-10 rounded-lg bg-white/5 border border-white/10 text-white text-sm transition-colors focus:border-emerald-400/50 focus:bg-white/10 cursor-pointer"
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-base-800 text-white">
              {opt.label}
            </option>
          ))}
        </select>
        <svg
          className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none"
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  );
}
