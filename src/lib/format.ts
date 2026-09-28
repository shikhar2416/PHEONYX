export function fmtNum(n: number, decimals = 0): string {
  return n.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function fmtPct(n: number | null, decimals = 1): string {
  if (n === null || isNaN(n)) return '—';
  return `${n.toFixed(decimals)}%`;
}

export function fmtPctRaw(n: number, decimals = 1): string {
  return `${n.toFixed(decimals)}%`;
}

export function clamp(n: number, min: number, max: number): number {
  return Math.min(Math.max(n, min), max);
}

export function pluralize(n: number, singular: string, plural?: string): string {
  return n === 1 ? singular : (plural ?? `${singular}s`);
}
