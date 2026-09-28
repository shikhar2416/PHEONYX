import { type ReactNode } from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface AlertProps {
  variant: 'danger' | 'warning' | 'info' | 'success';
  children: ReactNode;
  onClose?: () => void;
  className?: string;
}

const variants = {
  danger: 'bg-rose-500/10 border-rose-500/40 text-rose-200',
  warning: 'bg-amber-500/10 border-amber-500/40 text-amber-200',
  info: 'bg-cyan-500/10 border-cyan-500/40 text-cyan-200',
  success: 'bg-emerald-500/10 border-emerald-500/40 text-emerald-200',
};

export default function Alert({ variant, children, onClose, className = '' }: AlertProps) {
  return (
    <div className={`flex items-start gap-3 px-4 py-3 rounded-xl border ${variants[variant]} ${className}`}>
      <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
      <div className="flex-1 text-sm">{children}</div>
      {onClose && (
        <button onClick={onClose} className="text-current opacity-60 hover:opacity-100">
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
