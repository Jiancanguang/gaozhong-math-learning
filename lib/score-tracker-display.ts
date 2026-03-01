import { SUBJECT_LABELS, type StudentTrendLabel, type SubjectDelta, type SubjectScore } from '@/lib/score-tracker';

export function formatScore(value: number | null | undefined) {
  if (value === null || value === undefined) return '--';
  return Number.isInteger(value) ? `${value}` : value.toFixed(2);
}

export function formatRank(value: number | null | undefined) {
  if (value === null || value === undefined) return '--';
  return `${value}`;
}

export function formatScoreDelta(value: number | null | undefined) {
  if (value === null || value === undefined) return '--';
  if (value === 0) return '0';
  return `${value > 0 ? '+' : ''}${formatScore(value)}`;
}

export function formatRankDelta(value: number | null | undefined) {
  if (value === null || value === undefined) return '--';
  if (value > 0) return `提升 ${value} 名`;
  if (value < 0) return `下降 ${Math.abs(value)} 名`;
  return '持平';
}

export function summarizeSubjectScores(subjectScores: SubjectScore[]) {
  if (subjectScores.length === 0) return '未录入科目成绩';
  return subjectScores.map((item) => `${SUBJECT_LABELS[item.subject]} ${formatScore(item.score)}`).join(' / ');
}

export function describeSubjectDelta(item: SubjectDelta | null, emptyText: string) {
  if (!item) return emptyText;
  return `${item.label} ${formatScoreDelta(item.delta)}`;
}

export function getTrendMeta(trend: StudentTrendLabel) {
  switch (trend) {
    case 'up':
      return {
        label: '上升',
        className: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
      };
    case 'down':
      return {
        label: '下降',
        className: 'bg-rose-50 text-rose-700 ring-1 ring-rose-200'
      };
    case 'flat':
      return {
        label: '持平',
        className: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200'
      };
    default:
      return {
        label: '待观察',
        className: 'bg-slate-100 text-slate-700 ring-1 ring-slate-200'
      };
  }
}
