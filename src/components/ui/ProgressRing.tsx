interface ProgressRingProps {
  pct: number | null;
  size?: number;
  strokeWidth?: number;
  showLabel?: boolean;
}

export default function ProgressRing({ pct, size = 120, strokeWidth = 8, showLabel = true }: ProgressRingProps) {
  const value = pct ?? 0;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (circumference * value) / 100;
  const color = value >= 90 ? '#34D399' : value >= 75 ? '#FBBF24' : '#F43F5E';

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.6s ease' }}
        />
      </svg>
      {showLabel && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-bold font-heading text-white tabular-nums">
            {pct === null ? '—' : `${Math.round(value)}%`}
          </span>
        </div>
      )}
    </div>
  );
}
