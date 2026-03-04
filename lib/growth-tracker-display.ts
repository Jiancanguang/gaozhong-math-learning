import type { MasteryLevel } from '@/lib/growth-tracker';

export const MASTERY_LABELS: Record<MasteryLevel, string> = {
  mastered: '已掌握',
  partial: '部分掌握',
  weak: '薄弱'
};

export function getMasteryMeta(mastery: MasteryLevel | null) {
  switch (mastery) {
    case 'mastered':
      return { label: '已掌握', className: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200' };
    case 'partial':
      return { label: '部分掌握', className: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200' };
    case 'weak':
      return { label: '薄弱', className: 'bg-rose-50 text-rose-700 ring-1 ring-rose-200' };
    default:
      return { label: '--', className: 'bg-slate-100 text-slate-500 ring-1 ring-slate-200' };
  }
}

export function formatPerformanceStars(value: number | null) {
  if (value == null || value < 1) return '--';
  const full = Math.round(value);
  return '★'.repeat(full) + '☆'.repeat(5 - full);
}

export function formatEntryExitDelta(entry: number | null, exit: number | null) {
  if (entry == null || exit == null) return '--';
  const delta = exit - entry;
  if (delta === 0) return '±0';
  return delta > 0 ? `+${delta}` : `${delta}`;
}

export function formatScoreOutOf10(value: number | null) {
  if (value == null) return '--';
  return `${value}/10`;
}
