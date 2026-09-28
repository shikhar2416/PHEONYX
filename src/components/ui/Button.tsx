import { type ButtonHTMLAttributes, forwardRef } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const variants: Record<Variant, string> = {
  primary: 'bg-gradient-to-r from-emerald-400 to-cyan-400 text-base-900 font-semibold hover:shadow-lg hover:shadow-emerald-500/25 hover:brightness-110',
  secondary: 'bg-white/10 text-white border border-white/15 hover:bg-white/15',
  ghost: 'text-slate-300 hover:text-white hover:bg-white/5',
  danger: 'bg-rose-500 text-white hover:bg-rose-600',
  outline: 'border border-emerald-400/50 text-emerald-400 hover:bg-emerald-400/10',
};

const sizes: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-sm rounded-lg',
  md: 'px-5 py-2.5 text-sm rounded-xl',
  lg: 'px-7 py-3.5 text-base rounded-xl',
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', className = '', children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={`inline-flex items-center justify-center gap-2 transition-all duration-200 active:scale-[0.97] disabled:opacity-50 disabled:pointer-events-none ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  },
);

Button.displayName = 'Button';
export default Button;
