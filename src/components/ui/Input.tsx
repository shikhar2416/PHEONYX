import { type InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label className="text-xs font-medium text-slate-400">{label}</label>
        )}
        <input
          ref={ref}
          className={`px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder:text-slate-500 transition-colors focus:border-emerald-400/50 focus:bg-white/10 ${
            error ? 'border-rose-500/50' : ''
          } ${className}`}
          {...props}
        />
        {error && <span className="text-xs text-rose-400">{error}</span>}
      </div>
    );
  },
);

Input.displayName = 'Input';
export default Input;
