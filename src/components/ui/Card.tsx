import { type HTMLAttributes, type ReactNode } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  hover?: boolean;
}

export default function Card({ children, hover = false, className = '', ...props }: CardProps) {
  return (
    <div
      className={`glass-card bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl shadow-xl shadow-black/20 ${
        hover ? 'transition-all duration-300 hover:-translate-y-1 hover:border-white/20 hover:shadow-2xl hover:shadow-emerald-500/5' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
